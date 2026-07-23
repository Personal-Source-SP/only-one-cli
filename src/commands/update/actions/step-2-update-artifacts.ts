import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { formatUpdateHumanLines, updateAgentArtifacts } from '@/core/agent/update.js';
import { printJson } from '@/core/output/index.js';
import type { UpdateCommandOptions } from '../types.js';

export const updateArtifactsStep = async (
    deps: ProgramDeps,
    projectDir: string,
    options: UpdateCommandOptions,
    isJsonOutput: boolean,
): Promise<void> => {
    const result = await updateAgentArtifacts({ force: options.force, projectDir });

    if (isJsonOutput) {
        printJson(result, deps.stdout);
        return;
    }

    const lines = formatUpdateHumanLines(result);
    if (!lines?.length) {
        return;
    }

    deps.stdout(COLORS.success(lines[0]));
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('skill:') || line.includes('command:')) {
            deps.stdout(`  ${COLORS.primary(line.trim())}`);
        } else {
            deps.stdout(COLORS.dim(line));
        }
    }
};
