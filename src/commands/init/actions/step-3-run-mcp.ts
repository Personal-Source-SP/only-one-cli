import { homedir } from 'node:os';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { readMcpManifests } from '@/core/mcp/registry.js';
import { syncMcpGlobalConfig } from '@/core/mcp/sync.js';
import { selectAllowedMcpTargets } from '@/core/target-selection/index.js';
import { parseCsv } from '@/utils/index.js';

export const runInitMcpStep = async (deps: ProgramDeps, names?: string, options?: { ide?: string }): Promise<void> => {
    const { manifests, warnings } = await readMcpManifests();
    for (const warning of warnings) {
        deps.stdout(COLORS.warning(`Warning: skipped ${warning.file}: ${warning.message}`));
    }
    if (!manifests?.length) throw new Error('No MCP manifests available');

    const requestedMcpIds = parseCsv(names);
    let selectedMcpIds = requestedMcpIds;
    if (!selectedMcpIds?.length) {
        if (!deps.prompts?.checkbox) {
            throw new Error('MCP server selection is required in non-interactive mode. Pass server names positionally.');
        } else {
            selectedMcpIds = await deps.prompts.checkbox({
                message: 'Select MCP servers to configure',
                choices: manifests.map((manifest) => ({ name: manifest.id, value: manifest.id })),
            });
        }
    }
    if (!selectedMcpIds?.length) throw new Error('Select at least one MCP server');

    const selectedManifests = selectedMcpIds.map((id) => {
        const manifest = manifests.find((entry) => entry.id === id);
        if (!manifest) throw new Error(`Unknown MCP '${id}'`);
        return manifest;
    });

    const selectedIdeIds = (
        await selectAllowedMcpTargets({
            automatic: !options?.ide && !deps.prompts?.checkbox,
            emptyMessage: 'Select at least one target IDE',
            explicit: options?.ide,
            message: 'Select IDEs for global MCP config',
            prompts: deps.prompts,
        })
    ).map((adapter) => adapter.id);

    const response = await syncMcpGlobalConfig({
        cwd: deps.cwd,
        homeDir: deps.env.HOME || deps.env.USERPROFILE || homedir(),
        ideIds: selectedIdeIds,
        manifests: selectedManifests,
        platform: process.platform,
        write: deps.stdout,
    });

    for (const result of response.results) {
        deps.stdout(`${COLORS.primary(result.ideName)}: ${COLORS.dim(result.configPath)}`);
        for (const entry of result.results) {
            const keys = entry.credentialKeys.length ? `; fill manually: ${entry.credentialKeys.join(', ')}` : '';
            const statusColor = entry.status === 'added' || entry.status === 'unchanged' ? COLORS.success : COLORS.warning;
            deps.stdout(`  ${COLORS.secondary(entry.id)}: ${statusColor(entry.status)}${COLORS.warning(keys)}`);
        }
    }
};
