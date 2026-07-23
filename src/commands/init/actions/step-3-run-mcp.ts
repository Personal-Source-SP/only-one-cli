import type { ProgramDeps } from '@/cli/deps.js';
import { confirmMcpOverwriteStep, executeAndReportMcpStep, loadMcpManifestsStep, selectMcpsStep } from '@/commands/mcp/actions/index.js';
import { selectAllowedMcpTargets } from '@/core/target-selection/index.js';

export const runInitMcpStep = async (deps: ProgramDeps, names?: string, options?: { ide?: string }): Promise<void> => {
    const manifests = await loadMcpManifestsStep(deps);

    const selectedTargetAdapters = await selectAllowedMcpTargets({
        automatic: !options?.ide && !deps.prompts?.checkbox,
        emptyMessage: 'Select at least one target IDE',
        explicit: options?.ide,
        message: 'Select IDEs for global MCP config',
        prompts: deps.prompts,
    });
    const selectedIdeIds = selectedTargetAdapters.map((adapter) => adapter.id);
    const primaryTarget = selectedTargetAdapters[0];

    const { selectedMcpIds, selectedManifests, allExisting } = await selectMcpsStep(deps, names, manifests, primaryTarget);

    if (!selectedMcpIds?.length) {
        deps.stdout('No MCP servers selected. Exiting.');
        return;
    }

    const overwriteList = await confirmMcpOverwriteStep(deps, selectedMcpIds, allExisting);
    await executeAndReportMcpStep(deps, selectedIdeIds, selectedManifests, overwriteList);
};
