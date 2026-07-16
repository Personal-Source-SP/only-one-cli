import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { formatUpdateHumanLines, updateAgentArtifacts } from '@/core/agent/update.js';
import { printJson } from '@/core/output/index.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';

export function createUpdateCommand(deps: ProgramDeps): Command {
    return new Command('update')
        .description('Refresh installed only-one structural agent skills and workflow templates for configured agent tools.')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .option('--force', 'Overwrite agent skill and workflow files even if local and remote versions match')
        .addHelpText(
            'after',
            '\nExamples:\n' +
                '  $ only-one update\n' +
                '  $ only-one update /path/to/project --force\n\n' +
                'Notes:\n' +
                '  - Looks up installed agent tools in the project configurations and pulls the latest definitions from the source registry.\n' +
                '  - Useful when updating CLI versions or retrieving upstream template improvements.',
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

            for (const line of formatUpdateHumanLines(result)) {
                deps.stdout(line);
            }
        });
}
