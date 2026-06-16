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

const executeToolsStep = async (deps: ProgramDeps, projectDir: string, yes: boolean): Promise<ToolsStepResult | null> => {
    const tools = getInstallableAgentTools();

    if (tools.length === 0) {
        deps.stdout('  No installable agent tools found');
        return null;
    }

    const choices = tools.map((t) => ({
        name: t.name,
        value: t.value,
    }));

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

    // Existence check
    if (!yes) {
        const existingTools: string[] = [];
        for (const tool of selectedTools) {
            if (tool.skillsDir && existsSync(join(projectDir, tool.skillsDir))) {
                existingTools.push(tool.name);
            }
        }

        if (existingTools.length > 0) {
            deps.stdout(`  Already configured: ${existingTools.join(', ')}`);
            const proceed = await confirm({
                message: 'Some tools are already configured. Reinstall skills?',
                default: false,
            });
            if (!proceed) {
                deps.stdout('  Tools step skipped by user');
                return null;
            }
        }
    }

    return { selectedTools };
};

// ─── Step 2: Packages ─────────────────────────────────────────────────

const executePackagesStep = async (deps: ProgramDeps, projectDir: string, yes: boolean): Promise<PackagesStepResult | null> => {
    const manifests = await readPackageManifests();

    if (manifests.length === 0) {
        deps.stdout('  No packages available');
        return null;
    }

    const choices = manifests.map((pkg) => ({
        name: pkg.description ? `${pkg.name} — ${pkg.description}` : pkg.name,
        value: pkg.name,
    }));

    const selectedNames = await searchableMultiSelect({
        message: 'Select packages to install:',
        choices,
    });

    if (selectedNames.length === 0) return null;

    const selectedManifests = manifests.filter((pkg) => selectedNames.includes(pkg.name));
    const installedPackages: string[] = [];

    for (const pkg of selectedManifests) {
        const scope = pkg.scope ?? 'global';
        const already = await isPackageInstalled(pkg.name, scope, projectDir);

        if (already && !yes) {
            const proceed = await confirm({
                message: `${pkg.name} already installed. Reinstall?`,
                default: false,
            });
            if (!proceed) continue;
        }

        deps.stdout(`  Installing ${pkg.name}...`);
        try {
            await npmInstall(pkg.name, scope, projectDir);
            installedPackages.push(pkg.name);
        } catch (error) {
            deps.stdout(`  ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    return { installedPackages };
};

// ─── Step 3: Skills ───────────────────────────────────────────────────

const executeSkillsStep = async (
    deps: ProgramDeps,
    projectDir: string,
    selectedTools: ToolsStepResult['selectedTools'],
    yes: boolean,
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

    const choices = skillNames.map((name) => ({
        name,
        value: name,
    }));

    const selectedSkillNames = await searchableMultiSelect({
        message: 'Select skills to install:',
        choices,
    });

    if (selectedSkillNames.length === 0) return null;

    const installedSkills: string[] = [];

    for (const skillName of selectedSkillNames) {
        for (const tool of selectedTools) {
            if (!tool.skillsDir) continue;

            const toolSkillsDir = join(projectDir, tool.skillsDir, 'skills');
            const destPath = join(toolSkillsDir, skillName);

            if (existsSync(destPath) && !yes) {
                const proceed = await confirm({
                    message: `${skillName} already exists in ${tool.name}. Overwrite?`,
                    default: false,
                });
                if (!proceed) continue;
            }

            const srcPath = join(skillsDir, skillName);
            await mkdir(toolSkillsDir, { recursive: true });
            await cp(srcPath, destPath, { recursive: true, force: true });
        }
        installedSkills.push(skillName);
    }

    return { installedSkills };
};

// ─── Orchestrator ─────────────────────────────────────────────────────

export const executeInitCommand = async (deps: ProgramDeps, request: InitCommandRequest): Promise<InitCommandResponse | null> => {
    const projectDir = resolveProjectDir(deps, undefined);
    assertProjectDirectory(projectDir);

    const options = request.options;
    const yes = options.yes ?? false;
    const skip = options.skip ? options.skip.split(',').map((s) => s.trim()) : [];
    const step = options.step;

    let toolsResult: ToolsStepResult | null = null;
    let packagesResult: PackagesStepResult | null = null;
    let skillsResult: SkillsStepResult | null = null;

    // Step 1: Tools
    if (!skip.includes('tools') && (!step || step === 'tools')) {
        deps.stdout('\n── Step 1: Tools ──');
        toolsResult = await executeToolsStep(deps, projectDir, yes);
        if (toolsResult) {
            deps.stdout(`  Selected: ${toolsResult.selectedTools.map((t) => t.name).join(', ')}`);
        }
    }

    // Step 2: Packages
    if (!skip.includes('packages') && (!step || step === 'packages')) {
        deps.stdout('\n── Step 2: Packages ──');
        packagesResult = await executePackagesStep(deps, projectDir, yes);
        if (packagesResult) {
            deps.stdout(`  Installed: ${packagesResult.installedPackages.join(', ') || '(none)'}`);
        }
    }

    // Step 3: Skills
    if (!skip.includes('skills') && (!step || step === 'skills')) {
        const toolsForSkills = toolsResult?.selectedTools ?? [];

        if (toolsForSkills.length === 0 && !step) {
            deps.stdout('\n── Step 3: Skills (skipped — no tools selected) ──');
        } else {
            deps.stdout('\n── Step 3: Skills ──');
            skillsResult = await executeSkillsStep(deps, projectDir, toolsForSkills, yes);
            if (skillsResult) {
                deps.stdout(`  Installed: ${skillsResult.installedSkills.join(', ') || '(none)'}`);
            }
        }
    }

    return {
        toolsStep: toolsResult ?? undefined,
        packagesStep: packagesResult ?? undefined,
        skillsStep: skillsResult ?? undefined,
    };
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

    deps.stdout('Init complete');

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
