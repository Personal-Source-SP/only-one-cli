import { existsSync } from 'node:fs';
import { mkdir, cp, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AgentToolOption } from '@/core/agent/tools.js';
import type { ProgramDeps } from '@/cli/deps.js';
import { updateGitignore } from '@/core/init/gitignore.js';
import { buildPrGitCommandContent, buildClockifyCommandContent } from '@/core/templates/agent-workflows.js';
import { CommandAdapterRegistry } from '@/core/command-generation/registry.js';
import { generateCommand } from '@/core/command-generation/generator.js';
import { normalizeStructureCommandPath } from '@/core/agent/command-path.js';

const skillsDir = fileURLToPath(new URL('../../../assets/skills', import.meta.url));

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
): Promise<ExistingSkill[]> => {
    const results: ExistingSkill[] = [];
    for (const tool of selectedTools) {
        if (!tool.skillsDir) continue;
        for (const skillName of skillNames) {
            const destPath = join(tool.skillsDir, 'skills', skillName);
            const absoluteDestPath = join(projectDir, destPath);
            const exists = existsSync(absoluteDestPath);
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
}): Promise<SkillInstallResult[]> => {
    const { deps, projectDir, selectedTools, skillNames, overwriteList = [], noIgnore = false } = request;
    const results: SkillInstallResult[] = [];
    const gitignorePaths: string[] = [];

    const existingChecks = await checkExistingSkills(projectDir, selectedTools, skillNames);

    for (const tool of selectedTools) {
        if (!tool.skillsDir) continue;
        gitignorePaths.push(tool.skillsDir);

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

            const toolSkillsDir = join(projectDir, tool.skillsDir, 'skills');
            const destPath = join(toolSkillsDir, skillName);
            const srcPath = join(skillsDir, skillName);

            try {
                await mkdir(toolSkillsDir, { recursive: true });
                await cp(srcPath, destPath, { recursive: true, force: true });

                let commandContent = null;
                let commandId = '';
                if (skillName === 'only-one-pr-git-skill') {
                    commandContent = buildPrGitCommandContent();
                    commandId = 'only-one-pr-git';
                } else if (skillName === 'only-one-clockify-skill') {
                    commandContent = buildClockifyCommandContent();
                    commandId = 'only-one-clockify';
                }

                if (commandContent && commandId) {
                    const commandAdapter = CommandAdapterRegistry.get(tool.value);
                    if (commandAdapter) {
                        const generated = generateCommand(commandContent, commandAdapter);
                        const relativePath = normalizeStructureCommandPath(generated.path, commandId);
                        const commandPath = join(projectDir, relativePath);
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

    if (!noIgnore && gitignorePaths.length > 0) {
        const uniquePaths = Array.from(new Set(gitignorePaths));
        try {
            await updateGitignore(projectDir, uniquePaths);
        } catch (error) {
            deps.stdout(`Warning: Failed to update .gitignore: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    return results;
};
