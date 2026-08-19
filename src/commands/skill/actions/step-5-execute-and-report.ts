import type { ProgramDeps } from '@/cli/deps.js';
import { writeIgnoreTemplates } from '@/core/ignore/index.js';
import { COLORS } from '@/constants/index.js';
import type { AgentToolOption } from '@/core/agent/tools.js';
import { installSkills } from '@/core/skill/index.js';
import type { SkillCommandOptions } from '../types.js';

export const executeAndReportSkillsStep = async (
    deps: ProgramDeps,
    projectDir: string,
    targetTools: AgentToolOption[],
    selectedSkills: string[],
    overwriteList: string[],
    options: SkillCommandOptions,
    ignoreTargets: import('@/core/ignore/index.js').IgnoreTarget[] = [],
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

    await writeIgnoreTemplates(projectDir, ignoreTargets);
};
