import { Command } from 'commander';
import { localConfigDisplayPath } from '../../core/config/index.js';
import type { ProgramDeps } from '../../cli/deps.js';
import { executeInitCommand, printInitResult } from '../../core/init/init-command.js';
import type { InitCommandOptions } from './types.js';

export function createInitCommand(deps: ProgramDeps): Command {
    return new Command('init')
        .description(`Create ${localConfigDisplayPath()} under the project .only-one/ folder`)
        .option('--server <url>', 'Backend server URL')
        .option('--project-name <name>', 'Project name in organization/repository format')
        .option('--index-mode <mode>', 'Index build strategy: local or docker')
        .option('--source-uri <uri>', 'GitHub repository URL (HTTPS format)')
        .option('--default-branch <branch>', 'Default branch of the repository')
        .option('--git-token <token>', 'GitHub personal access token for private repositories')
        .option('--force', 'Overwrite an existing config file without confirmation')
        .option('--no-install-skill', 'Skip installing structural agent skills')
        .option('--tools <tools>', 'Agent tools: all (30), none, or comma-separated ids (cursor, claude, windsurf, codex, …)')
        .argument('[path]', 'Project directory (default: current directory)')
        .action(async (path: string | undefined, options: InitCommandOptions, command) => {
            const installSkill = options.installSkill !== false;
            const result = await executeInitCommand(deps, {
                command,
                json: Boolean(command.parent?.opts()?.json),
                options: { ...options, installSkill },
                path,
            });

            if (!result) {
                return;
            }

            printInitResult(deps, Boolean(command.parent?.opts()?.json), result);
        });
}
