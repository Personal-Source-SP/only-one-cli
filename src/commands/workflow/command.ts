import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import type { WorkflowCommandOptions } from './types.js';
import {
    confirmWorkflowOverwriteStep,
    executeAndReportWorkflowsStep,
    loadWorkflowManifestsStep,
    selectWorkflowsStep,
    selectWorkflowTargetStep,
} from './actions/index.js';

export function createWorkflowCommand(deps: ProgramDeps): Command {
    const cmd = new Command('workflow')
        .description('🤖 Manage and synchronize custom agent workflows')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of specific workflow names to sync')
        .option('--tool <tools>', 'Comma-separated IDE/tool IDs to target')
        .option('--no-ignore', 'Skip updating the project .gitignore file')
        .action(async (pathArg: string | undefined, namesArg: string | undefined, options: WorkflowCommandOptions) => {
            const { projectDir, availableWorkflows } = loadWorkflowManifestsStep(deps, pathArg);
            if (!availableWorkflows?.length) {
                return;
            }

            const { targetTool, targetTools } = await selectWorkflowTargetStep(deps, options);
            const { selectedWorkflows, allExistingWorkflows } = await selectWorkflowsStep(
                deps,
                projectDir,
                namesArg,
                availableWorkflows,
                targetTool,
                targetTools,
            );

            if (!selectedWorkflows?.length) {
                deps.stdout('No workflows selected. Exiting.');
                return;
            }

            const overwriteList = await confirmWorkflowOverwriteStep(deps, selectedWorkflows, allExistingWorkflows);
            await executeAndReportWorkflowsStep(deps, projectDir, targetTools, selectedWorkflows, overwriteList, options);
        });

    return cmd;
}
