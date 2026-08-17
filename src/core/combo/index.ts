import { existsSync } from 'node:fs';
import { cp } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { AgentToolOption } from '@/core/agent/tools.js';
import { checkExistingRules, installRules, type RuleInstallResult } from '@/core/rule/index.js';
import { checkExistingWorkflows, installWorkflows, type WorkflowInstallResult } from '@/core/workflow/index.js';
import { ALLOWED_TARGETS } from '@/core/target-selection/catalog.js';
import type { ProgramDeps } from '@/cli/deps.js';
import type {
    ComboManifest,
    ConfigManifest,
    McpManifest,
    PackageManifest,
    RuleManifest,
    SkillManifest,
    WorkflowManifest,
} from '@assets/types.js';
import { checkExistingSkills, installSkills, type SkillInstallResult } from '@/core/skill/index.js';
import { checkExistingMcps, syncMcpGlobalConfig, readMcpManifests } from '@/core/mcp/index.js';
import { COMBOS } from '@assets/combos/index.js';
import { PACKAGES } from '@assets/packages/index.js';
import { CONFIGS } from '@assets/configs/index.js';
import { RULES } from '@assets/rules/index.js';
import { SKILLS } from '@assets/skills/index.js';
import { WORKFLOWS } from '@assets/workflows/index.js';
import { MCPS } from '@assets/mcps/index.js';

const execFileAsync = promisify(execFile);

import { resolvePackageRoot } from '@/core/runtime/package-root.js';

const configsDir = join(resolvePackageRoot(import.meta.url), 'assets/configs');

export interface ExtendedComboManifest extends ComboManifest {
    id: string;
    mcps?: string[];
}

export type ComboComponentStatus = 'installed' | 'missing' | 'partial' | 'not-applicable';

export interface ExistingComboComponent {
    type: 'package' | 'skill' | 'config' | 'mcp' | 'rule' | 'workflow';
    id: string; // e.g. "package:ui-ux-pro-max-cli", "skill:cursor:c4-diagrams", "config:eslint", "mcp:cursor:github"
    name: string; // Name of package, skill, config, or mcp
    toolId?: string; // If skill/mcp, which tool/ide
    label: string; // User-friendly description
    exists: boolean;
    status: ComboComponentStatus;
    meta: any;
}

export type ComboInstallationStatus = 'installed' | 'missing' | 'partial';

export const summarizeComboInstallation = (components: ExistingComboComponent[]): ComboInstallationStatus => {
    const applicable = components.filter((component) => component.status !== 'not-applicable');
    if (applicable.length === 0 || applicable.every((component) => component.status === 'installed')) return 'installed';
    if (applicable.every((component) => component.status === 'missing')) return 'missing';
    return 'partial';
};

export interface ComboInstallResult {
    packages: { name: string; status: 'success' | 'skipped' | 'failed'; error?: string }[];
    configs: { name: string; status: 'success' | 'skipped' | 'failed'; error?: string }[];
    rules: RuleInstallResult[];
    skills: SkillInstallResult[];
    workflows: WorkflowInstallResult[];
    mcps: { ideId: string; mcpId: string; status: 'success' | 'skipped' | 'failed'; error?: string }[];
}

export interface ComboAssetRegistries {
    packages: PackageManifest[];
    rules: RuleManifest[];
    skills: SkillManifest[];
    configs: Record<string, ConfigManifest>;
    workflows: WorkflowManifest[];
    mcps: McpManifest[];
}

export interface ComboDependencyPlan {
    packages: string[];
    rules: string[];
    skills: string[];
    configs: string[];
    workflows: string[];
    mcps: string[];
}

const comboRegistries = (): ComboAssetRegistries => ({
    packages: PACKAGES,
    rules: RULES,
    skills: SKILLS,
    configs: CONFIGS,
    workflows: WORKFLOWS,
    mcps: MCPS,
});

const unique = (values: string[]): string[] => Array.from(new Set(values));

export const validateComboManifestReferences = (combos: ComboManifest[], registries: ComboAssetRegistries): void => {
    const catalogs: Array<[keyof ComboManifest, Set<string>]> = [
        ['packages', new Set(registries.packages.map((item) => item.id))],
        ['rules', new Set(registries.rules.map((item) => item.id))],
        ['skills', new Set(registries.skills.map((item) => item.name))],
        ['configs', new Set(Object.keys(registries.configs))],
        ['workflows', new Set(registries.workflows.map((item) => item.name))],
        ['mcps', new Set(registries.mcps.map((item) => item.id))],
    ];

    for (const combo of combos) {
        for (const [field, ids] of catalogs) {
            for (const id of combo[field] || []) {
                if (!ids.has(id)) {
                    throw new Error(`Combo '${combo.id}' references unknown ${field} ID '${id}'`);
                }
            }
        }

        for (const workflowName of combo.workflows || []) {
            const workflow = registries.workflows.find((item) => item.name === workflowName);
            for (const mcpId of workflow?.requiredMcps || []) {
                if (!registries.mcps.some((mcp) => mcp.id === mcpId)) {
                    throw new Error(`Combo '${combo.id}' workflow '${workflowName}' references unknown mcps ID '${mcpId}'`);
                }
            }
        }

        for (const ruleId of combo.rules || []) {
            const rule = registries.rules.find((item) => item.id === ruleId);
            const dependencies: Array<[string, string[] | undefined, Set<string>]> = [
                ['packages', rule?.requiredPackages, new Set(registries.packages.map((item) => item.id))],
                ['skills', rule?.requiredSkills, new Set(registries.skills.map((item) => item.name))],
                ['mcps', rule?.requiredMcps, new Set(registries.mcps.map((item) => item.id))],
            ];
            for (const [field, ids, catalog] of dependencies) {
                for (const id of ids || []) {
                    if (!catalog.has(id)) throw new Error(`Combo '${combo.id}' rule '${ruleId}' references unknown ${field} ID '${id}'`);
                }
            }
        }
    }
};

export const buildComboDependencyPlan = (
    combo: ComboManifest,
    registries: ComboAssetRegistries = comboRegistries(),
): ComboDependencyPlan => {
    const ruleDependencies = (combo.rules || []).flatMap((id) => {
        const rule = registries.rules.find((item) => item.id === id);
        return rule ? [rule] : [];
    });
    const workflowDependencies = (combo.workflows || []).flatMap((name) => {
        const workflow = registries.workflows.find((item) => item.name === name);
        return workflow ? [workflow] : [];
    });

    return {
        packages: unique([...(combo.packages || []), ...ruleDependencies.flatMap((rule) => rule.requiredPackages || [])]),
        rules: unique(combo.rules || []),
        skills: unique([...(combo.skills || []), ...ruleDependencies.flatMap((rule) => rule.requiredSkills || [])]),
        configs: unique(combo.configs || []),
        workflows: unique(combo.workflows || []),
        mcps: unique([
            ...(combo.mcps || []),
            ...ruleDependencies.flatMap((rule) => rule.requiredMcps || []),
            ...workflowDependencies.flatMap((workflow) => workflow.requiredMcps || []),
        ]),
    };
};

export const readComboManifests = async (): Promise<ExtendedComboManifest[]> => {
    validateComboManifestReferences(COMBOS, comboRegistries());
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

const SKILLS_CLI_TARGETS: Record<string, string> = {
    antigravity: 'antigravity',
    claude: 'claude-code',
    cursor: 'cursor',
    codex: 'codex',
    cline: 'cline',
    gemini: 'gemini',
    'github-copilot': 'github-copilot',
    opencode: 'opencode',
    windsurf: 'windsurf',
};

export const UIPRO_AI_TARGETS: Record<string, string> = {
    antigravity: 'antigravity',
    cursor: 'cursor',
    claude: 'claude',
    codex: 'codex',
    windsurf: 'windsurf',
    'github-copilot': 'copilot',
    gemini: 'gemini',
    opencode: 'opencode',
    continue: 'continue',
    kilocode: 'kilocode',
    cline: 'roocode',
    roocode: 'roocode',
    codebuddy: 'codebuddy',
    factory: 'droid',
    auggie: 'augment',
    kiro: 'kiro',
    qoder: 'qoder',
    trae: 'trae',
    warp: 'warp',
};

const externalSkillPath = (projectDir: string, tool: AgentToolOption, skillName: string): string | undefined =>
    tool.skillsDir ? join(projectDir, tool.skillsDir, 'skills', skillName, 'SKILL.md') : undefined;

export const installExternalSkill = async (
    installer: Extract<PackageManifest['installer'], { kind: 'skills' }>,
    selectedTools: AgentToolOption[],
    projectDir: string,
): Promise<void> => {
    const unsupported = selectedTools.filter((tool) => !SKILLS_CLI_TARGETS[tool.value]);
    if (unsupported.length > 0)
        throw new Error(`Skills CLI does not support target(s): ${unsupported.map((tool) => tool.value).join(', ')}`);
    const agents = selectedTools.map((tool) => SKILLS_CLI_TARGETS[tool.value]);
    await execFileAsync(
        'npx',
        [
            '-y',
            `skills@${installer.cliVersion}`,
            'add',
            installer.source,
            '--skill',
            installer.skillName,
            '--agent',
            ...agents,
            '--yes',
            '--copy',
        ],
        { cwd: projectDir, timeout: 120000, shell: false },
    );
    const missing = selectedTools.filter((tool) => {
        const path = externalSkillPath(projectDir, tool, installer.skillName);
        return !path || !existsSync(path);
    });
    if (missing.length > 0)
        throw new Error(
            `External skill '${installer.skillName}' missing after install for: ${missing.map((tool) => tool.value).join(', ')}`,
        );
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

    const plan = buildComboDependencyPlan(combo, comboRegistries());

    // 1. Packages
    if (plan.packages.length) {
        const pkgManifests = await readPackageManifests();
        for (const pkgName of plan.packages) {
            const pkg = pkgManifests.find((manifest) => manifest.id === pkgName);
            if (!pkg) continue;
            const isExternalSkill = pkg.installer.kind === 'skills';
            const scope = pkg.installer.kind === 'npm' ? (pkg.installer.scope ?? 'global') : undefined;
            let exists: boolean;
            if (pkg.installer.kind === 'skills') {
                const skillName = pkg.installer.skillName;
                exists =
                    selectedTools.length > 0 &&
                    selectedTools.every((tool) => {
                        const path = externalSkillPath(projectDir, tool, skillName);
                        return Boolean(path && existsSync(path));
                    });
            } else {
                exists = await isPackageInstalled(pkg.installer.packageName, scope!, projectDir);
            }
            results.push({
                type: 'package',
                id: `package:${pkgName}`,
                name: pkgName,
                label: isExternalSkill ? `External skill: ${pkgName}` : `Package: ${pkgName} (${scope})`,
                exists,
                status: exists ? 'installed' : 'missing',
                meta: { pkgName, scope, installerKind: pkg.installer.kind },
            });
        }
    }

    // 2. Configs
    for (const configName of plan.configs) {
        const config = CONFIGS[configName];
        const fileStates = config?.files.map((file) => existsSync(join(projectDir, file.dest))) ?? [];
        const exists = fileStates.length > 0 && fileStates.every(Boolean);
        const status: ComboComponentStatus = exists ? 'installed' : fileStates.some(Boolean) ? 'partial' : 'missing';
        results.push({
            type: 'config',
            id: `config:${configName}`,
            name: configName,
            label: `Config Template: ${configName}`,
            exists,
            status,
            meta: { configName },
        });
    }

    if (plan.skills.length > 0 && selectedTools.length > 0) {
        const skillChecks = await checkExistingSkills(projectDir, selectedTools, plan.skills);
        for (const check of skillChecks) {
            results.push({
                type: 'skill',
                id: `skill:${check.toolId}:${check.skillName}`,
                name: check.skillName,
                toolId: check.toolId,
                label: `Skill: ${check.skillName} in ${check.toolName}`,
                exists: check.exists,
                status: check.exists ? 'installed' : 'missing',
                meta: { skillName: check.skillName, toolId: check.toolId },
            });
        }
    }

    // 4. Rules
    if (combo.rules?.length) {
        const ruleTargets = selectedTools
            .map((tool) => ALLOWED_TARGETS.find((target) => target.id === tool.value))
            .filter((target): target is (typeof ALLOWED_TARGETS)[number] => Boolean(target?.agent?.rulesDir));
        const ruleChecks = await checkExistingRules(projectDir, ruleTargets, combo.rules);
        for (const check of ruleChecks) {
            results.push({
                type: 'rule',
                id: `rule:${check.toolId}:${check.ruleId}`,
                name: check.ruleId,
                toolId: check.toolId,
                label: `Rule: ${check.ruleId} in ${check.toolName}`,
                exists: check.exists,
                status: check.exists ? 'installed' : 'missing',
                meta: { ruleId: check.ruleId, toolId: check.toolId },
            });
        }
    }

    // 5. Workflows
    if (combo.workflows?.length) {
        const workflowChecks = await checkExistingWorkflows(projectDir, selectedTools, combo.workflows);
        for (const check of workflowChecks) {
            results.push({
                type: 'workflow',
                id: `workflow:${check.toolId}:${check.workflowName}`,
                name: check.workflowName,
                toolId: check.toolId,
                label: `Workflow: ${check.workflowName} in ${check.toolName}`,
                exists: check.exists,
                status: check.exists ? 'installed' : 'missing',
                meta: { workflowName: check.workflowName, toolId: check.toolId },
            });
        }
    }

    // 6. MCPs (Explicit + Inferred from skills)
    const mcps = new Set<string>(plan.mcps);
    if (plan.skills.includes('only-one-pr-git-skill')) mcps.add('github');
    if (plan.skills.includes('only-one-clockify-skill')) mcps.add('clockify');

    if (mcps.size > 0 && selectedTools.length > 0) {
        const supportedIdeIds: string[] = selectedTools
            .map((tool) => tool.value)
            .filter((value) => value === 'cursor' || value === 'antigravity');
        const unsupportedTools = selectedTools.filter((tool) => !supportedIdeIds.includes(tool.value));
        for (const tool of unsupportedTools) {
            for (const mcpId of mcps) {
                results.push({
                    type: 'mcp',
                    id: `mcp:${tool.value}:${mcpId}`,
                    name: mcpId,
                    toolId: tool.value,
                    label: `MCP Config: ${mcpId} in ${tool.name}`,
                    exists: false,
                    status: 'not-applicable',
                    meta: { mcpId, ideId: tool.value },
                });
            }
        }
        if (supportedIdeIds.length > 0) {
            const mcpChecks = await checkExistingMcps(homeDir, platform, supportedIdeIds, Array.from(mcps));
            for (const check of mcpChecks) {
                results.push({
                    type: 'mcp',
                    id: `mcp:${check.ideId}:${check.mcpId}`,
                    name: check.mcpId,
                    toolId: check.ideId,
                    label: `MCP Config: ${check.mcpId} in ${check.ideName}`,
                    exists: check.exists,
                    status: check.exists ? 'installed' : 'missing',
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
    const results: ComboInstallResult = {
        packages: [],
        configs: [],
        rules: [],
        skills: [],
        workflows: [],
        mcps: [],
    };
    const plan = buildComboDependencyPlan(combo, comboRegistries());

    // Get existing component info
    const checks = await checkExistingComboComponents({ projectDir, homeDir, platform, selectedTools, combo });

    // 1. Packages
    if (plan.packages.length) {
        for (const pkgName of plan.packages) {
            const check = checks.find((c) => c.type === 'package' && c.name === pkgName);
            const exists = check ? check.exists : false;

            if (exists && !overwriteList.includes(`package:${pkgName}`)) {
                results.packages.push({ name: pkgName, status: 'skipped' });
                continue;
            }

            const pkgManifests = await readPackageManifests();
            const pkg = pkgManifests.find((m) => m.id === pkgName);
            if (!pkg) {
                results.packages.push({ name: pkgName, status: 'failed', error: 'Package manifest not found' });
                continue;
            }

            deps.stdout(`  Installing ${pkg.installer.kind === 'skills' ? 'external skill' : 'package'} ${pkgName}...`);
            try {
                if (pkg.installer.kind === 'npm') {
                    await npmInstall(pkg.installer.packageName, pkg.installer.scope ?? 'global', projectDir);
                } else {
                    await installExternalSkill(pkg.installer, selectedTools, projectDir);
                }
                results.packages.push({ name: pkgName, status: 'success' });
            } catch (err: any) {
                results.packages.push({
                    name: pkgName,
                    status: 'failed',
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }

        // Initialize UI/UX Pro Max whenever its package is available, including an existing global installation.
        const uiuxResult = results.packages.find((pkg) => pkg.name === 'ui-ux-pro-max-cli');
        if (uiuxResult && uiuxResult.status !== 'failed' && selectedTools.length > 0) {
            deps.stdout('\nInitializing UI/UX Pro Max CLI...');
            for (const tool of selectedTools) {
                const aiTarget = UIPRO_AI_TARGETS[tool.value];
                if (!aiTarget) continue;
                try {
                    deps.stdout(`  Running: npx ui-ux-pro-max-cli init --ai ${aiTarget} --force`);
                    await execFileAsync('npx', ['ui-ux-pro-max-cli', 'init', '--ai', aiTarget, '--force'], {
                        cwd: projectDir,
                        shell: true,
                    });
                    deps.stdout(`    ✓ UI/UX Pro Max initialized successfully for ${tool.name}`);
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    uiuxResult.status = 'failed';
                    uiuxResult.error = `UI/UX Pro Max initialization failed for ${tool.name}: ${message}`;
                    deps.stdout(`    ✗ ${uiuxResult.error}`);
                }
            }
        }
    }

    // 4. Rules
    if (plan.rules.length > 0) {
        const ruleTargets = selectedTools
            .map((tool) => ALLOWED_TARGETS.find((target) => target.id === tool.value))
            .filter((target): target is (typeof ALLOWED_TARGETS)[number] => Boolean(target?.agent?.rulesDir));
        if (ruleTargets.length > 0) {
            const ruleResult = await installRules({
                deps,
                projectDir,
                selectedTargets: ruleTargets,
                ruleIds: plan.rules,
                overwriteList: overwriteList.filter((item) => item.startsWith('rule:')).map((item) => item.substring(5)),
            });
            results.rules = ruleResult.results;
        }
    }

    // 5. Skills
    if (plan.skills.length && selectedTools.length > 0) {
        // Map the combo overwriteList to the format expected by installSkills ("toolId:skillName")
        const skillOverwrites = overwriteList.filter((item) => item.startsWith('skill:')).map((item) => item.substring(6)); // strip "skill:" prefix

        const skillResults = await installSkills({
            deps,
            projectDir,
            selectedTools,
            skillNames: plan.skills,
            overwriteList: skillOverwrites,
            noIgnore,
        });
        results.skills = skillResults;
    }

    // 5. Configs
    if (plan.configs.length && existsSync(configsDir)) {
        try {
            for (const configName of plan.configs) {
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

    // 6. Workflows
    if (plan.workflows.length > 0 && selectedTools.length > 0) {
        results.workflows = await installWorkflows({
            deps,
            projectDir,
            selectedTools,
            workflowNames: plan.workflows,
            overwriteList: overwriteList.filter((item) => item.startsWith('workflow:')).map((item) => item.substring(9)),
            noIgnore,
        });
    }

    // 7. MCPs
    const mcps = new Set<string>(plan.mcps);
    if (plan.skills.includes('only-one-pr-git-skill')) mcps.add('github');
    if (plan.skills.includes('only-one-clockify-skill')) mcps.add('clockify');

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
