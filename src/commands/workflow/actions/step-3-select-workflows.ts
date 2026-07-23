import type { ProgramDeps } from '@/cli/deps.js';
import type { AgentToolOption } from '@/core/agent/tools.js';
import { checkExistingWorkflows } from '@/core/workflow/index.js';
import { parseCsv } from '@/utils/index.js';

export const selectWorkflowsStep = async (
    deps: ProgramDeps,
    projectDir: string,
    namesArg: string | undefined,
    availableWorkflows: string[],
    targetTool: AgentToolOption,
    targetTools: AgentToolOption[],
): Promise<{ selectedWorkflows: string[]; allExistingWorkflows: Awaited<ReturnType<typeof checkExistingWorkflows>> }> => {
    const allExistingWorkflows = await checkExistingWorkflows(projectDir, targetTools, availableWorkflows);
    let selectedWorkflows = parseCsv(namesArg);

    if (!selectedWorkflows?.length) {
        if (!deps.prompts?.checkbox) {
            throw new Error('Workflow selection is required in non-interactive mode. Pass workflow names positionally.');
        }

        const choices = availableWorkflows.map((name) => {
            const isExisting = allExistingWorkflows.some((workflow) => workflow.workflowName === name && workflow.exists);
            return {
                name: isExisting ? `${name} (already exists)` : name,
                value: name,
                checked: !isExisting,
                isExisting,
            };
        });
        choices.sort((a, b) => Number(a.isExisting) - Number(b.isExisting));

        selectedWorkflows = await deps.prompts.checkbox({
            message: `Select workflows to add for ${targetTool.name}:`,
            choices: choices.map(({ isExisting, ...choice }) => choice),
        });
    } else {
        for (const workflow of selectedWorkflows) {
            if (!availableWorkflows.includes(workflow)) {
                throw new Error(`Workflow '${workflow}' not found in libraries/workflows`);
            }
        }
    }

    return { selectedWorkflows, allExistingWorkflows };
};
