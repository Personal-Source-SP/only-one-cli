import { homedir } from 'node:os';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import type { AgentToolOption } from '@/core/agent/tools.js';
import { installCombo, type ExtendedComboManifest } from '@/core/combo/index.js';
import type { ComboCommandOptions } from '../types.js';

export const executeAndReportComboStep = async (
    deps: ProgramDeps,
    projectDir: string,
    combo: ExtendedComboManifest,
    targetTools: AgentToolOption[],
    overwriteList: string[],
    options: ComboCommandOptions,
): Promise<void> => {
    const results = await installCombo({
        deps,
        projectDir,
        homeDir: homedir(),
        platform: process.platform,
        selectedTools: targetTools,
        combo,
        overwriteList,
        noIgnore: options.ignore === false,
    });

    deps.stdout('\n==================================================');
    deps.stdout(`             COMBO '${combo.name.toUpperCase()}' REPORT`);
    deps.stdout('==================================================');

    if (results.packages?.length) {
        deps.stdout('\nPackages:');
        for (const p of results.packages) {
            const statusColor = p.status === 'success' ? COLORS.success : p.status === 'skipped' ? COLORS.dim : COLORS.error;
            deps.stdout(`  - ${COLORS.secondary(p.name)}: ${statusColor(p.status)}${p.error ? ` (${p.error})` : ''}`);
        }
    }

    if (results.configs?.length) {
        deps.stdout('\nConfigs:');
        for (const c of results.configs) {
            const statusColor = c.status === 'success' ? COLORS.success : c.status === 'skipped' ? COLORS.dim : COLORS.error;
            deps.stdout(`  - ${COLORS.secondary(c.name)}: ${statusColor(c.status)}${c.error ? ` (${c.error})` : ''}`);
        }
    }

    if (results.skills?.length) {
        deps.stdout('\nSkills:');
        for (const s of results.skills) {
            const toolName = targetTools.find((t) => t.value === s.toolId)?.name || s.toolId;
            const statusColor =
                s.status === 'success' || s.status === 'overwritten' ? COLORS.success : s.status === 'skipped' ? COLORS.dim : COLORS.error;
            deps.stdout(
                `  - ${COLORS.secondary(s.skillName)} in ${COLORS.primary(toolName)}: ${statusColor(s.status)}${s.error ? ` (${s.error})` : ''}`,
            );
        }
    }

    if (results.mcps?.length) {
        deps.stdout('\nMCP Configurations:');
        for (const m of results.mcps) {
            const ideName = m.ideId === 'cursor' ? 'Cursor' : m.ideId === 'antigravity' ? 'Antigravity' : m.ideId;
            const statusColor = m.status === 'success' ? COLORS.success : m.status === 'skipped' ? COLORS.dim : COLORS.error;
            deps.stdout(
                `  - ${COLORS.secondary(m.mcpId)} in ${COLORS.primary(ideName)}: ${statusColor(m.status)}${m.error ? ` (${m.error})` : ''}`,
            );
        }
    }

    deps.stdout('\n==================================================\n');
};
