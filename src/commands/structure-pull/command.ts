import { Command } from 'commander';
import { relative } from 'node:path';
import type { ProgramDeps } from '@/cli/deps.js';
import { printJson, printProjectsWithStructure } from '@/core/output/index.js';
import { assertProjectDirectory, clientFor, globalsFor, resolveProjectDir } from '@/core/runtime/globals.js';
import { fetchRemoteStructure, saveStructureLocally } from '@/core/structure/remote.js';
import { selectBackendProject, selectStructuralProject } from '@/prompts/project-select.js';
import type { BackendProject } from '@/core/client/index.js';
import type { StructurePullCommandOptions, StructurePullCommandJson } from './types.js';

const STRUCTURE_PULL_DESCRIPTION =
    'Pull structural blueprint from backend.\n\n' +
    'Examples:\n' +
    '  only-one-cli structure-pull\n' +
    '  only-one-cli structure-pull --list\n' +
    '  only-one-cli structure-pull --project <uuid>\n' +
    '  only-one-cli structure-pull --output custom-blueprint.md\n';

export function createStructurePullCommand(deps: ProgramDeps): Command {
    return new Command('structure-pull')
        .description(STRUCTURE_PULL_DESCRIPTION)
        .option('--project <id>', 'Backend project ID')
        .option('--output <path>', 'Custom output path for the blueprint file')
        .option('--force', 'Overwrite existing local blueprint file without confirmation')
        .option('--list', 'List backend projects that have structural blueprints and select one to pull')
        .action(async (options: StructurePullCommandOptions, command) => {
            const globals = await globalsFor(command, deps);
            const client = clientFor(globals, deps);

            try {
                let project: BackendProject;
                let projectDir: string;

                if (options.list) {
                    const structures = await client.listProjectsWithStructure();
                    if (globals.json) {
                        printJson(structures, deps.stdout);
                        return;
                    }

                    if (!structures?.length) {
                        deps.stdout('No projects with structural blueprints found.');
                        return;
                    }

                    printProjectsWithStructure(structures, deps.stdout);
                    deps.stdout(''); // Spacing line

                    const resolvedDir = resolveProjectDir(deps);
                    assertProjectDirectory(resolvedDir);
                    projectDir = resolvedDir;

                    project = await selectStructuralProject(client, deps, structures);
                } else {
                    const resolvedDir = resolveProjectDir(deps);
                    assertProjectDirectory(resolvedDir);
                    projectDir = resolvedDir;

                    const projectId = options.project || globals.project;
                    if (projectId) {
                        project = await client.getProject(projectId);
                    } else {
                        project = await selectBackendProject(client, deps);
                    }
                }

                const content = await fetchRemoteStructure(client, project);

                const saveResult = await saveStructureLocally(content, projectDir, project, {
                    force: options.force,
                    output: options.output,
                    prompts: deps.prompts,
                });

                if (globals.json) {
                    const jsonPayload: StructurePullCommandJson = {
                        source: 'remote',
                        projectId: project.id,
                        projectName: project.name || `${project.organization}/${project.project}`,
                        bytesWritten: saveResult.bytesWritten,
                        blueprintPath: saveResult.filePath,
                    };
                    printJson(jsonPayload, deps.stdout);
                    return;
                }

                deps.stdout(`Successfully pulled structural blueprint for project "${project.name || project.project}":`);
                deps.stdout(`  Saved to: ${relative(deps.cwd, saveResult.filePath)}`);
                deps.stdout(`  Size:     ${saveResult.bytesWritten} bytes`);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                if (globals.json) {
                    printJson({ error: message }, deps.stdout);
                } else {
                    deps.stderr?.(message) ?? deps.stdout(message);
                }
                process.exitCode = 1;
            }
        });
}
