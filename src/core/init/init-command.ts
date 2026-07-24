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
import { selectIgnoreTargets, writeIgnoreTemplates } from '@/core/ignore/index.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';
import { getAllowedAgentTargets } from '@/core/target-selection/index.js';
import { selectAllowedAgentTargets } from '@/core/target-selection/index.js';
import { searchableMultiSelect } from '@/prompts/searchable-multi-select.js';
import { promptInitSelections } from './interactive-orchestrator.js';
import { buildInitPlan } from './plan-builder.js';
import { renderPreExecutionSummary, renderFinalReport } from './plan-utils.js';
import { executeInitPlan } from './plan-executor.js';
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

        const selectCheckbox = (deps.prompts?.checkbox ?? searchableMultiSelect) as (config: any) => Promise<string[]>;
        selectedValues = await selectCheckbox({
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

        const selectCheckbox = (deps.prompts?.checkbox ?? searchableMultiSelect) as (config: any) => Promise<string[]>;
        selectedNames = await selectCheckbox({
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

        const selectCheckbox = (deps.prompts?.checkbox ?? searchableMultiSelect) as (config: any) => Promise<string[]>;
        selectedSkillNames = await selectCheckbox({
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

            const selectCheckbox = (deps.prompts?.checkbox ?? searchableMultiSelect) as (config: any) => Promise<string[]>;
            selectedConfigNames = await selectCheckbox({
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

        // Prompt selections
        const selections = await promptInitSelections(deps, {
            explicitTools: options.tools || options.tool || options.ide || options.target,
            explicitCombo: options.combo,
            explicitPackages: options.packages,
            explicitSkills: options.skills,
        });

        const ignoreTargets = await selectIgnoreTargets(deps);

        // Build aggregate plan (pure planning, zero side effects)
        const plan = await buildInitPlan({
            projectDir,
            selections,
        });

        // Print Pre-execution summary
        if (!isJson) {
            const summaryText = renderPreExecutionSummary(plan);
            deps.stdout(`\n${summaryText}\n`);
        }

        // Final confirmation
        if (deps.prompts?.checkbox) {
            const confirmFn = deps.prompts?.confirm ?? confirm;
            const proceed = await confirmFn({
                message: 'Proceed with the above initialization plan?',
                default: true,
            });

            if (!proceed) {
                deps.stdout('\nInitialization cancelled. No changes were made.');
                return null;
            }
        }

        // Execute frozen plan
        if (!isJson) {
            deps.stdout('\nExecuting initialization plan...');
        }

        const result = await executeInitPlan({
            deps,
            plan,
            noIgnore: options.noIgnore,
        });

        await writeIgnoreTemplates(projectDir, ignoreTargets);

        if (!isJson) {
            const reportText = renderFinalReport(result);
            deps.stdout(`\n${reportText}\n`);
        }

        const installedPackages = result.results
            .filter((r) => r.item.category === 'package' && (r.status === 'installed' || r.status === 'overwritten'))
            .map((r) => r.item.name);
        const installedSkills = result.results
            .filter((r) => r.item.category === 'skill' && (r.status === 'installed' || r.status === 'overwritten'))
            .map((r) => r.item.name);
        const selectedConfigs = result.results
            .filter((r) => r.item.category === 'config' && (r.status === 'installed' || r.status === 'overwritten'))
            .map((r) => r.item.name);
        const selectedMcps = result.results
            .filter((r) => r.item.category === 'mcp' && (r.status === 'installed' || r.status === 'overwritten'))
            .map((r) => r.item.name);

        return {
            projectDir,
            toolsStep: {
                selectedTools: getAllowedAgentTargets()
                    .filter((t) => plan.selectedTools.includes(t.id))
                    .map((t) => t.agent!)
                    .filter(Boolean),
            },
            packagesStep: { installedPackages },
            skillsStep: { installedSkills },
            configsStep: { selectedConfigs },
            mcpStep: { selectedMcps },
        };
    } catch (error: any) {
        if (error?.name === 'ExitPromptError' || error?.message?.includes('force closed')) {
            originalDeps.stdout('\nInitialization cancelled (SIGINT).');
            return null;
        }
        if (request.json) {
            printJson({ success: false, error: error instanceof Error ? error.message : String(error) }, originalDeps.stdout);
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
                const hasSkillInAny = workflow.skillName
                    ? activeTools.some((t) => existsSync(join(projectDir, t.skillsDir!, 'skills', workflow.skillName)))
                    : false;
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
