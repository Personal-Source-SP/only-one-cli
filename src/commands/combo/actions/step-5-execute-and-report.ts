import { homedir } from 'node:os';

import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import type { AgentToolOption } from '@/core/agent/tools.js';
import { type ExtendedComboManifest, installCombo } from '@/core/combo/index.js';
import { writeIgnoreTemplates } from '@/core/ignore/index.js';

import type { ComboCommandOptions } from '../types.js';

export const executeAndReportComboStep = async (
    deps: ProgramDeps,
    projectDir: string,
    combo: ExtendedComboManifest,
    targetTools: AgentToolOption[],
    overwriteList: string[],
    options: ComboCommandOptions,
    ignoreTargets: import('@/core/ignore/index.js').IgnoreTarget[] = [],
): Promise<void> => {
    const results = await installCombo({
        deps,
        projectDir,
        homeDir: homedir(),
        platform: process.platform,
        selectedTools: targetTools,
        combo,
        overwriteList,
        noIgnore: options.ignore === false || Boolean(options.global),
        isGlobal: Boolean(options.global),
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

    if (results.rules.length) {
        deps.stdout('\nRules:');

        for (const rule of results.rules) {
            const statusColor =
                rule.status === 'success' || rule.status === 'overwritten'
                    ? COLORS.success
                    : rule.status === 'skipped'
                      ? COLORS.dim
                      : rule.status === 'installed_not_ready'
                        ? COLORS.warning
                        : COLORS.error;
            deps.stdout(
                `  - ${COLORS.secondary(rule.ruleId)} in ${COLORS.primary(rule.toolName)}: ${statusColor(rule.status)}${rule.error ? ` (${rule.error})` : rule.details ? ` (${rule.details})` : ''}`,
            );
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

    if (results.workflows.length) {
        deps.stdout('\nWorkflows:');

        for (const workflow of results.workflows) {
            const statusColor = workflow.status === 'success' ? COLORS.success : workflow.status === 'skipped' ? COLORS.dim : COLORS.error;
            deps.stdout(
                `  - ${COLORS.secondary(workflow.workflowName)} in ${COLORS.primary(workflow.toolName)}: ${statusColor(workflow.status)}${workflow.error ? ` (${workflow.error})` : ''}`,
            );
        }
    }

    if (results.subagents?.length) {
        deps.stdout('\nSubagents:');

        for (const s of results.subagents) {
            const toolName = targetTools.find((t) => t.value === s.toolId)?.name || s.toolId;
            const statusColor = s.status === 'success' ? COLORS.success : s.status === 'skipped' ? COLORS.dim : COLORS.error;
            deps.stdout(
                `  - ${COLORS.secondary(s.subagentName)} in ${COLORS.primary(toolName)}: ${statusColor(s.status)}${s.error ? ` (${s.error})` : ''}`,
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

    if (results.hooks?.length) {
        deps.stdout('\nHooks:');

        for (const h of results.hooks) {
            const statusColor = h.status === 'success' ? COLORS.success : COLORS.error;
            deps.stdout(`  - ${COLORS.secondary(h.name)} in ${COLORS.primary('hooks')}: ${statusColor(h.status)}`);
        }
    }

    deps.stdout('\n==================================================\n');

    if (!options.global) {
        await writeIgnoreTemplates(projectDir, ignoreTargets);
    }
};
