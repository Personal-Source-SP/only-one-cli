import type { ProgramDeps } from '@/cli/deps.js';
import type { checkExistingRules } from '@/core/rule/index.js';

export const confirmRuleOverwriteStep = async (
    deps: ProgramDeps,
    selectedRuleIds: string[],
    allExistingRules: Awaited<ReturnType<typeof checkExistingRules>>,
): Promise<string[]> => {
    const alreadyExisting = allExistingRules.filter((r) => selectedRuleIds.includes(r.ruleId) && r.exists);
    let overwriteList: string[] = [];

    if (alreadyExisting.length > 0 && deps.prompts?.checkbox) {
        overwriteList = await deps.prompts.checkbox({
            message: 'The following rule files already exist. Select which ones you want to overwrite:',
            choices: alreadyExisting.map((r) => ({
                name: `${r.ruleId} in ${r.toolName} (${r.destPath})`,
                value: `${r.toolId}:${r.ruleId}`,
                checked: true,
            })),
        });
    }

    return overwriteList;
};
