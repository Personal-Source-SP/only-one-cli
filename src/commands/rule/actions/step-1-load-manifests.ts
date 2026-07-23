import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';
import { RULES } from '@assets/rules/index.js';

export const loadRuleManifestsStep = (deps: ProgramDeps, pathArg?: string): { projectDir: string; rules: typeof RULES } => {
    const projectDir = resolveProjectDir(deps, pathArg);
    assertProjectDirectory(projectDir);

    if (!RULES?.length) {
        deps.stdout(COLORS.warning('No rules available in assets/rules.'));
    }

    return { projectDir, rules: RULES };
};
