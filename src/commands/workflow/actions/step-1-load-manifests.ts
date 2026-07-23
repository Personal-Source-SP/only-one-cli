import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';
import { WORKFLOWS } from '@assets/workflows/index.js';

export const loadWorkflowManifestsStep = (deps: ProgramDeps, pathArg?: string): { projectDir: string; availableWorkflows: string[] } => {
    const projectDir = resolveProjectDir(deps, pathArg);
    assertProjectDirectory(projectDir);

    const availableWorkflows = WORKFLOWS.map((w) => w.name);
    if (!availableWorkflows?.length) {
        deps.stdout(COLORS.warning('No workflows available in libraries/workflows.'));
    }

    return { projectDir, availableWorkflows };
};
