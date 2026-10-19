import { homedir } from 'node:os';
import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { selectIgnoreTargets } from '@/core/ignore/index.js';
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
        .option('-g, --global', 'Install workflows globally to user IDE config directories (~/.only-one)')
        .action(async (pathArg: string | undefined, namesArg: string | undefined, options: WorkflowCommandOptions) => {
            const targetDir = options.global ? homedir() : pathArg;
            const { projectDir, availableWorkflows } = loadWorkflowManifestsStep(deps, targetDir);
            if (!availableWorkflows?.length) {
                return;
            }

            const { targetTool, targetTools } = await selectWorkflowTargetStep(deps, options);
            const workflowNamesArg = options.global && pathArg && !namesArg ? pathArg : namesArg;
            const { selectedWorkflows, allExistingWorkflows } = await selectWorkflowsStep(
                deps,
                projectDir,
                workflowNamesArg,
                availableWorkflows,
                targetTool,
                targetTools,
                Boolean(options.global),
            );

            if (!selectedWorkflows?.length) {
                deps.stdout('No workflows selected. Exiting.');
                return;
            }

            const ignoreTargets = options.global || options.ignore === false ? [] : await selectIgnoreTargets(deps);

            const overwriteList = await confirmWorkflowOverwriteStep(deps, selectedWorkflows, allExistingWorkflows);
            await executeAndReportWorkflowsStep(deps, projectDir, targetTools, selectedWorkflows, overwriteList, options, ignoreTargets);
        });

    return cmd;
}
