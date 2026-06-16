import { existsSync } from 'node:fs';
import { mkdir, cp, readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import yaml from 'js-yaml';
import { confirm } from '@inquirer/prompts';
import type { ProgramDeps } from '@/cli/deps.js';
import { printJson } from '@/core/output/index.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';
import { getInstallableAgentTools, getAgentToolById } from '@/core/agent/tools.js';
import { searchableMultiSelect } from '@/prompts/searchable-multi-select.js';
import type {
    InitCommandRequest,
    InitCommandResponse,
    ToolsStepResult,
    PackagesStepResult,
    SkillsStepResult,
    PackageManifest,
} from './types.js';

const execFileAsync = promisify(execFile);

// ─── Package manfiest helpers ─────────────────────────────────────────

const packagesDir = new URL('../../../libraries/packages', import.meta.url).pathname;
const skillsDir = new URL('../../../libraries/skills', import.meta.url).pathname;

const readPackageManifests = async (): Promise<PackageManifest[]> => {
    if (!existsSync(packagesDir)) return [];

    const entries = await readdir(packagesDir);
    const yamlFiles = entries.filter((e) => e.endsWith('.yaml') || e.endsWith('.yml'));

    const manifests: PackageManifest[] = [];

    for (const file of yamlFiles) {
        try {
            const raw = await readFile(join(packagesDir, file), 'utf-8');
            const parsed = yaml.load(raw) as PackageManifest | null;
            if (parsed?.name) {
                manifests.push(parsed);
            }
        } catch {
            // skip invalid manifest
        }
    }

    return manifests;
};

const isPackageInstalled = async (name: string, scope: 'global' | 'local', projectDir: string): Promise<boolean> => {
    try {
        const args = ['list', name, '--depth=0'];
        if (scope === 'global') args.push('-g');
        await execFileAsync('npm', args, { cwd: projectDir });
        return true;
    } catch {
        return false;
    }
};

const npmInstall = async (name: string, scope: 'global' | 'local', projectDir: string): Promise<boolean> => {
    const args = ['install', name];
    if (scope === 'global') args.push('-g');

    try {
        await execFileAsync('npm', args, { cwd: projectDir, timeout: 120000 });
        return true;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // error handled by caller
        throw new Error(`npm install failed for ${name}: ${message}`);
    }
};

// ─── Step 1: Tools ───────────────────────────────────────────────────

const executeToolsStep = async (deps: ProgramDeps, projectDir: string): Promise<ToolsStepResult | null> => {
    const tools = getInstallableAgentTools();

    if (tools.length === 0) {
        deps.stdout('  No installable agent tools found');
        return null;
    }

    const choices = tools.map((t) => {
        const configured = t.skillsDir ? existsSync(join(projectDir, t.skillsDir)) : false;
        const detected = t.detectionPaths ? t.detectionPaths.some((p) => existsSync(join(projectDir, p))) : false;
        return {
            name: t.name,
            value: t.value,
            configured,
            detected,
        };
    });

    const selectedValues = await searchableMultiSelect({
        message: 'Select agent tools to initialize:',
        choices,
        validate: (selected: string[]) => {
            if (selected.length === 0) return 'Select at least one tool';
            return true;
        },
    });

    if (selectedValues.length === 0) return null;

    const selectedTools = selectedValues.map((v) => getAgentToolById(v)).filter(Boolean) as typeof tools;

    return { selectedTools };
};

// ─── Step 2: Packages ─────────────────────────────────────────────────

const executePackagesStep = async (deps: ProgramDeps, projectDir: string): Promise<PackagesStepResult | null> => {
    const manifests = await readPackageManifests();

    if (manifests.length === 0) {
        deps.stdout('  No packages available');
        return null;
    }

    const choices = await Promise.all(
        manifests.map(async (pkg) => {
            const scope = pkg.scope ?? 'global';
            const configured = await isPackageInstalled(pkg.name, scope, projectDir);
            return {
                name: pkg.description ? `${pkg.name} — ${pkg.description}` : pkg.name,
                value: pkg.name,
                configured,
            };
        }),
    );

    const selectedNames = await searchableMultiSelect({
        message: 'Select packages to install:',
        choices,
    });

    if (selectedNames.length === 0) return null;

    return { installedPackages: selectedNames };
};

// ─── Step 3: Skills ───────────────────────────────────────────────────

const executeSkillsStep = async (
    deps: ProgramDeps,
    projectDir: string,
    selectedTools: ToolsStepResult['selectedTools'],
): Promise<SkillsStepResult | null> => {
    if (!existsSync(skillsDir)) {
        deps.stdout('  No skills available');
        return null;
    }

    const entries = await readdir(skillsDir);
    const skillNames: string[] = [];

    for (const name of entries) {
        const fullPath = join(skillsDir, name);
        try {
            const s = await stat(fullPath);
            if (s.isDirectory()) skillNames.push(name);
        } catch {
            // skip unreadable entries
        }
    }

    if (skillNames.length === 0) {
        deps.stdout('  No skills available');
        return null;
    }

    const choices = skillNames.map((name) => {
        let configured = false;
        for (const tool of selectedTools) {
            if (tool.skillsDir && existsSync(join(projectDir, tool.skillsDir, 'skills', name))) {
                configured = true;
                break;
            }
        }
        return {
            name,
            value: name,
            configured,
        };
    });

    const selectedSkillNames = await searchableMultiSelect({
        message: 'Select skills to install:',
        choices,
    });

    if (selectedSkillNames.length === 0) return null;

    return { installedSkills: selectedSkillNames };
};

// ─── Orchestrator ─────────────────────────────────────────────────────

export const executeInitCommand = async (originalDeps: ProgramDeps, request: InitCommandRequest): Promise<InitCommandResponse | null> => {
    try {
        const isJson = request.json ?? false;
        const deps = {
            ...originalDeps,
            stdout: isJson ? () => {} : originalDeps.stdout,
        };
        const projectDir = resolveProjectDir(deps, request.path);
        assertProjectDirectory(projectDir);

        const options = request.options;
        const yes = options.yes ?? false;
        const skip = options.skip ? options.skip.split(',').map((s) => s.trim()) : [];
        const step = options.step;

        let selectedTools: ToolsStepResult['selectedTools'] = [];
        let selectedPackageNames: string[] = [];
        let selectedSkillNames: string[] = [];

        // Step 1: Prompt Tools selection
        if (!skip.includes('tools') && (!step || step === 'tools')) {
            deps.stdout('\n── Step 1: Tools Configuration ──');
            const result = await executeToolsStep(deps, projectDir);
            if (result) {
                selectedTools = result.selectedTools;
            }
        }

        // Step 2: Prompt Packages selection
        if (!skip.includes('packages') && (!step || step === 'packages')) {
            deps.stdout('\n── Step 2: Packages Selection ──');
            const result = await executePackagesStep(deps, projectDir);
            if (result) {
                selectedPackageNames = result.installedPackages;
            }
        }

        // Step 3: Prompt Skills selection
        if (!skip.includes('skills') && (!step || step === 'skills')) {
            let toolsForSkills = selectedTools;
            if (toolsForSkills.length === 0) {
                // Auto-detect configured tools in workspace if no tools selected in this session
                const tools = getInstallableAgentTools();
                toolsForSkills = tools.filter((t) => t.skillsDir && existsSync(join(projectDir, t.skillsDir)));
            }

            if (toolsForSkills.length === 0 && !step) {
                deps.stdout('\n── Step 3: Skills (skipped — no tools configured or selected) ──');
            } else {
                deps.stdout('\n── Step 3: Skills Selection ──');
                const result = await executeSkillsStep(deps, projectDir, toolsForSkills);
                if (result) {
                    selectedSkillNames = result.installedSkills;
                }
            }
        }

        const hasTools = selectedTools.length > 0;
        const hasPackages = selectedPackageNames.length > 0;
        const hasSkills = selectedSkillNames.length > 0;

        if (!hasTools && !hasPackages && !hasSkills) {
            deps.stdout('\nNo tools, packages, or skills selected. Exiting.');
            return {};
        }

        // Print Pre-Execution Summary
        deps.stdout('\n==================================================');
        deps.stdout('          INIT CONFIGURATION SUMMARY');
        deps.stdout('==================================================');

        if (hasTools) {
            deps.stdout('\nAgent Tools to Configure:');
            for (const tool of selectedTools) {
                const alreadyExists = tool.skillsDir ? existsSync(join(projectDir, tool.skillsDir)) : false;
                const statusBadge = alreadyExists ? '[⚠️ Already configured - will reinstall skills]' : '[New configuration]';
                deps.stdout(`  - ${tool.name} (destination: ${tool.skillsDir}) ${statusBadge}`);
            }
        }

        if (hasPackages) {
            deps.stdout('\nPackages to Install:');
            const manifests = await readPackageManifests();
            for (const name of selectedPackageNames) {
                const pkg = manifests.find((m) => m.name === name);
                if (pkg) {
                    const scope = pkg.scope ?? 'global';
                    const alreadyInstalled = await isPackageInstalled(name, scope, projectDir);
                    const statusBadge = alreadyInstalled ? '[⚠️ Already installed - will reinstall]' : '[New installation]';
                    deps.stdout(`  - ${name} (${scope}) ${statusBadge}`);
                }
            }
        }

        if (hasSkills) {
            deps.stdout('\nSkills to Sync:');
            let toolsForSkills = selectedTools;
            if (toolsForSkills.length === 0) {
                const tools = getInstallableAgentTools();
                toolsForSkills = tools.filter((t) => t.skillsDir && existsSync(join(projectDir, t.skillsDir)));
            }

            for (const skillName of selectedSkillNames) {
                deps.stdout(`  - ${skillName}`);
                for (const tool of toolsForSkills) {
                    if (!tool.skillsDir) continue;
                    const destPath = join(tool.skillsDir, 'skills', skillName);
                    const alreadyExists = existsSync(join(projectDir, destPath));
                    const statusBadge = alreadyExists ? '[⚠️ Already exists - will overwrite]' : '[New]';
                    deps.stdout(`      -> ${tool.name}: ${destPath} ${statusBadge}`);
                }
            }
        }

        deps.stdout('\n==================================================');

        // Confirm execution
        if (!yes) {
            const proceed = await confirm({
                message: 'Proceed with the above changes?',
                default: true,
            });

            if (!proceed) {
                deps.stdout('\nInitialization cancelled. No changes were made.');
                return null;
            }
        }

        deps.stdout('\nExecuting changes...');

        // ─── Execution Phase ────────────────────────────────────────────────
        let toolsStepResult: ToolsStepResult | undefined = undefined;
        let packagesStepResult: PackagesStepResult | undefined = undefined;
        let skillsStepResult: SkillsStepResult | undefined = undefined;

        // 1. Tool execution (creating basic structure if needed)
        if (hasTools) {
            deps.stdout('\nConfiguring tools...');
            for (const tool of selectedTools) {
                if (tool.skillsDir) {
                    const targetDir = join(projectDir, tool.skillsDir);
                    await mkdir(targetDir, { recursive: true });
                    deps.stdout(`  ✓ Configured ${tool.name}`);
                }
            }
            toolsStepResult = { selectedTools };
        }

        // 2. Package execution
        if (hasPackages) {
            deps.stdout('\nInstalling packages...');
            const manifests = await readPackageManifests();
            const installedPackages: string[] = [];

            for (const name of selectedPackageNames) {
                const pkg = manifests.find((m) => m.name === name);
                if (!pkg) continue;

                const scope = pkg.scope ?? 'global';
                deps.stdout(`  Installing ${name}...`);
                try {
                    await npmInstall(name, scope, projectDir);
                    installedPackages.push(name);
                    deps.stdout(`    ✓ Installed ${name}`);
                } catch (error) {
                    deps.stdout(`    ✗ Failed to install ${name}: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
            packagesStepResult = { installedPackages };
        }

        // 3. Skills execution
        if (hasSkills) {
            deps.stdout('\nSyncing skills...');
            let toolsForSkills = selectedTools;
            if (toolsForSkills.length === 0) {
                const tools = getInstallableAgentTools();
                toolsForSkills = tools.filter((t) => t.skillsDir && existsSync(join(projectDir, t.skillsDir)));
            }

            const installedSkills: string[] = [];
            for (const skillName of selectedSkillNames) {
                deps.stdout(`  Syncing ${skillName}...`);
                for (const tool of toolsForSkills) {
                    if (!tool.skillsDir) continue;

                    const toolSkillsDir = join(projectDir, tool.skillsDir, 'skills');
                    const destPath = join(toolSkillsDir, skillName);
                    const srcPath = join(skillsDir, skillName);

                    try {
                        await mkdir(toolSkillsDir, { recursive: true });
                        await cp(srcPath, destPath, { recursive: true, force: true });
                        deps.stdout(`    ✓ Copied to ${tool.name}`);
                    } catch (error) {
                        deps.stdout(`    ✗ Failed to copy to ${tool.name}: ${error instanceof Error ? error.message : String(error)}`);
                    }
                }
                installedSkills.push(skillName);
            }
            skillsStepResult = { installedSkills };
        }

        return {
            toolsStep: toolsStepResult,
            packagesStep: packagesStepResult,
            skillsStep: skillsStepResult,
        };
    } catch (error: any) {
        if (error?.name === 'ExitPromptError' || error?.message?.includes('force closed')) {
            originalDeps.stdout('\nInitialization cancelled (SIGINT).');
            return null;
        }
        throw error;
    }
};

// ─── Result printer ───────────────────────────────────────────────────

export const printInitResult = (deps: ProgramDeps, parentJson: boolean, result: InitCommandResponse): void => {
    if (parentJson) {
        printJson(
            {
                tools: result.toolsStep?.selectedTools.map((t) => t.value),
                packages: result.packagesStep?.installedPackages,
                skills: result.skillsStep?.installedSkills,
            },
            deps.stdout,
        );
        return;
    }

    deps.stdout('\nInit complete!');

    if (result.toolsStep) {
        deps.stdout(`  Tools: ${result.toolsStep.selectedTools.map((t) => t.name).join(', ')}`);
    }
    if (result.packagesStep && result.packagesStep.installedPackages.length > 0) {
        deps.stdout(`  Packages: ${result.packagesStep.installedPackages.join(', ')}`);
    }
    if (result.skillsStep && result.skillsStep.installedSkills.length > 0) {
        deps.stdout(`  Skills: ${result.skillsStep.installedSkills.join(', ')}`);
    }
};
