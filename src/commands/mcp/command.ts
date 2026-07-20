import { Command } from 'commander';
import { homedir } from 'node:os';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { checkExistingMcps, syncMcpGlobalConfig, readMcpManifests, mcpIdeAdapters } from '@/core/mcp/index.js';

const parseCsv = (val?: string): string[] =>
    val
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? [];

export function createMcpCommand(deps: ProgramDeps): Command {
    const cmd = new Command('mcp')
        .description('🔌 Configure and synchronize Model Context Protocol (MCP) servers globally')
        .helpOption('-h, --help', 'display help for command')
        .argument('[names]', 'Comma-separated list of MCP server IDs to configure')
        .option('--ide <ides>', 'Comma-separated target IDE IDs (cursor, antigravity)')
        .option('--yes', 'Automatically confirm prompts')
        .action(async (namesArg: string | undefined, options: { ide?: string; yes?: boolean }) => {
            const { manifests, warnings } = await readMcpManifests();
            for (const warning of warnings) {
                deps.stdout(COLORS.warning(`Warning: skipped ${warning.file}: ${warning.message}`));
            }

            if (manifests.length === 0) {
                throw new Error('No MCP manifests available in libraries/mcps');
            }

            // 1. Select IDEs
            let selectedIdeIds = parseCsv(options.ide);
            if (selectedIdeIds.length === 0) {
                if (options.yes || !deps.prompts?.checkbox) {
                    selectedIdeIds = mcpIdeAdapters.map((a) => a.id);
                } else {
                    selectedIdeIds = await deps.prompts.checkbox({
                        message: 'Select target IDEs for global MCP sync:',
                        choices: mcpIdeAdapters.map((a) => ({
                            name: a.name,
                            value: a.id,
                            checked: true,
                        })),
                    });
                }
            }

            if (selectedIdeIds.length === 0) {
                throw new Error('Select at least one target IDE');
            }

            // 2. Select MCPs
            let selectedMcpIds = parseCsv(namesArg);
            if (selectedMcpIds.length === 0) {
                if (options.yes || !deps.prompts?.checkbox) {
                    selectedMcpIds = manifests.map((m) => m.id);
                } else {
                    selectedMcpIds = await deps.prompts.checkbox({
                        message: 'Select MCP servers to configure (default all):',
                        choices: manifests.map((m) => ({
                            name: m.id,
                            value: m.id,
                            checked: true,
                        })),
                    });
                }
            }

            if (selectedMcpIds.length === 0) {
                deps.stdout('No MCP servers selected. Exiting.');
                return;
            }

            // Validate requested MCPs
            const selectedManifests = selectedMcpIds.map((id) => {
                const found = manifests.find((m) => m.id === id);
                if (!found) throw new Error(`Unknown MCP server '${id}'`);
                return found;
            });

            // 3. Pre-execution Duplicate Check
            const homeDir = deps.env.HOME || deps.env.USERPROFILE || homedir();
            const existing = await checkExistingMcps(homeDir, process.platform, selectedIdeIds, selectedMcpIds);
            const alreadyExisting = existing.filter((m) => m.exists);
            let overwriteList: string[] = [];

            // 4. Verification Checkbox Prompt
            if (alreadyExisting.length > 0) {
                if (options.yes || !deps.prompts?.checkbox) {
                    overwriteList = alreadyExisting.map((m) => `${m.ideId}:${m.mcpId}`);
                } else {
                    overwriteList = await deps.prompts.checkbox({
                        message: 'The following MCP configurations already exist. Select which ones you want to overwrite/reconfigure:',
                        choices: alreadyExisting.map((m) => ({
                            name: `${m.mcpId} in ${m.ideName}`,
                            value: `${m.ideId}:${m.mcpId}`,
                            checked: true,
                        })),
                    });
                }
            }

            deps.stdout('\nSyncing MCP global configurations...');

            // 5. Execution
            const response = await syncMcpGlobalConfig({
                cwd: deps.cwd,
                homeDir,
                ideIds: selectedIdeIds,
                manifests: selectedManifests,
                platform: process.platform,
                write: deps.stdout,
                overwriteList,
            });

            // 6. Summary Report
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
        });

    return cmd;
}
