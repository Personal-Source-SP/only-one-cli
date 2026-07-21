import { existsSync } from 'node:fs';
import { cp } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { AgentToolOption } from '@/core/agent/tools.js';
import type { ProgramDeps } from '@/cli/deps.js';
import type { ComboManifest, PackageManifest } from '@/core/init/types.js';
import { checkExistingSkills, installSkills, type SkillInstallResult } from '@/core/skill/index.js';
import { checkExistingMcps, syncMcpGlobalConfig, readMcpManifests } from '@/core/mcp/index.js';
import { COMBOS } from '@assets/combos/index.js';
import { PACKAGES } from '@assets/packages/index.js';
import { CONFIGS } from '@assets/configs/index.js';

const execFileAsync = promisify(execFile);

import { resolvePackageRoot } from '@/core/runtime/package-root.js';

const configsDir = join(resolvePackageRoot(import.meta.url), 'assets/configs');

export interface ExtendedComboManifest extends ComboManifest {
    id: string;
    mcps?: string[];
}

export interface ExistingComboComponent {
    type: 'package' | 'skill' | 'config' | 'mcp';
    id: string; // e.g. "package:@fission-ai/openspec", "skill:cursor:c4-diagrams", "config:openspec", "mcp:cursor:github"
    name: string; // Name of package, skill, config, or mcp
    toolId?: string; // If skill/mcp, which tool/ide
    label: string; // User-friendly description
    exists: boolean;
    meta: any;
}

export interface ComboInstallResult {
    packages: { name: string; status: 'success' | 'skipped' | 'failed'; error?: string }[];
    configs: { name: string; status: 'success' | 'skipped' | 'failed'; error?: string }[];
    skills: SkillInstallResult[];
    mcps: { ideId: string; mcpId: string; status: 'success' | 'skipped' | 'failed'; error?: string }[];
}

export const readComboManifests = async (): Promise<ExtendedComboManifest[]> => {
    return COMBOS;
};

export const readPackageManifests = async (): Promise<PackageManifest[]> => {
    return PACKAGES;
};

export const isPackageInstalled = async (name: string, scope: 'global' | 'local', projectDir: string): Promise<boolean> => {
    try {
        const args = ['list', name, '--depth=0'];
        if (scope === 'global') args.push('-g');
        await execFileAsync('npm', args, { cwd: projectDir, shell: true });
        return true;
    } catch {
        return false;
    }
};

export const npmInstall = async (name: string, scope: 'global' | 'local', projectDir: string): Promise<boolean> => {
    const args = ['install', name];
    if (scope === 'global') args.push('-g');
    try {
        await execFileAsync('npm', args, { cwd: projectDir, timeout: 120000, shell: true });
        return true;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`npm install failed for ${name}: ${message}`);
    }
};

export const checkExistingComboComponents = async (params: {
    projectDir: string;
    homeDir: string;
    platform: NodeJS.Platform;
    selectedTools: AgentToolOption[];
    combo: ExtendedComboManifest;
}): Promise<ExistingComboComponent[]> => {
    const { projectDir, homeDir, platform, selectedTools, combo } = params;
    const results: ExistingComboComponent[] = [];

    // 1. Packages
    if (combo.packages) {
        const pkgManifests = await readPackageManifests();
        for (const pkgName of combo.packages) {
            const pkg = pkgManifests.find((m) => m.name === pkgName) || { name: pkgName, scope: 'global' as const };
            const scope = pkg.scope ?? 'global';
            const exists = await isPackageInstalled(pkgName, scope, projectDir);
            results.push({
                type: 'package',
                id: `package:${pkgName}`,
                name: pkgName,
                label: `Package: ${pkgName} (${scope})`,
                exists,
                meta: { pkgName, scope },
            });
        }
    }

    // 2. Configs
    if (combo.configs) {
        for (const configName of combo.configs) {
            const exists = existsSync(join(projectDir, configName));
            results.push({
                type: 'config',
                id: `config:${configName}`,
                name: configName,
                label: `Config Template: ${configName}`,
                exists,
                meta: { configName },
            });
        }
    }

    // 3. Skills
    if (combo.skills && selectedTools.length > 0) {
        const skillChecks = await checkExistingSkills(projectDir, selectedTools, combo.skills);
        for (const check of skillChecks) {
            results.push({
                type: 'skill',
                id: `skill:${check.toolId}:${check.skillName}`,
                name: check.skillName,
                toolId: check.toolId,
                label: `Skill: ${check.skillName} in ${check.toolName}`,
                exists: check.exists,
                meta: { skillName: check.skillName, toolId: check.toolId },
            });
        }
    }

    // 4. MCPs (Explicit + Inferred from skills)
    const mcps = new Set<string>(combo.mcps || []);
    if (combo.skills) {
        if (combo.skills.includes('only-one-pr-git-skill')) mcps.add('github');
        if (combo.skills.includes('only-one-clockify-skill')) mcps.add('clockify');
    }

    if (mcps.size > 0 && selectedTools.length > 0) {
        const mcpIdeIds = selectedTools.map((t) => t.value).filter((val) => val === 'cursor' || val === 'antigravity');
        if (mcpIdeIds.length > 0) {
            const mcpChecks = await checkExistingMcps(homeDir, platform, mcpIdeIds, Array.from(mcps));
            for (const check of mcpChecks) {
                results.push({
                    type: 'mcp',
                    id: `mcp:${check.ideId}:${check.mcpId}`,
                    name: check.mcpId,
                    toolId: check.ideId,
                    label: `MCP Config: ${check.mcpId} in ${check.ideName}`,
                    exists: check.exists,
                    meta: { mcpId: check.mcpId, ideId: check.ideId },
                });
            }
        }
    }

    return results;
};

export const installCombo = async (params: {
    deps: ProgramDeps;
    projectDir: string;
    homeDir: string;
    platform: NodeJS.Platform;
    selectedTools: AgentToolOption[];
    combo: ExtendedComboManifest;
    overwriteList?: string[]; // list of existing component ids that user confirmed to overwrite
    noIgnore?: boolean;
}): Promise<ComboInstallResult> => {
    const { deps, projectDir, homeDir, platform, selectedTools, combo, overwriteList = [], noIgnore = false } = params;
    const results: ComboInstallResult = { packages: [], configs: [], skills: [], mcps: [] };

    // Get existing component info
    const checks = await checkExistingComboComponents({ projectDir, homeDir, platform, selectedTools, combo });

    // 1. Packages
    if (combo.packages) {
        for (const pkgName of combo.packages) {
            const check = checks.find((c) => c.type === 'package' && c.name === pkgName);
            const exists = check ? check.exists : false;

            if (exists && !overwriteList.includes(`package:${pkgName}`)) {
                results.packages.push({ name: pkgName, status: 'skipped' });
                continue;
            }

            const pkgManifests = await readPackageManifests();
            const pkg = pkgManifests.find((m) => m.name === pkgName) || { name: pkgName, scope: 'global' as const };
            const scope = pkg.scope ?? 'global';

            deps.stdout(`  Installing package ${pkgName}...`);
            try {
                await npmInstall(pkgName, scope, projectDir);
                results.packages.push({ name: pkgName, status: 'success' });
            } catch (err: any) {
                results.packages.push({
                    name: pkgName,
                    status: 'failed',
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }

        // Post install check for openspec CLI
        const packagesInstalled = results.packages.filter((p) => p.status === 'success').map((p) => p.name);
        if (packagesInstalled.includes('@fission-ai/openspec')) {
            deps.stdout('\nInitializing OpenSpec CLI...');
            const toolIds = selectedTools.map((t) => t.value).join(',');
            const toolsArg = toolIds || 'none';
            try {
                deps.stdout(`  Running: npx openspec init --tools ${toolsArg} --force`);
                await execFileAsync('npx', ['openspec', 'init', '--tools', toolsArg, '--force'], { cwd: projectDir, shell: true });
                deps.stdout('    ✓ OpenSpec CLI initialized successfully');
            } catch (error) {
                deps.stdout(`    ✗ OpenSpec CLI initialization failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    // 2. Configs
    if (combo.configs && existsSync(configsDir)) {
        try {
            for (const configName of combo.configs) {
                const check = checks.find((c) => c.type === 'config' && c.name === configName);
                const exists = check ? check.exists : false;

                if (exists && !overwriteList.includes(`config:${configName}`)) {
                    results.configs.push({ name: configName, status: 'skipped' });
                    continue;
                }

                const configEntry = CONFIGS[configName];
                if (configEntry?.files) {
                    let success = true;
                    let errorMsg = '';
                    for (const fileEntry of configEntry.files) {
                        const srcPath = join(configsDir, fileEntry.src);
                        const destPath = join(projectDir, fileEntry.dest);
                        if (existsSync(srcPath)) {
                            try {
                                await cp(srcPath, destPath, { recursive: true, force: true });
                            } catch (err: any) {
                                success = false;
                                errorMsg = err.message;
                            }
                        }
                    }
                    results.configs.push({
                        name: configName,
                        status: success ? 'success' : 'failed',
                        ...(success ? {} : { error: errorMsg }),
                    });
                }
            }
        } catch (err: any) {
            deps.stdout(`Warning: Failed to load config templates: ${err.message}`);
        }
    }

    // 3. Skills
    if (combo.skills && selectedTools.length > 0) {
        // Map the combo overwriteList to the format expected by installSkills ("toolId:skillName")
        const skillOverwrites = overwriteList.filter((item) => item.startsWith('skill:')).map((item) => item.substring(6)); // strip "skill:" prefix

        const skillResults = await installSkills({
            deps,
            projectDir,
            selectedTools,
            skillNames: combo.skills,
            overwriteList: skillOverwrites,
            noIgnore,
        });
        results.skills = skillResults;
    }

    // 4. MCPs
    const mcps = new Set<string>(combo.mcps || []);
    if (combo.skills) {
        if (combo.skills.includes('only-one-pr-git-skill')) mcps.add('github');
        if (combo.skills.includes('only-one-clockify-skill')) mcps.add('clockify');
    }

    if (mcps.size > 0 && selectedTools.length > 0) {
        const mcpIdeIds = selectedTools.map((t) => t.value).filter((val) => val === 'cursor' || val === 'antigravity');
        if (mcpIdeIds.length > 0) {
            const { manifests } = await readMcpManifests();
            const selectedManifests = manifests.filter((m) => mcps.has(m.id));

            if (selectedManifests.length > 0) {
                // Map the combo overwriteList to the format expected by syncMcpGlobalConfig ("ideId:mcpId")
                const mcpOverwrites = overwriteList.filter((item) => item.startsWith('mcp:')).map((item) => item.substring(4)); // strip "mcp:" prefix

                try {
                    const mcpResponse = await syncMcpGlobalConfig({
                        cwd: projectDir,
                        homeDir,
                        ideIds: mcpIdeIds,
                        manifests: selectedManifests,
                        platform,
                        write: () => {}, // run silently during combo
                        overwriteList: mcpOverwrites,
                    });

                    for (const mcpResult of mcpResponse.results) {
                        for (const entry of mcpResult.results) {
                            results.mcps.push({
                                ideId: mcpResult.ideId,
                                mcpId: entry.id,
                                status: entry.status === 'skipped' ? 'skipped' : 'success',
                            });
                        }
                    }
                } catch (err: any) {
                    for (const ideId of mcpIdeIds) {
                        for (const mcpId of mcps) {
                            results.mcps.push({
                                ideId,
                                mcpId,
                                status: 'failed',
                                error: err.message,
                            });
                        }
                    }
                }
            }
        }
    }

    return results;
};
