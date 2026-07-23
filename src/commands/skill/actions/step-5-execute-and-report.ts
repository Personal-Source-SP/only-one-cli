import { confirm } from '@inquirer/prompts';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import type { AgentToolOption } from '@/core/agent/tools.js';
import { installSkills } from '@/core/skill/index.js';
import { checkExistingWorkflows, installWorkflows } from '@/core/workflow/index.js';
import { SKILLS } from '@assets/skills/index.js';
import type { SkillCommandOptions } from '../types.js';

export const executeAndReportSkillsStep = async (
    deps: ProgramDeps,
    projectDir: string,
    targetTools: AgentToolOption[],
    selectedSkills: string[],
    overwriteList: string[],
    options: SkillCommandOptions,
): Promise<void> => {
    deps.stdout('\nSyncing skills...');

    const results = await installSkills({
        deps,
        projectDir,
        selectedTools: targetTools,
        skillNames: selectedSkills,
        overwriteList,
        noIgnore: options.ignore === false,
    });

    deps.stdout('\n==================================================');
    deps.stdout('                SKILLS SYNC REPORT');
    deps.stdout('==================================================');

    const successes = results.filter((r) => r.status === 'success');
    const overwrites = results.filter((r) => r.status === 'overwritten');
    const skips = results.filter((r) => r.status === 'skipped');
    const failures = results.filter((r) => r.status === 'failed');

    if (successes.length > 0) {
        deps.stdout(COLORS.success('\n✓ Successfully Installed (New):'));
        for (const r of successes) {
            deps.stdout(`  - ${COLORS.secondary(r.skillName)} -> ${COLORS.primary(r.toolName)}`);
        }
    }

    if (overwrites.length > 0) {
        deps.stdout(COLORS.success('\n✓ Successfully Overwritten/Reinstalled:'));
        for (const r of overwrites) {
            deps.stdout(`  - ${COLORS.secondary(r.skillName)} -> ${COLORS.primary(r.toolName)} [Overwritten]`);
        }
    }

    if (skips.length > 0) {
        deps.stdout(COLORS.dim('\n- Skipped (Kept Existing):'));
        for (const r of skips) {
            deps.stdout(`  - ${COLORS.secondary(r.skillName)} in ${COLORS.primary(r.toolName)}`);
        }
    }

    if (failures.length > 0) {
        deps.stdout(COLORS.error('\n✗ Failed:'));
        for (const r of failures) {
            deps.stdout(`  - ${COLORS.secondary(r.skillName)} in ${COLORS.primary(r.toolName)}: ${COLORS.warning(r.error || '')}`);
        }
    }

    deps.stdout('\n==================================================\n');

    const installedSkillNames = [...successes, ...overwrites].map((r) => r.skillName);
    const workflowsToPrompt = new Set<string>();

    for (const skillName of installedSkillNames) {
        const skillMeta = SKILLS.find((s) => s.name === skillName);
        if (skillMeta?.associatedWorkflows) {
            for (const wf of skillMeta.associatedWorkflows) {
                workflowsToPrompt.add(wf);
            }
        }
    }

    if (workflowsToPrompt.size > 0 && deps.prompts?.checkbox) {
        const wfList = Array.from(workflowsToPrompt);
        const checks = await checkExistingWorkflows(projectDir, targetTools, wfList);
        const missingWorkflows = Array.from(new Set(checks.filter((w) => !w.exists).map((w) => w.workflowName)));

        if (missingWorkflows.length > 0) {
            const installWfs = await confirm({
                message: `The installed skills are associated with workflow(s): ${missingWorkflows.join(', ')}. Would you like to install them?`,
                default: true,
            });

            if (installWfs) {
                deps.stdout('\nSyncing workflows...');
                const wfResults = await installWorkflows({
                    deps,
                    projectDir,
                    selectedTools: targetTools,
                    workflowNames: missingWorkflows,
                    overwriteList: missingWorkflows.map((w) => targetTools.map((t) => `${t.value}:${w}`)).flat(),
                    noIgnore: options.ignore === false,
                });

                deps.stdout('\n==================================================');
                deps.stdout('               WORKFLOWS SYNC REPORT');
                deps.stdout('==================================================');
                for (const r of wfResults) {
                    const statusColor = r.status === 'success' ? COLORS.success : r.status === 'skipped' ? COLORS.dim : COLORS.error;
                    deps.stdout(
                        `  - ${COLORS.secondary(r.workflowName)} -> ${COLORS.primary(r.toolName)}: ${statusColor(r.status)}${r.error ? ` (${r.error})` : ''}`,
                    );
                }
                deps.stdout('==================================================\n');
            }
        }
    }
};
