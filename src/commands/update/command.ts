import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import type { UpdateCommandOptions } from './types.js';
import { resolveProjectStep, updateArtifactsStep } from './actions/index.js';

export function createUpdateCommand(deps: ProgramDeps): Command {
    return new Command('update')
        .description('🔄 Refresh installed agent skills and workflow templates')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .option('--force', 'Overwrite agent skill and workflow files even if local and remote versions match')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one update')}\n` +
                `  ${COLORS.cli.command('$ only-one update /path/to/project --force')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('Looks up installed agent tools in the project configurations and pulls the latest definitions from the source registry.')}\n` +
                `  - ${COLORS.dim('Useful when updating CLI versions or retrieving upstream template improvements.')}`,
        )
        .action(async (path: string | undefined, options: UpdateCommandOptions, command) => {
            const projectDir = resolveProjectStep(deps, path);
            const parent = command.parent?.opts() ?? {};
            await updateArtifactsStep(deps, projectDir, options, Boolean(parent.json));
        });
}
