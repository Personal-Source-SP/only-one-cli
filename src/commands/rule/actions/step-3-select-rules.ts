import type { ProgramDeps } from '@/cli/deps.js';
import { checkExistingRules } from '@/core/rule/index.js';
import type { AllowedTarget } from '@/core/target-selection/catalog.js';
import { RULES } from '@assets/rules/index.js';
import { parseCsv } from '@/utils/index.js';
import type { RuleCommandOptions } from '../types.js';

export const selectRulesStep = async (
    deps: ProgramDeps,
    projectDir: string,
    idsArg: string | undefined,
    options: RuleCommandOptions,
    targetTools: AllowedTarget[],
    agentName: string,
): Promise<{ selectedRuleIds: string[]; allExistingRules: Awaited<ReturnType<typeof checkExistingRules>> }> => {
    const explicitRuleIds = parseCsv(idsArg);
    if (options.tool && explicitRuleIds.length === 0 && !deps.prompts?.checkbox) {
        throw new Error('Rule selection is required in non-interactive mode. Pass rule IDs positionally.');
    }

    const allAvailableRuleIds = RULES.map((r) => r.id);
    const allExistingRules = await checkExistingRules(projectDir, targetTools, allAvailableRuleIds);

    let selectedRuleIds = parseCsv(idsArg);
    if (!selectedRuleIds?.length) {
        if (!deps.prompts?.checkbox) {
            throw new Error('Rule selection is required in non-interactive mode. Pass rule IDs positionally.');
        } else {
            selectedRuleIds = await deps.prompts.checkbox({
                message: `Select rules to sync for ${agentName}:`,
                choices: RULES.map((r) => {
                    const isExisting = allExistingRules.some((e) => e.ruleId === r.id && e.exists);
                    return {
                        name: isExisting ? `${r.id} (already exists)` : r.id,
                        value: r.id,
                        checked: !isExisting,
                    };
                }),
            });
        }
    } else {
        for (const ruleId of selectedRuleIds) {
            const rule = RULES.find((r) => r.id === ruleId);
            if (!rule) {
                throw new Error(`Rule '${ruleId}' not found in assets/rules`);
            }
        }
    }

    return { selectedRuleIds, allExistingRules };
};
