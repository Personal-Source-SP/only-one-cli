import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { formatUpdateHumanLines, updateAgentArtifacts } from '@/core/agent/update.js';
import { printJson } from '@/core/output/index.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';
import { COLORS } from '@/constants/index.js';

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
        .action(async (path: string | undefined, options: { force?: boolean }, command) => {
            const projectDir = resolveProjectDir(deps, path);
            assertProjectDirectory(projectDir);
            const parent = command.parent?.opts() ?? {};

            const result = await updateAgentArtifacts({ force: options.force, projectDir });

            if (parent.json) {
                printJson(result, deps.stdout);
                return;
            }

            const lines = formatUpdateHumanLines(result);
            if (lines.length > 0) {
                deps.stdout(COLORS.success(lines[0]));
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.includes('skill:') || line.includes('command:')) {
                        deps.stdout(`  ${COLORS.primary(line.trim())}`);
                    } else {
                        deps.stdout(COLORS.dim(line));
                    }
                }
            }
        });
}
