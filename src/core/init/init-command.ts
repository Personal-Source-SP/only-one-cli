import type { ProgramDeps } from '@/cli/deps.js';
import { printJson } from '@/core/output/index.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';
import type { InitCommandRequest, InitCommandResponse } from './types.js';
import { ensureOpenspecCli, runOpenspecInit, OpenspecBootstrapError } from '@library/openspec-bootstrap/index.js';
import { syncCustomSkills } from '@library/custom-skills-sync/index.js';

export const executeInitCommand = async (deps: ProgramDeps, request: InitCommandRequest): Promise<InitCommandResponse | null> => {
    const projectDir = resolveProjectDir(deps, request.path);
    assertProjectDirectory(projectDir);
    const options = request.options;
    const installSkill = options.installSkill !== false;

    if (!installSkill) {
        return { installSkipped: true };
    }

    try {
        deps.stdout('Checking openspec CLI...');
        await ensureOpenspecCli();
        deps.stdout('Running openspec init...');
        await runOpenspecInit(deps, projectDir, { force: options.force, tools: options.tools });
        deps.stdout('Syncing custom skills...');
        await syncCustomSkills(deps, projectDir);
    } catch (error) {
        if (error instanceof OpenspecBootstrapError) {
            deps.stdout(`Error: ${error.message}`);
            return null;
        }
        throw error;
    }

    return { installSkipped: false };
};

export const printInitResult = (deps: ProgramDeps, parentJson: boolean, result: InitCommandResponse): void => {
    if (parentJson) {
        printJson({ installSkipped: result.installSkipped }, deps.stdout);
        return;
    }

    if (result.installSkipped) {
        deps.stdout('Init complete (skill installation skipped)');
        return;
    }

    deps.stdout('Init complete');
    deps.stdout('  openspec CLI: ready');
    deps.stdout('  Custom skills: synced to selected tools');
};
