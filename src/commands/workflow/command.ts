import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { createSkillCommand } from '@/commands/skill/command.js';

export function createWorkflowCommand(deps: ProgramDeps): Command {
    const cmd = new Command('workflow')
        .description('🤖 [DEPRECATED] Workflows are now unified into Agent Skills')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of specific workflow names to sync')
        .option('--tool <tools>', 'Comma-separated IDE/tool IDs to target')
        .option('--no-ignore', 'Skip updating the project .gitignore file')
        .option('-g, --global', 'Install workflows globally to user IDE config directories (~/.only-one)')
        .allowUnknownOption(true)
        .action(async (...actionArgs) => {
            deps.stdout('⚠️  [DEPRECATED] Workflows have been unified into Agent Skills. Redirecting to "only-one skill"...');
            const command = actionArgs[actionArgs.length - 1];
            const raw = command?.parent?.rawArgs || (cmd as any).rawArgs || process.argv;
            const wfIndex = raw.findIndex((arg: string) => arg === 'workflow');
            const argsAfter = wfIndex >= 0 ? raw.slice(wfIndex + 1) : raw.length > 2 ? raw.slice(2) : [];
            const skillCmd = createSkillCommand(deps);
            await skillCmd.parseAsync(['node', 'skill', ...argsAfter]);
        });

    return cmd;
}
