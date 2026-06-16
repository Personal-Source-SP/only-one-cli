import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { formatUpdateHumanLines, updateAgentArtifacts } from '@/core/agent/update.js';
import { printJson } from '@/core/output/index.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';

export function createUpdateCommand(deps: ProgramDeps): Command {
    return new Command('update')
        .description('Refresh installed only-one-cli structural agent skills for configured agent_tools')
        .option('--force', 'Overwrite agent workflow files even when versions match')
        .argument('[path]', 'Project directory (default: current directory)')
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
