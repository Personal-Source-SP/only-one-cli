import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { parseCsv } from '@/utils/index.js';
import type { RuleCommandOptions } from './types.js';
import {
    confirmRuleOverwriteStep,
    executeAndReportRulesStep,
    loadRuleManifestsStep,
    selectRulesStep,
    selectRuleTargetStep,
} from './actions/index.js';

export function createRuleCommand(deps: ProgramDeps): Command {
    const cmd = new Command('rule')
        .description('📜 Manage and copy persistent agent rules')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[ids]', 'Comma-separated list of specific rule IDs to sync')
        .option('--tool <tools>', 'Comma-separated IDE/tool IDs to target')
        .action(async (pathArg: string | undefined, idsArg: string | undefined, options: RuleCommandOptions) => {
            const { projectDir, rules } = loadRuleManifestsStep(deps, pathArg);
            if (!rules?.length) {
                return;
            }

            const explicitRuleIds = parseCsv(idsArg);
            const { targetTools, agentName } = await selectRuleTargetStep(deps, options, explicitRuleIds);

            const { selectedRuleIds, allExistingRules } = await selectRulesStep(deps, projectDir, idsArg, options, targetTools, agentName);

            if (!selectedRuleIds?.length) {
                deps.stdout('No rules selected. Exiting.');
                return;
            }

            const overwriteList = await confirmRuleOverwriteStep(deps, selectedRuleIds, allExistingRules);
            await executeAndReportRulesStep(deps, projectDir, targetTools, selectedRuleIds, overwriteList);
        });

    return cmd;
}
