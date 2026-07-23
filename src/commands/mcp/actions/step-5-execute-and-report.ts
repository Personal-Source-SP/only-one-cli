import { homedir } from 'node:os';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { syncMcpGlobalConfig, type McpManifest } from '@/core/mcp/index.js';

export const executeAndReportMcpStep = async (
    deps: ProgramDeps,
    selectedIdeIds: string[],
    selectedManifests: McpManifest[],
    overwriteList: string[],
): Promise<void> => {
    const homeDir = deps.env.HOME || deps.env.USERPROFILE || homedir();
    deps.stdout('\nSyncing MCP global configurations...');

    const response = await syncMcpGlobalConfig({
        cwd: deps.cwd,
        homeDir,
        ideIds: selectedIdeIds,
        manifests: selectedManifests,
        platform: process.platform,
        write: deps.stdout,
        overwriteList,
    });

    deps.stdout('\n==================================================');
    deps.stdout('                 MCP SYNC REPORT');
    deps.stdout('==================================================');

    for (const result of response.results) {
        deps.stdout(`\n${COLORS.primary(result.ideName)} (${COLORS.dim(result.configPath)}):`);
        for (const entry of result.results) {
            const keys = entry.credentialKeys.length ? `; fill manually: ${entry.credentialKeys.join(', ')}` : '';
            if (entry.status === 'skipped') {
                deps.stdout(`  - ${COLORS.secondary(entry.id)}: ${COLORS.dim('skipped (kept existing)')}`);
            } else if (entry.status === 'overwritten') {
                deps.stdout(`  ✓ ${COLORS.secondary(entry.id)}: ${COLORS.success('overwritten')}${COLORS.warning(keys)}`);
            } else {
                deps.stdout(`  ✓ ${COLORS.secondary(entry.id)}: ${COLORS.success(entry.status)}${COLORS.warning(keys)}`);
            }
        }
    }
    deps.stdout('\n==================================================\n');
};
