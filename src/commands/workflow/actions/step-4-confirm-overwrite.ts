import type { ProgramDeps } from '@/cli/deps.js';
import type { checkExistingWorkflows } from '@/core/workflow/index.js';

export const confirmWorkflowOverwriteStep = async (
    deps: ProgramDeps,
    selectedWorkflows: string[],
    allExistingWorkflows: Awaited<ReturnType<typeof checkExistingWorkflows>>,
): Promise<string[]> => {
    const alreadyExisting = allExistingWorkflows.filter((w) => selectedWorkflows.includes(w.workflowName) && w.exists);
    let overwriteList: string[] = [];

    if (alreadyExisting.length > 0 && deps.prompts?.checkbox) {
        overwriteList = await deps.prompts.checkbox({
            message: 'The following workflows already exist. Select which ones you want to overwrite/reinstall:',
            choices: alreadyExisting.map((w) => ({
                name: `${w.workflowName} in ${w.toolName} (${w.destPath})`,
                value: `${w.toolId}:${w.workflowName}`,
                checked: true,
            })),
        });
    }

    return overwriteList;
};
