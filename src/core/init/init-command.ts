import { existsSync, readFileSync } from 'node:fs';
import { mkdir, cp, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { confirm, select } from '@inquirer/prompts';
import type { ProgramDeps } from '@/cli/deps.js';
import { printJson } from '@/core/output/index.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';
import { getAllowedAgentTargets } from '@/core/target-selection/index.js';
import { selectAllowedAgentTargets } from '@/core/target-selection/index.js';
import { searchableMultiSelect } from '@/prompts/searchable-multi-select.js';
import { updateGitignore } from './gitignore.js';
import { readMcpManifests } from '@/core/mcp/registry.js';
import { syncMcpGlobalConfig } from '@/core/mcp/sync.js';
import { CommandAdapterRegistry } from '@/core/command-generation/registry.js';
import { generateCommand } from '@/core/command-generation/generator.js';
import { normalizeStructureCommandPath } from '@/core/agent/command-path.js';
import { buildPrGitCommandContent, buildClockifyCommandContent } from '@/core/templates/agent-workflows.js';
import { parseJsoncObject } from '@/core/vs/json.js';
import { cursorMcpAdapter, antigravityMcpAdapter } from '@/core/mcp/adapters.js';
import { checkExistingSkills, installSkills } from '@/core/skill/index.js';
import { checkExistingMcps } from '@/core/mcp/index.js';
import { COMBOS } from '@assets/combos/index.js';
import { PACKAGES } from '@assets/packages/index.js';
import { CONFIGS } from '@assets/configs/index.js';
import { SKILLS } from '@assets/skills/index.js';
import { WORKFLOWS } from '@assets/workflows/index.js';
import { installWorkflows, checkExistingWorkflows } from '@/core/workflow/index.js';
import type {
    InitCommandRequest,
    InitCommandResponse,
    ToolsStepResult,
    PackagesStepResult,
    SkillsStepResult,
    ConfigsStepResult,
    McpStepResult,
    PackageManifest,
    ComboManifest,
} from './types.js';

const execFileAsync = promisify(execFile);

// ─── Combo manifests helper ──────────────────────────────────────────

const readComboManifests = async (): Promise<(ComboManifest & { id: string })[]> => {
    return COMBOS;
};

// ─── Package manifest helpers ─────────────────────────────────────────

import { resolvePackageRoot } from '@/core/runtime/package-root.js';

const skillsDir = join(resolvePackageRoot(import.meta.url), 'assets/skills');
const configsDir = join(resolvePackageRoot(import.meta.url), 'assets/configs');

const readPackageManifests = async (): Promise<PackageManifest[]> => {
    return PACKAGES;
};

const isPackageInstalled = async (pkg: PackageManifest, projectDir: string): Promise<boolean> => {
    if (pkg.installer.kind === 'npm') {
        const { packageName, scope = 'global' } = pkg.installer;
        try {
            const args = ['list', packageName, '--depth=0'];
            if (scope === 'global') args.push('-g');
            await execFileAsync('npm', args, { cwd: projectDir, shell: true });
            return true;
        } catch {
            return false;
        }
    }
    return false;
};

const npmInstall = async (name: string, scope: 'global' | 'local', projectDir: string): Promise<boolean> => {
    const args = ['install', name];
    if (scope === 'global') args.push('-g');

    try {
        await execFileAsync('npm', args, { cwd: projectDir, timeout: 120000, shell: true });
        return true;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // error handled by caller
        throw new Error(`npm install failed for ${name}: ${message}`);
    }
};

// ─── Step 1: Tools ───────────────────────────────────────────────────

export const executeToolsStep = async (
    deps: ProgramDeps,
    projectDir: string,
    selectedValuesOverride?: string[],
): Promise<ToolsStepResult | null> => {
    const tools = getAllowedAgentTargets().flatMap((target) => (target.agent ? [target.agent] : []));

    if (!tools.length) {
        deps.stdout('  No installable agent tools found');
        return null;
    }

    let selectedValues: string[] = [];
    if (selectedValuesOverride) {
        const selected = await selectAllowedAgentTargets({
            automatic: false,
            emptyMessage: 'Select at least one tool',
            explicit: selectedValuesOverride.join(','),
            message: 'Select agent tools to initialize:',
        });
        selectedValues = selected.map((tool) => tool.value);
    } else {
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

        selectedValues = await searchableMultiSelect({
            message: 'Select agent tools to initialize:',
            choices,
            validate: (selected: string[]) => {
                if (!selected.length) return 'Select at least one tool';
                return true;
            },
        });
    }

    if (!selectedValues.length) return null;

    const selectedTools = tools.filter((tool) => selectedValues.includes(tool.value));

    return { selectedTools };
};

// ─── Step 2: Packages ─────────────────────────────────────────────────

export const executePackagesStep = async (
    deps: ProgramDeps,
    projectDir: string,
    selectedNamesOverride?: string[],
): Promise<PackagesStepResult | null> => {
    const manifests = await readPackageManifests();

    if (manifests.length === 0) {
        deps.stdout('  No packages available');
        return null;
    }

    let selectedNames: string[] = [];
    if (selectedNamesOverride) {
        for (const name of selectedNamesOverride) {
            const found = manifests.find((m) => m.id === name);
            if (!found) {
                throw new Error(`Package '${name}' not found in assets/packages`);
            }
        }
        selectedNames = selectedNamesOverride;
    } else {
        const choices = await Promise.all(
            manifests.map(async (pkg) => {
                const configured = await isPackageInstalled(pkg, projectDir);
                return {
                    name: pkg.description ? `${pkg.id} — ${pkg.description}` : pkg.id,
                    value: pkg.id,
                    configured,
                };
            }),
        );

        selectedNames = await searchableMultiSelect({
            message: 'Select packages to install:',
            choices,
        });
    }

    if (selectedNames.length === 0) return null;

    return { installedPackages: selectedNames };
};

// ─── Step 3: Skills ───────────────────────────────────────────────────

export const executeSkillsStep = async (
    deps: ProgramDeps,
    projectDir: string,
    selectedTools: ToolsStepResult['selectedTools'],
    selectedSkillNamesOverride?: string[],
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

    let selectedSkillNames: string[] = [];
    if (selectedSkillNamesOverride) {
        for (const name of selectedSkillNamesOverride) {
            if (!skillNames.includes(name)) {
                throw new Error(`Skill '${name}' not found in assets/skills`);
            }
        }
        selectedSkillNames = selectedSkillNamesOverride;
    } else {
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

        selectedSkillNames = await searchableMultiSelect({
            message: 'Select skills to install:',
            choices,
        });
    }

    if (selectedSkillNames.length === 0) return null;

    return { installedSkills: selectedSkillNames };
};

export const executeConfigsStep = async (
    deps: ProgramDeps,
    projectDir: string,
    selectedConfigNamesOverride?: string[],
): Promise<ConfigsStepResult | null> => {
    if (Object.keys(CONFIGS).length === 0) {
        deps.stdout('  No config templates available');
        return null;
    }

    try {
        let selectedConfigNames: string[] = [];
        if (selectedConfigNamesOverride) {
            for (const name of selectedConfigNamesOverride) {
                if (!CONFIGS[name]) {
                    throw new Error(`Config template '${name}' not found in assets/configs`);
                }
            }
            selectedConfigNames = selectedConfigNamesOverride;
        } else {
            const choices = Object.entries(CONFIGS).map(([name, config]) => {
                const alreadyExists = existsSync(join(projectDir, name));
                return {
                    name: config.description ? `${name} — ${config.description}` : name,
                    value: name,
                    configured: alreadyExists,
                };
            });

            selectedConfigNames = await searchableMultiSelect({
                message: 'Select configuration templates to copy:',
                choices,
            });
        }

        if (!selectedConfigNames?.length) return null;

        return { selectedConfigs: selectedConfigNames };
    } catch {
        deps.stdout('  Failed to read configuration templates');
        return null;
    }
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
        const comboOption = options.combo;
        const noIgnore = options.noIgnore ?? false;

        const openspecPkg = (await readPackageManifests()).find((m) => m.id === '@fission-ai/openspec');
        const isOpenSpecInstalled = openspecPkg ? await isPackageInstalled(openspecPkg, projectDir) : false;
        if (!isOpenSpecInstalled && !isJson) {
            if (yes) {
                deps.stdout('\nOpenSpec CLI (@fission-ai/openspec) is not installed. Installing globally...');
                await npmInstall('@fission-ai/openspec', 'global', projectDir);
            } else {
                const installOpenSpec = await confirm({
                    message: 'OpenSpec CLI (@fission-ai/openspec) is not installed. Do you want to install it globally?',
                    default: true,
                });
                if (installOpenSpec) {
                    deps.stdout('\nInstalling OpenSpec CLI globally...');
                    try {
                        await npmInstall('@fission-ai/openspec', 'global', projectDir);
                        deps.stdout('  ✓ OpenSpec CLI installed successfully\n');
                    } catch (error) {
                        deps.stdout(`  ✗ Failed to install OpenSpec CLI: ${error instanceof Error ? error.message : String(error)}\n`);
                    }
                }
            }
        }

        let selectedTools: ToolsStepResult['selectedTools'] = [];
        let selectedPackageNames: string[] = [];
        let selectedSkillNames: string[] = [];
        let selectedConfigNames: string[] = [];
        let selectedMcpNames: string[] = [];

        let isComboFlow = false;
        let selectedCombos: (ComboManifest & { id: string })[] = [];

        if (comboOption) {
            isComboFlow = true;
            const comboNames = comboOption.split(',').map((c) => c.trim().toLowerCase());
            const availableCombos = await readComboManifests();
            for (const name of comboNames) {
                const found = availableCombos.find((c) => c.id.toLowerCase() === name || c.name.toLowerCase() === name);
                if (!found) {
                    throw new Error(`Combo '${name}' not found in assets/combos`);
                }
                selectedCombos.push(found);
            }
        } else if (!isJson && !step && skip.length === 0) {
            const availableCombos = await readComboManifests();
            if (availableCombos.length > 0) {
                const setupMethod = await select({
                    message: 'Choose setup method:',
                    choices: [
                        { name: 'Combo (recommended predefined configurations)', value: 'combo' },
                        { name: 'Custom (manual packages and skills selection)', value: 'custom' },
                    ],
                });

                if (setupMethod === 'combo') {
                    isComboFlow = true;
                    const choices = availableCombos.map((c) => ({
                        name: c.description ? `${c.name} — ${c.description}` : c.name,
                        value: c.id,
                    }));
                    const selectedComboIds = await searchableMultiSelect({
                        message: 'Select combos to install:',
                        choices,
                    });
                    if (selectedComboIds.length === 0) {
                        deps.stdout('No combos selected. Exiting.');
                        return {};
                    }
                    selectedCombos = availableCombos.filter((c) => selectedComboIds.includes(c.id));
                }
            }
        }

        // Step 1: Prompt Tools selection
        if (!skip.includes('tools') && (!step || step === 'tools')) {
            deps.stdout('\n── Step 1: Tools Configuration ──');
            const toolsOverride = options.tools ? options.tools.split(',').map((t) => t.trim()) : undefined;
            const result = await executeToolsStep(deps, projectDir, toolsOverride);
            if (result) {
                selectedTools = result.selectedTools;
            }
        }

        if (isComboFlow) {
            const mergedPackages = new Set<string>();
            const mergedSkills = new Set<string>();
            const mergedConfigs = new Set<string>();
            for (const combo of selectedCombos) {
                if (combo.packages) {
                    for (const pkg of combo.packages) {
                        mergedPackages.add(pkg);
                    }
                }
                if (combo.skills) {
                    for (const skill of combo.skills) {
                        mergedSkills.add(skill);
                    }
                }
                if (combo.configs) {
                    for (const config of combo.configs) {
                        mergedConfigs.add(config);
                    }
                }
            }
            selectedPackageNames = Array.from(mergedPackages);
            selectedSkillNames = Array.from(mergedSkills);
            selectedConfigNames = Array.from(mergedConfigs);
        } else {
            // Step 2: Prompt Packages selection
            if (!skip.includes('packages') && (!step || step === 'packages')) {
                deps.stdout('\n── Step 2: Packages Selection ──');
                const packagesOverride = options.packages ? options.packages.split(',').map((p) => p.trim()) : undefined;
                const result = await executePackagesStep(deps, projectDir, packagesOverride);
                if (result) {
                    selectedPackageNames = result.installedPackages;
                }
            }

            // Step 3: Prompt Skills selection
            if (!skip.includes('skills') && (!step || step === 'skills')) {
                let toolsForSkills = selectedTools;
                if (toolsForSkills.length === 0) {
                    // Auto-detect configured tools in workspace if no tools selected in this session
                    const tools = getAllowedAgentTargets().flatMap((target) => (target.agent ? [target.agent] : []));
                    toolsForSkills = tools.filter((t) => t.skillsDir && existsSync(join(projectDir, t.skillsDir)));
                }

                if (toolsForSkills.length === 0 && !step) {
                    deps.stdout('\n── Step 3: Skills (skipped — no tools configured or selected) ──');
                } else {
                    deps.stdout('\n── Step 3: Skills Selection ──');
                    const skillsOverride = options.skills ? options.skills.split(',').map((s) => s.trim()) : undefined;
                    const result = await executeSkillsStep(deps, projectDir, toolsForSkills, skillsOverride);
                    if (result) {
                        selectedSkillNames = result.installedSkills;
                    }
                }
            }
            // Step 4: Prompt Configs selection
            if (!skip.includes('configs') && (!step || step === 'configs')) {
                deps.stdout('\n── Step 4: Configuration Templates ──');
                const configsOverride = options.configs ? options.configs.split(',').map((c) => c.trim()) : undefined;
                const result = await executeConfigsStep(deps, projectDir, configsOverride);
                if (result) {
                    selectedConfigNames = result.selectedConfigs;
                }
            }
        }

        // Step 5: Prompt MCP selection
        if (!skip.includes('mcp') && (!step || step === 'mcp')) {
            deps.stdout('\n── Step 5: MCP Configuration ──');
            const { manifests } = await readMcpManifests();
            if (manifests.length === 0) {
                deps.stdout('  No MCP manifests available');
            } else {
                const preSelectedMcps = new Set<string>();
                for (const skillName of selectedSkillNames) {
                    const skillMeta = SKILLS.find((s) => s.name === skillName);
                    if (skillMeta?.associatedWorkflows) {
                        for (const wfName of skillMeta.associatedWorkflows) {
                            const wfMeta = WORKFLOWS.find((w) => w.name === wfName);
                            if (wfMeta?.requiredMcps) {
                                for (const mcpId of wfMeta.requiredMcps) {
                                    preSelectedMcps.add(mcpId);
                                }
                            }
                        }
                    }
                }

                if (yes || !deps.prompts?.checkbox) {
                    selectedMcpNames = preSelectedMcps.size > 0 ? Array.from(preSelectedMcps) : [];
                } else {
                    const choices = manifests.map((m) => {
                        return {
                            name: m.id,
                            value: m.id,
                            checked: preSelectedMcps.has(m.id),
                        };
                    });

                    selectedMcpNames = await deps.prompts.checkbox({
                        message: 'Select MCP servers to configure:',
                        choices,
                    });
                }

                // Dependency checking & opt-out warning
                for (const skillName of selectedSkillNames) {
                    const skillMeta = SKILLS.find((s) => s.name === skillName);
                    if (skillMeta?.associatedWorkflows) {
                        for (const wfName of skillMeta.associatedWorkflows) {
                            const wfMeta = WORKFLOWS.find((w) => w.name === wfName);
                            if (wfMeta?.requiredMcps) {
                                for (const mcpId of wfMeta.requiredMcps) {
                                    if (!selectedMcpNames.includes(mcpId)) {
                                        deps.stdout(
                                            `  Warning: Skill ${skillName} requires the ${mcpId} MCP server. Opting out may break its functionality.`,
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        const hasTools = selectedTools.length > 0;
        const hasPackages = selectedPackageNames.length > 0;
        const hasSkills = selectedSkillNames.length > 0;
        const hasConfigs = selectedConfigNames.length > 0;
        const hasMcps = selectedMcpNames.length > 0;

        if (!hasTools && !hasPackages && !hasSkills && !hasConfigs && !hasMcps) {
            deps.stdout('\nNo tools, packages, skills, configs, or MCPs selected. Exiting.');
            return {};
        }

        // Print Pre-Execution Summary
        deps.stdout('\n==================================================');
        deps.stdout('          INIT CONFIGURATION SUMMARY');
        deps.stdout('==================================================');

        if (isComboFlow && selectedCombos.length > 0) {
            deps.stdout(`\nSelected Combos: ${selectedCombos.map((c) => c.name).join(', ')}`);
        }

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
                const pkg = manifests.find((m) => m.id === name);
                if (pkg) {
                    if (pkg.installer.kind === 'npm') {
                        const scope = pkg.installer.scope ?? 'global';
                        const alreadyInstalled = await isPackageInstalled(pkg, projectDir);
                        const statusBadge = alreadyInstalled ? '[⚠️ Already installed - will reinstall]' : '[New installation]';
                        deps.stdout(`  - ${pkg.id} (${scope}) ${statusBadge}`);
                    } else {
                        deps.stdout(`  - ${pkg.id} (agent-plugin) [New installation / action required]`);
                    }
                }
            }
        }

        if (hasSkills) {
            deps.stdout('\nSkills to Sync:');
            let toolsForSkills = selectedTools;
            if (toolsForSkills.length === 0) {
                const tools = getAllowedAgentTargets().flatMap((target) => (target.agent ? [target.agent] : []));
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

        if (selectedConfigNames?.length) {
            deps.stdout('\nConfiguration Templates to Copy:');
            for (const name of selectedConfigNames) {
                const alreadyExists = existsSync(join(projectDir, name));
                const statusBadge = alreadyExists ? '[⚠️ Already exists - will overwrite]' : '[New]';
                deps.stdout(`  - ${name} ${statusBadge}`);
            }
        }

        if (hasMcps) {
            deps.stdout('\nMCP Servers to Configure:');
            for (const name of selectedMcpNames) {
                deps.stdout(`  - ${name} [Will merge into global IDE configuration]`);
            }
        }

        if (!noIgnore) {
            const gitignorePaths: string[] = [];
            for (const tool of selectedTools) {
                if (tool.skillsDir) {
                    gitignorePaths.push(tool.skillsDir);
                }
            }
            if (hasSkills) {
                let toolsForSkills = selectedTools;
                if (toolsForSkills.length === 0) {
                    const tools = getAllowedAgentTargets().flatMap((target) => (target.agent ? [target.agent] : []));
                    toolsForSkills = tools.filter((t) => t.skillsDir && existsSync(join(projectDir, t.skillsDir)));
                }
                for (const tool of toolsForSkills) {
                    if (tool.skillsDir) {
                        gitignorePaths.push(tool.skillsDir);
                    }
                }
            }
            const uniquePaths = Array.from(new Set(gitignorePaths));
            if (uniquePaths.length > 0) {
                deps.stdout('\nPaths to ignore in .gitignore:');
                for (const p of uniquePaths) {
                    deps.stdout(`  - ${p}/`);
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
            const { executePackageActions } = await import('./package-installer.js');
            const targetIdsOverride =
                selectedTools.length > 0
                    ? selectedTools.map((t) => t.value as import('@/constants/allowed-tools.js').AllowedToolId)
                    : undefined;

            const packageActionResult = await executePackageActions({
                deps,
                projectDir,
                packageManifests: manifests,
                selectedPackageIds: selectedPackageNames,
            });

            packagesStepResult = { installedPackages: packageActionResult.installedPackages };
            const installedPackages = packageActionResult.installedPackages;

            if (installedPackages.includes('@fission-ai/openspec')) {
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

            if (installedPackages.includes('ui-ux-pro-max-cli')) {
                deps.stdout('\nInitializing UI/UX Pro Max...');
                const mapToolToUiproAi = (toolId: string): string | null => {
                    switch (toolId) {
                        case 'claude':
                            return 'claude';
                        case 'cursor':
                            return 'cursor';
                        case 'windsurf':
                            return 'windsurf';
                        case 'antigravity':
                            return 'antigravity';
                        case 'github-copilot':
                            return 'copilot';
                        case 'roocode':
                            return 'roocode';
                        case 'kiro':
                            return 'kiro';
                        case 'codex':
                            return 'codex';
                        case 'qoder':
                            return 'qoder';
                        case 'gemini':
                            return 'gemini';
                        case 'trae':
                            return 'trae';
                        case 'opencode':
                            return 'opencode';
                        case 'continue':
                            return 'continue';
                        case 'codebuddy':
                            return 'codebuddy';
                        case 'factory':
                            return 'droid';
                        case 'kilocode':
                            return 'kilocode';
                        case 'auggie':
                            return 'augment';
                        default:
                            return null;
                    }
                };

                let targetTools = selectedTools.map((t) => mapToolToUiproAi(t.value)).filter(Boolean) as string[];

                if (targetTools.length === 0) {
                    const tools = getAllowedAgentTargets().flatMap((target) => (target.agent ? [target.agent] : []));
                    const detectedTools = tools.filter((t) => t.skillsDir && existsSync(join(projectDir, t.skillsDir)));
                    targetTools = detectedTools.map((t) => mapToolToUiproAi(t.value)).filter(Boolean) as string[];
                }

                if (targetTools.length === 0) {
                    deps.stdout('  No matching agent tools found to configure UI/UX Pro Max for.');
                } else {
                    for (const aiType of targetTools) {
                        try {
                            deps.stdout(`  Running: npx ui-ux-pro-max-cli init --ai ${aiType} --force`);
                            await execFileAsync('npx', ['ui-ux-pro-max-cli', 'init', '--ai', aiType, '--force'], {
                                cwd: projectDir,
                                shell: true,
                            });
                            deps.stdout(`    ✓ UI/UX Pro Max initialized successfully for ${aiType}`);
                        } catch (error) {
                            deps.stdout(
                                `    ✗ UI/UX Pro Max initialization failed for ${aiType}: ${error instanceof Error ? error.message : String(error)}`,
                            );
                        }
                    }
                }
            }
        }

        // 3. Skills execution
        if (hasSkills) {
            deps.stdout('\nSyncing skills...');
            let toolsForSkills = selectedTools;
            if (toolsForSkills.length === 0) {
                const tools = getAllowedAgentTargets().flatMap((target) => (target.agent ? [target.agent] : []));
                toolsForSkills = tools.filter((t) => t.skillsDir && existsSync(join(projectDir, t.skillsDir)));
            }

            const existingSkills = await checkExistingSkills(projectDir, toolsForSkills, selectedSkillNames);
            const alreadyExisting = existingSkills.filter((s) => s.exists);
            let overwriteList: string[] = [];
            if (alreadyExisting.length > 0) {
                if (yes || !deps.prompts?.checkbox) {
                    overwriteList = alreadyExisting.map((s) => `${s.toolId}:${s.skillName}`);
                } else {
                    overwriteList = await deps.prompts.checkbox({
                        message: 'The following skills already exist. Select which ones you want to overwrite/reinstall:',
                        choices: alreadyExisting.map((s) => ({
                            name: `${s.skillName} in ${s.toolName} (${s.destPath})`,
                            value: `${s.toolId}:${s.skillName}`,
                            checked: true,
                        })),
                    });
                }
            }

            const installResults = await installSkills({
                deps,
                projectDir,
                selectedTools: toolsForSkills,
                skillNames: selectedSkillNames,
                overwriteList,
                noIgnore,
            });

            for (const result of installResults) {
                if (result.status === 'success' || result.status === 'overwritten') {
                    deps.stdout(`  ✓ Synced skill ${result.skillName} to ${result.toolName} (${result.status})`);
                } else if (result.status === 'skipped') {
                    deps.stdout(`  - Skipped skill ${result.skillName} for ${result.toolName}`);
                } else {
                    deps.stdout(`  ✗ Failed skill ${result.skillName} for ${result.toolName}: ${result.error}`);
                }
            }

            const installedSkills = installResults
                .filter((r) => r.status === 'success' || r.status === 'overwritten')
                .map((r) => r.skillName);
            skillsStepResult = { installedSkills: Array.from(new Set(installedSkills)) };

            // Install associated workflows
            const workflowsToInstall = new Set<string>();
            for (const skillName of installedSkills) {
                const skillMeta = SKILLS.find((s) => s.name === skillName);
                if (skillMeta?.associatedWorkflows) {
                    for (const wf of skillMeta.associatedWorkflows) {
                        workflowsToInstall.add(wf);
                    }
                }
            }
            if (workflowsToInstall.size > 0) {
                const wfList = Array.from(workflowsToInstall);
                const checks = await checkExistingWorkflows(projectDir, toolsForSkills, wfList);
                const missingWorkflows = Array.from(new Set(checks.filter((w) => !w.exists).map((w) => w.workflowName)));

                if (missingWorkflows.length > 0) {
                    let installWfs = yes;
                    if (!yes) {
                        deps.stdout('\n');
                        installWfs = await confirm({
                            message: `The selected skills are associated with workflow(s): ${missingWorkflows.join(', ')}. Would you like to install them as well?`,
                            default: true,
                        });
                    }
                    if (installWfs) {
                        deps.stdout('\nSyncing workflows...');
                        const wfResults = await installWorkflows({
                            deps,
                            projectDir,
                            selectedTools: toolsForSkills,
                            workflowNames: missingWorkflows,
                            overwriteList: missingWorkflows.map((w) => toolsForSkills.map((t) => `${t.value}:${w}`)).flat(),
                            noIgnore,
                        });
                        for (const r of wfResults) {
                            if (r.status === 'success') {
                                deps.stdout(`  ✓ Synced workflow ${r.workflowName} to ${r.toolName} (success)`);
                            } else if (r.status === 'skipped') {
                                deps.stdout(`  - Skipped workflow ${r.workflowName} for ${r.toolName}`);
                            } else {
                                deps.stdout(`  ✗ Failed workflow ${r.workflowName} for ${r.toolName}: ${r.error}`);
                            }
                        }
                    }
                }
            }
        }

        // 4. Configs execution
        if (selectedConfigNames?.length && existsSync(configsDir)) {
            deps.stdout('\nSyncing configuration templates...');
            for (const configName of selectedConfigNames) {
                const configEntry = CONFIGS[configName];
                if (configEntry?.files) {
                    for (const fileEntry of configEntry.files) {
                        const srcPath = join(configsDir, fileEntry.src);
                        const destPath = join(projectDir, fileEntry.dest);
                        if (existsSync(srcPath)) {
                            try {
                                const isDir = (await stat(srcPath)).isDirectory();
                                if (!isDir) {
                                    await mkdir(join(destPath, '..'), { recursive: true });
                                } else {
                                    await mkdir(destPath, { recursive: true });
                                }
                                await cp(srcPath, destPath, { recursive: true, force: true });
                                deps.stdout(`  ✓ Copied ${fileEntry.src} -> ${fileEntry.dest}`);
                            } catch (error) {
                                deps.stdout(
                                    `  ✗ Failed to copy ${fileEntry.src}: ${error instanceof Error ? error.message : String(error)}`,
                                );
                            }
                        }
                    }
                }
            }
        }

        let configsStepResult: ConfigsStepResult | undefined = undefined;
        if (selectedConfigNames?.length) {
            configsStepResult = { selectedConfigs: selectedConfigNames };
        }

        // MCP execution
        let mcpStepResult: McpStepResult | undefined = undefined;
        if (selectedMcpNames.length > 0) {
            deps.stdout('\nSyncing MCP global configurations...');
            const { manifests } = await readMcpManifests();
            const selectedManifests = manifests.filter((m) => selectedMcpNames.includes(m.id));
            if (selectedManifests.length > 0) {
                try {
                    let targetIdeIds = selectedTools.map((tool) => tool.value);
                    if (targetIdeIds.length === 0) {
                        const tools = getAllowedAgentTargets().flatMap((target) => (target.agent ? [target.agent] : []));
                        const configuredTools = tools.filter((t) => t.skillsDir && existsSync(join(projectDir, t.skillsDir)));
                        targetIdeIds = configuredTools.map((tool) => tool.value);
                    }
                    if (targetIdeIds.length === 0) {
                        targetIdeIds = getAllowedAgentTargets().map((target) => target.id);
                    }

                    const existingMcps = await checkExistingMcps(homedir(), process.platform, targetIdeIds, selectedMcpNames);
                    const alreadyExistingMcps = existingMcps.filter((m) => m.exists);
                    let mcpOverwriteList: string[] = [];
                    if (alreadyExistingMcps.length > 0) {
                        if (yes || !deps.prompts?.checkbox) {
                            mcpOverwriteList = alreadyExistingMcps.map((m) => `${m.ideId}:${m.mcpId}`);
                        } else {
                            mcpOverwriteList = await deps.prompts.checkbox({
                                message:
                                    'The following MCP configurations already exist. Select which ones you want to overwrite/reconfigure:',
                                choices: alreadyExistingMcps.map((m) => ({
                                    name: `${m.mcpId} in ${m.ideName}`,
                                    value: `${m.ideId}:${m.mcpId}`,
                                    checked: true,
                                })),
                            });
                        }
                    }

                    const response = await syncMcpGlobalConfig({
                        cwd: projectDir,
                        homeDir: homedir(),
                        ideIds: targetIdeIds,
                        manifests: selectedManifests,
                        platform: process.platform,
                        write: deps.stdout,
                        overwriteList: mcpOverwriteList,
                    });

                    // Show skips/successes/overwrites
                    for (const result of response.results) {
                        for (const entry of result.results) {
                            if (entry.status === 'skipped') {
                                deps.stdout(`  - Skipped MCP ${entry.id} in ${result.ideName}`);
                            } else {
                                deps.stdout(`  ✓ Configured MCP ${entry.id} in ${result.ideName} (${entry.status})`);
                            }
                        }
                    }

                    mcpStepResult = { selectedMcps: selectedMcpNames };
                } catch (error) {
                    deps.stdout(`  ✗ Failed to sync MCP configurations: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        }

        // 5. Update Gitignore
        if (!noIgnore) {
            const gitignorePaths: string[] = [];
            for (const tool of selectedTools) {
                if (tool.skillsDir) {
                    gitignorePaths.push(tool.skillsDir);
                }
            }
            if (hasSkills) {
                let toolsForSkills = selectedTools;
                if (toolsForSkills.length === 0) {
                    const tools = getAllowedAgentTargets().flatMap((target) => (target.agent ? [target.agent] : []));
                    toolsForSkills = tools.filter((t) => t.skillsDir && existsSync(join(projectDir, t.skillsDir)));
                }
                for (const tool of toolsForSkills) {
                    if (tool.skillsDir) {
                        gitignorePaths.push(tool.skillsDir);
                    }
                }
            }
            const uniqueGitignorePaths = Array.from(new Set(gitignorePaths));
            deps.stdout('\nUpdating .gitignore...');
            try {
                await updateGitignore(projectDir, uniqueGitignorePaths);
                deps.stdout('  ✓ Updated .gitignore');
            } catch (error) {
                deps.stdout(`  ✗ Failed to update .gitignore: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        return {
            toolsStep: toolsStepResult,
            packagesStep: packagesStepResult,
            skillsStep: skillsStepResult,
            configsStep: configsStepResult,
            mcpStep: mcpStepResult,
            projectDir,
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
                configs: result.configsStep?.selectedConfigs,
                mcps: result.mcpStep?.selectedMcps,
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
    if (result.configsStep && result.configsStep.selectedConfigs.length > 0) {
        deps.stdout(`  Configs: ${result.configsStep.selectedConfigs.join(', ')}`);
    }
    if (result.mcpStep && result.mcpStep.selectedMcps.length > 0) {
        deps.stdout(`  MCPs: ${result.mcpStep.selectedMcps.join(', ')}`);
    }

    const projectDir = result.projectDir;
    if (projectDir) {
        const activeTools = getAllowedAgentTargets()
            .flatMap((target) => (target.agent ? [target.agent] : []))
            .filter((t) => t.skillsDir && existsSync(join(projectDir, t.skillsDir)));
        if (activeTools.length > 0) {
            deps.stdout('\n==================================================');
            deps.stdout('                READINESS REPORT');
            deps.stdout('==================================================');

            const workflows = WORKFLOWS.map((wf) => {
                const mcpId = wf.requiredMcps?.[0];
                let secretKey: string | undefined;
                let usageNote: string | undefined;
                if (mcpId === 'github') secretKey = 'GITHUB_PERSONAL_ACCESS_TOKEN';
                else if (mcpId === 'clockify') secretKey = 'CLOCKIFY_API_KEY';
                else if (mcpId === 'gitnexus') usageNote = 'Indexed project directory required before use';

                return {
                    id: wf.name,
                    skillName: wf.requiredSkills[0],
                    mcpId,
                    secretKey,
                    usageNote,
                };
            });

            for (const workflow of workflows) {
                const hasSkillInAny = activeTools.some((t) => existsSync(join(projectDir, t.skillsDir!, 'skills', workflow.skillName)));
                if (!hasSkillInAny) continue;

                deps.stdout(`\n  ${workflow.id} workflow:`);

                let isCommandReady = true;
                let isSkillReady = true;
                for (const tool of activeTools) {
                    const adapter = CommandAdapterRegistry.get(tool.value);
                    const commandPath = adapter
                        ? join(projectDir, normalizeStructureCommandPath(adapter.getFilePath(workflow.id), workflow.id))
                        : '';
                    if (!commandPath || !existsSync(commandPath)) {
                        isCommandReady = false;
                    }
                    if (!existsSync(join(projectDir, tool.skillsDir!, 'skills', workflow.skillName))) {
                        isSkillReady = false;
                    }
                }

                deps.stdout(`    - Command (${workflow.id}): ${isCommandReady ? 'Ready' : 'Not configured'}`);
                deps.stdout(`    - Skill (${workflow.skillName}): ${isSkillReady ? 'Ready' : 'Not configured'}`);

                if (workflow.mcpId) {
                    const configuredIdes: string[] = [];
                    const incompleteIdes: { name: string; path: string }[] = [];

                    for (const adapter of [cursorMcpAdapter, antigravityMcpAdapter]) {
                        try {
                            const path = adapter.getConfigPath(homedir(), process.platform);
                            if (existsSync(path)) {
                                const config = parseJsoncObject(readFileSync(path, 'utf8')) as any;
                                const mcpConfig = config?.mcpServers?.[workflow.mcpId] as any;
                                if (mcpConfig) {
                                    configuredIdes.push(adapter.name);
                                    if (workflow.secretKey) {
                                        const credentialValue = mcpConfig.env?.[workflow.secretKey];
                                        if (credentialValue === undefined || credentialValue === '') {
                                            incompleteIdes.push({ name: adapter.name, path });
                                        }
                                    }
                                }
                            }
                        } catch {}
                    }

                    if (configuredIdes.length > 0) {
                        deps.stdout(`    - MCP Server (${workflow.mcpId}): Configured in ${configuredIdes.join(', ')}`);
                        if (workflow.secretKey) {
                            if (incompleteIdes.length > 0) {
                                deps.stdout(`    - Credentials: Setup incomplete`);
                                for (const ide of incompleteIdes) {
                                    deps.stdout(`      ⚠️ ${ide.name}: ${ide.path} -> ${workflow.secretKey} requires manual editing`);
                                }
                            } else {
                                deps.stdout(`    - Credentials: Ready`);
                            }
                        } else if (workflow.usageNote) {
                            deps.stdout(`    - Usage Note: ${workflow.usageNote}`);
                        }
                    } else {
                        deps.stdout(`    - MCP Server (${workflow.mcpId}): Not configured`);
                    }
                }
            }
            deps.stdout('\n==================================================');
        }
    }
};
