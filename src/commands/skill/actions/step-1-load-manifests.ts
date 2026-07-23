import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';
import { SKILLS } from '@assets/skills/index.js';

export const loadSkillManifestsStep = (deps: ProgramDeps, pathArg?: string): { projectDir: string; availableSkills: string[] } => {
    const projectDir = resolveProjectDir(deps, pathArg);
    assertProjectDirectory(projectDir);

    const availableSkills = SKILLS.map((s) => s.name);
    if (!availableSkills?.length) {
        deps.stdout(COLORS.warning('No custom skills available in libraries/skills.'));
    }

    return { projectDir, availableSkills };
};
