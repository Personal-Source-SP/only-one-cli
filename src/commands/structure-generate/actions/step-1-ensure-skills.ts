import type { ProgramDeps } from '@/cli/deps.js';
import { ensureStructureAgentSkills } from '@/core/agent/ensure-skills.js';
import { persistConfigAgentTools } from '@/core/config/index.js';
import type { StructureGenerateCommandOptions } from '../types.js';

export const ensureStructureSkillsStep = async (
    deps: ProgramDeps,
    projectDir: string,
    options: StructureGenerateCommandOptions,
): Promise<{ ok: boolean; message?: string }> => {
    if (options.status || options.installSkill === false) {
        return { ok: true };
    }

    const gate = await ensureStructureAgentSkills(deps, {
        force: Boolean(options.force),
        noInstallSkill: false,
        projectDir,
        toolsArg: options.tools,
    });

    if (!gate.ok) {
        deps.stderr?.(gate.message) ?? deps.stdout(gate.message);
        process.exitCode = gate.exitCode;
        return { ok: false, message: gate.message };
    }

    if (gate.setupRan && gate.agentTools?.length) {
        await persistConfigAgentTools(projectDir, gate.agentTools);
    }

    return { ok: true };
};
