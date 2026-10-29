import { existsSync } from 'node:fs';
import { mkdir, cp, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import type { AgentToolOption } from '@/core/agent/tools.js';
import { resolveToolDestinationPaths } from '@/core/agent/tools.js';
import type { ProgramDeps } from '@/cli/deps.js';
import { updateGitignore } from '@/core/init/gitignore.js';
import { buildPrGitCommandContent } from '@/core/templates/agent-workflows.js';
import { CommandAdapterRegistry } from '@/core/command-generation/registry.js';
import { generateCommand } from '@/core/command-generation/generator.js';
import { normalizeStructureCommandPath } from '@/core/agent/command-path.js';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';
import { SKILLS } from '@assets/agents/skills/index.js';
import { fetchSkillContentFromGitHub } from './remote/github-fetcher.js';
import { syncGlobalSkillsManifest } from './manifest-bridge.js';
import { saveSkillToLockfile } from './remote/lockfile.js';
import { recordInstalledAssetsBatch } from '@/core/assets/lockfile.js';
import { installSkillViaSkillsCli } from './remote/skills-sh-installer.js';

const skillsDir = join(resolvePackageRoot(import.meta.url), 'assets/agents/skills');

export interface ExistingSkill {
    toolId: string;
    toolName: string;
    skillName: string;
    destPath: string;
    exists: boolean;
}

export interface SkillInstallResult {
    toolId: string;
    toolName: string;
    skillName: string;
    status: 'success' | 'overwritten' | 'skipped' | 'failed';
    error?: string;
}

export const checkExistingSkills = async (
    projectDir: string,
    selectedTools: AgentToolOption[],
    skillNames: string[],
    isGlobal = false,
): Promise<ExistingSkill[]> => {
    const results: ExistingSkill[] = [];
    for (const tool of selectedTools) {
        if (!tool.skillsDir) continue;
        for (const skillName of skillNames) {
            const toolSkillsDir = resolveToolDestinationPaths(tool, 'skills', projectDir, isGlobal);
            const destPath = join(toolSkillsDir, skillName);
            const exists = existsSync(join(destPath, 'SKILL.md'));
            results.push({
                toolId: tool.value,
                toolName: tool.name,
                skillName,
                destPath,
                exists,
            });
        }
    }
    return results;
};

export const installSkills = async (request: {
    deps: ProgramDeps;
    projectDir: string;
    selectedTools: AgentToolOption[];
    skillNames: string[];
    overwriteList?: string[]; // array of "toolId:skillName"
    noIgnore?: boolean;
    isGlobal?: boolean;
}): Promise<SkillInstallResult[]> => {
    const { deps, projectDir, selectedTools, skillNames, overwriteList = [], noIgnore = false, isGlobal = false } = request;
    const results: SkillInstallResult[] = [];

    const existingChecks = await checkExistingSkills(projectDir, selectedTools, skillNames, isGlobal);

    for (const tool of selectedTools) {
        if (!tool.skillsDir) continue;

        for (const skillName of skillNames) {
            const check = existingChecks.find((c) => c.toolId === tool.value && c.skillName === skillName);
            const exists = check ? check.exists : false;

            if (exists) {
                const identifier = `${tool.value}:${skillName}`;
                if (!overwriteList.includes(identifier)) {
                    results.push({
                        toolId: tool.value,
                        toolName: tool.name,
                        skillName,
                        status: 'skipped',
                    });
                    continue;
                }
            }

            const toolSkillsDir = resolveToolDestinationPaths(tool, 'skills', projectDir, isGlobal);
            const destPath = join(toolSkillsDir, skillName);
            const srcPath = join(skillsDir, skillName);

            try {
                await mkdir(toolSkillsDir, { recursive: true });
                await mkdir(destPath, { recursive: true });

                const manifest = SKILLS.find((s) => s.name === skillName);

                if (manifest?.sourceType === 'skills.sh' && manifest.source) {
                    await installSkillViaSkillsCli({
                        projectDir,
                        source: manifest.source,
                        skillName,
                        selectedTools: [tool],
                        isGlobal,
                    });
                    await saveSkillToLockfile(
                        projectDir,
                        skillName,
                        {
                            name: skillName,
                            description: manifest.description,
                            source: manifest.source,
                            sourceType: 'skills.sh',
                            computedHash: 'skills.sh-managed',
                        },
                        isGlobal,
                    );
                } else if (manifest?.sourceType === 'github' && manifest.source && manifest.skillPath) {
                    // Fetch remote skill from GitHub (legacy fallback)
                    const { content, hash } = await fetchSkillContentFromGitHub(manifest.source, manifest.skillPath);
                    await writeFile(join(destPath, 'SKILL.md'), content, 'utf-8');
                    await saveSkillToLockfile(
                        projectDir,
                        skillName,
                        {
                            name: skillName,
                            description: manifest.description,
                            source: manifest.source,
                            sourceType: 'github',
                            skillPath: manifest.skillPath,
                            computedHash: hash,
                        },
                        isGlobal,
                    );
                } else if (existsSync(srcPath)) {
                    // Copy local built-in skill
                    await cp(srcPath, destPath, { recursive: true, force: true });
                } else {
                    throw new Error(`Skill source not found for '${skillName}'`);
                }

                let commandContent = null;
                let commandId = '';
                if (skillName === 'only-one-pr-git') {
                    commandContent = buildPrGitCommandContent();
                    commandId = 'only-one-pr-git';
                }

                if (commandContent && commandId) {
                    const commandAdapter = CommandAdapterRegistry.get(tool.value);
                    if (commandAdapter) {
                        const generated = generateCommand(commandContent, commandAdapter);
                        const relativePath = normalizeStructureCommandPath(generated.path, commandId);
                        const commandPath =
                            isGlobal && tool.globalSkillsDir
                                ? join(resolveToolDestinationPaths(tool, 'workflows', projectDir, isGlobal), basename(relativePath))
                                : join(projectDir, relativePath);
                        await mkdir(dirname(commandPath), { recursive: true });
                        await writeFile(commandPath, generated.content, 'utf-8');
                    }
                }

                results.push({
                    toolId: tool.value,
                    toolName: tool.name,
                    skillName,
                    status: exists ? 'overwritten' : 'success',
                });
            } catch (error: any) {
                results.push({
                    toolId: tool.value,
                    toolName: tool.name,
                    skillName,
                    status: 'failed',
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
    }

    if (!noIgnore && !isGlobal && selectedTools.length > 0) {
        try {
            await updateGitignore(projectDir);
        } catch (error) {
            deps.stdout(`Warning: Failed to update .gitignore: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    const successfulSkills = results.filter((r) => r.status === 'success' || r.status === 'overwritten');
    if (successfulSkills.length > 0) {
        const uniqueSkillNames = Array.from(new Set(successfulSkills.map((s) => s.skillName)));
        const entries = uniqueSkillNames.map((sName) => {
            const manifest = SKILLS.find((m) => m.name === sName);
            return {
                type: 'skills' as const,
                id: sName,
                version: manifest?.version || '0.0.1',
            };
        });
        await recordInstalledAssetsBatch(projectDir, entries, isGlobal);
    }

    if (isGlobal) {
        await syncGlobalSkillsManifest(projectDir);
    }

    return results;
};
