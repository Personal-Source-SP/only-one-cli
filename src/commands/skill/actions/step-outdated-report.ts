import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { checkAllSkillsFreshness } from '@/core/skill/remote/inspector.js';

export async function reportOutdatedSkillsStep(deps: ProgramDeps, projectDir: string): Promise<void> {
    deps.stdout('\nChecking skills freshness against upstream GitHub repositories...');

    const reports = await checkAllSkillsFreshness(projectDir);

    if (reports.length === 0) {
        deps.stdout(COLORS.dim('\nNo skills found in project or lockfile.'));
        return;
    }

    deps.stdout('\n=============================================================================');
    deps.stdout('                         SKILLS FRESHNESS REPORT');
    deps.stdout('=============================================================================');

    for (const r of reports) {
        let statusBadge = COLORS.success('✓ Up to date');
        let hint = '';

        if (r.state === 'update-available') {
            statusBadge = COLORS.warning('⚠️  Update Available');
            hint = COLORS.dim(` (run: only-one skill update ${r.skillName})`);
        } else if (r.state === 'local-modified') {
            statusBadge = COLORS.secondary('✎ Local Modified');
        } else if (r.state === 'not-installed') {
            statusBadge = COLORS.dim('○ Not Installed');
        } else if (r.state === 'offline') {
            statusBadge = COLORS.dim('? Offline');
        }

        deps.stdout(`  - ${COLORS.primary(r.skillName.padEnd(30))} [${COLORS.dim(r.source)}] : ${statusBadge}${hint}`);
    }

    deps.stdout('=============================================================================\n');
}
