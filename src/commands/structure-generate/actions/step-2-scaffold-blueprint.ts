import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { StructurePathResolutionError } from '@/core/structure/paths.js';
import { scaffoldStructureOutput } from '@/core/structure/scaffold.js';
import { readBlueprintStatus } from '@/core/structure/status.js';
import type { StructureGenerateCommandOptions } from '../types.js';

export const scaffoldBlueprintStep = async (deps: ProgramDeps, projectDir: string, options: StructureGenerateCommandOptions) => {
    try {
        const scaffold = await scaffoldStructureOutput(projectDir, options.output);
        if (scaffold.usesDefaultOrganization) {
            deps.stdout(
                COLORS.warning(
                    '  Note: organization not set in config; using "default" in blueprint filename. Run only-one init to set organization.',
                ),
            );
        }

        const blueprintStatus = readBlueprintStatus(scaffold.blueprintPath, {
            output: options.output,
            projectDir,
        });

        return { ok: true, scaffold, blueprintStatus };
    } catch (error) {
        if (error instanceof StructurePathResolutionError) {
            deps.stderr?.(error.message) ?? deps.stdout(error.message);
            process.exitCode = 1;
            return { ok: false, error };
        }
        throw error;
    }
};
