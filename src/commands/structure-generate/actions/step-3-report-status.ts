import { relative } from 'node:path';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { printJson } from '@/core/output/index.js';
import type { readBlueprintStatus } from '@/core/structure/status.js';

export const reportStructureStatusStep = (
    deps: ProgramDeps,
    projectDir: string,
    scaffold: { blueprintPath: string; relativeBlueprintPath: string },
    blueprintStatus: ReturnType<typeof readBlueprintStatus>,
    isJsonOutput: boolean,
): void => {
    const payload = {
        blueprint: blueprintStatus,
        outputPath: scaffold.blueprintPath,
        projectDir,
        relativeBlueprintPath: scaffold.relativeBlueprintPath,
    };
    if (isJsonOutput) {
        printJson(payload, deps.stdout);
        return;
    }
    deps.stdout(`${COLORS.primary('Blueprint:')} ${COLORS.cli.accent(scaffold.relativeBlueprintPath)}`);
    deps.stdout(`  ${COLORS.primary('Exists:')} ${blueprintStatus.exists ? COLORS.success('yes') : COLORS.error('no')}`);
    if (blueprintStatus.legacyExists && blueprintStatus.legacyPath) {
        deps.stdout(
            `  ${COLORS.warning('Legacy:')} ${COLORS.dim(relative(projectDir, blueprintStatus.legacyPath))} (migrate to structure/ layout)`,
        );
    }
    if (blueprintStatus.missingSections?.length) {
        deps.stdout(`  ${COLORS.error('Missing sections:')} ${COLORS.warning(blueprintStatus.missingSections.join(', '))}`);
    }
};
