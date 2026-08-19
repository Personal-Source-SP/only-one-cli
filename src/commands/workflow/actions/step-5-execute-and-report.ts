import type { ProgramDeps } from '@/cli/deps.js';
import { writeIgnoreTemplates } from '@/core/ignore/index.js';
import { COLORS } from '@/constants/index.js';
import type { AgentToolOption } from '@/core/agent/tools.js';
import { installWorkflows } from '@/core/workflow/index.js';
import { checkExistingSkills } from '@/core/skill/index.js';
import { WORKFLOWS } from '@assets/workflows/index.js';
import type { WorkflowCommandOptions } from '../types.js';

export const executeAndReportWorkflowsStep = async (
    deps: ProgramDeps,
    projectDir: string,
    targetTools: AgentToolOption[],
    selectedWorkflows: string[],
    overwriteList: string[],
    options: WorkflowCommandOptions,
    ignoreTargets: import('@/core/ignore/index.js').IgnoreTarget[] = [],
): Promise<void> => {
    deps.stdout('\nSyncing workflows...');

    const results = await installWorkflows({
        deps,
        projectDir,
        selectedTools: targetTools,
        workflowNames: selectedWorkflows,
        overwriteList,
        noIgnore: options.ignore === false,
    });

    deps.stdout('\n==================================================');
    deps.stdout('               WORKFLOWS SYNC REPORT');
    deps.stdout('==================================================');

    const successes = results.filter((r) => r.status === 'success');
    const skips = results.filter((r) => r.status === 'skipped');
    const failures = results.filter((r) => r.status === 'failed');

    if (successes.length > 0) {
        deps.stdout(COLORS.success('\n✓ Successfully Installed (New/Reinstalled):'));
        for (const r of successes) {
            deps.stdout(`  - ${COLORS.secondary(r.workflowName)} -> ${COLORS.primary(r.toolName)}`);
        }
    }

    if (skips.length > 0) {
        deps.stdout(COLORS.dim('\n- Skipped (Kept Existing):'));
        for (const r of skips) {
            deps.stdout(`  - ${COLORS.secondary(r.workflowName)} in ${COLORS.primary(r.toolName)}`);
        }
    }

    if (failures.length > 0) {
        deps.stdout(COLORS.error('\n✗ Failed:'));
        for (const r of failures) {
            deps.stdout(`  - ${COLORS.secondary(r.workflowName)} in ${COLORS.primary(r.toolName)}: ${COLORS.warning(r.error || '')}`);
        }
    }

    deps.stdout('\n==================================================\n');

    // Notify about required skills & MCPs
    const installedWorkflowNames = [...successes, ...skips].map((r) => r.workflowName);
    const requiredSkills = new Set<string>();
    const mcpWarnings = new Set<string>();

    for (const name of installedWorkflowNames) {
        const wfMeta = WORKFLOWS.find((w) => w.name === name);
        if (wfMeta?.requiredSkills?.length) {
            for (const skill of wfMeta.requiredSkills) {
                requiredSkills.add(skill);
            }
        }
        if (wfMeta?.requiredMcps?.length) {
            for (const mcp of wfMeta.requiredMcps) {
                mcpWarnings.add(mcp);
            }
        }
    }

    if (requiredSkills.size > 0) {
        const skillList = Array.from(requiredSkills);
        const existingSkillChecks = await checkExistingSkills(projectDir, targetTools, skillList);
        const missingSkills = Array.from(new Set(existingSkillChecks.filter((s) => !s.exists).map((s) => s.skillName)));

        if (missingSkills.length > 0) {
            deps.stdout(COLORS.warning('💡 Dependency Notice:'));
            deps.stdout(`  The installed workflow(s) recommend skill(s):`);
            for (const skill of missingSkills) {
                deps.stdout(`  - ${COLORS.secondary(skill)} (Run: 'only-one skill ${skill}' to install)`);
            }
            deps.stdout('\n==================================================\n');
        }
    }

    if (mcpWarnings.size > 0) {
        deps.stdout(COLORS.warning('💡 Dependency Notice:'));
        deps.stdout(`  The installed workflow(s) require global MCP server configuration for:`);
        for (const mcp of mcpWarnings) {
            deps.stdout(`  - ${COLORS.secondary(mcp)} (Run: 'only-one mcp ${mcp}' to configure)`);
        }
        deps.stdout('\n==================================================\n');
    }

    await writeIgnoreTemplates(projectDir, ignoreTargets);
};
