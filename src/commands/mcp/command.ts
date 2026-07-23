import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import type { McpCommandOptions } from './types.js';
import {
    confirmMcpOverwriteStep,
    executeAndReportMcpStep,
    loadMcpManifestsStep,
    selectMcpsStep,
    selectMcpTargetStep,
} from './actions/index.js';

export function createMcpCommand(deps: ProgramDeps): Command {
    const cmd = new Command('mcp')
        .description('🔌 Configure and synchronize Model Context Protocol (MCP) servers globally')
        .helpOption('-h, --help', 'display help for command')
        .argument('[names]', 'Comma-separated list of MCP server IDs to configure')
        .option('--ide <ides>', 'Target IDE ID (antigravity, claude, cursor, codex)')
        .action(async (namesArg: string | undefined, options: McpCommandOptions) => {
            const manifests = await loadMcpManifestsStep(deps);
            const selectedIde = await selectMcpTargetStep(deps, options);
            const selectedIdeIds = [selectedIde.id];

            const { selectedMcpIds, selectedManifests, allExisting } = await selectMcpsStep(deps, namesArg, manifests, selectedIde);

            if (!selectedMcpIds?.length) {
                deps.stdout('No MCP servers selected. Exiting.');
                return;
            }

            const overwriteList = await confirmMcpOverwriteStep(deps, selectedMcpIds, allExisting);
            await executeAndReportMcpStep(deps, selectedIdeIds, selectedManifests, overwriteList);
        });

    return cmd;
}
