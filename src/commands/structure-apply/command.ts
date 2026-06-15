import { Command } from 'commander';
import { basename, relative } from 'node:path';
import type { ProgramDeps } from '../../cli/deps.js';
import { buildAgentArtifactSummaries, formatAgentToolInstruction } from '../../core/agent/artifact-summary.js';
import { ensureStructureAgentSkills } from '../../core/agent/ensure-skills.js';
import { getAgentToolDisplayName } from '../../core/agent/prompt-setup.js';
import { loadConfig, persistConfigAgentTools } from '../../core/config/index.js';
import { printJson } from '../../core/output/index.js';
import { readCliVersion } from '../../core/runtime/read-cli-version.js';
import { assertProjectDirectory, resolveProjectDir } from '../../core/runtime/globals.js';
import { STRUCTURALS_DIR, StructurePathResolutionError } from '../../core/structure/paths.js';
import { scaffoldStructureOutput } from '../../core/structure/scaffold.js';
import { readBlueprintStatus } from '../../core/structure/status.js';
import {
    getStructureApplyPlaybookSteps,
    STRUCTURE_APPLY_BLUEPRINT_NAMING_HINT,
    STRUCTURE_APPLY_SKILL_NAME,
    STRUCTURE_APPLY_COMMAND_ID,
} from '../../core/templates/structure-apply.js';
import type { AgentArtifactSummary, StructureApplyCommandJson, StructureApplyCommandOptions } from './types.js';

import { confirm as confirmPrompt } from '@inquirer/prompts';
import { clientFor, globalsFor } from '../../core/runtime/globals.js';
import { fetchRemoteStructure, saveStructureLocally } from '../../core/structure/remote.js';
import { selectBackendProject } from '../../prompts/project-select.js';
import type { BackendProject } from '../../core/client/index.js';

const STRUCTURE_APPLY_DESCRIPTION =
    'Confirm structural blueprint and print the hybrid-index-structure-apply agent playbook.\n\n' +
    'Installs agent skills when missing. Use --no-install-skill to bypass check.\n\n' +
    'Examples:\n' +
    '  hybrid-index structure-apply\n' +
    '  hybrid-index structure-apply --json\n' +
    '  hybrid-index structure-apply --tools cursor,windsurf\n' +
    '  hybrid-index structure-apply --no-install-skill\n';

export function createStructureApplyCommand(deps: ProgramDeps): Command {
    return new Command('structure-apply')
        .description(STRUCTURE_APPLY_DESCRIPTION)
        .argument('[path]', 'Project directory (default: current directory)')
        .option(
            '--output <path>',
            `Blueprint file (.md) or index output directory (default: .only-one/${STRUCTURALS_DIR}/{org}-{project}-structural.md)`,
        )
        .option('--no-install-skill', 'Skip skill check and install')
        .option('--tools <tools>', 'Install skills: all (30 agents), none, or comma-separated ids')
        .option('--force', 'Overwrite existing structural skill/command files when installing')
        .option('--status', 'Report blueprint file status only')
        .option('--remote', 'Use structural blueprint from backend')
        .option('--project <id>', 'Backend project ID (with --remote)')
        .option('--yes', 'Skip confirmation prompt (with --remote)')
        .action(async (path: string | undefined, options: StructureApplyCommandOptions, command) => {
            const projectDir = resolveProjectDir(deps, path);
            assertProjectDirectory(projectDir);

            const parent = command.parent?.opts() ?? {};
            const cliVersion = readCliVersion();

            let pulledFrom: string | undefined;
            if (options.remote) {
                const globals = await globalsFor(command, deps);
                const client = clientFor(globals, deps);

                try {
                    const projectId = options.project || globals.project;
                    let project: BackendProject;
                    if (projectId) {
                        project = await client.getProject(projectId);
                    } else {
                        project = await selectBackendProject(client, deps);
                    }

                    pulledFrom = project.id;
                    const content = await fetchRemoteStructure(client, project);

                    if (!options.yes) {
                        const lines = content.split('\n');
                        const previewLines = lines.slice(0, 40).join('\n');
                        const headings = lines.filter((line) => /^#+\s/.test(line));

                        deps.stdout('--- PREVIEW OF REMOTE BLUEPRINT ---');
                        deps.stdout(previewLines);
                        if (lines.length > 40) {
                            deps.stdout(`\n... [Truncated ${lines.length - 40} lines] ...\n`);
                        }
                        deps.stdout('--- SECTION HEADINGS FOUND ---');
                        for (const heading of headings) {
                            deps.stdout(`  ${heading}`);
                        }
                        deps.stdout('------------------------------\n');

                        const confirm = deps.prompts?.confirm ?? confirmPrompt;
                        const proceed = await confirm({
                            message: 'Apply this blueprint?',
                            default: true,
                        });
                        if (!proceed) {
                            deps.stdout('Aborted');
                            return;
                        }
                    }

                    const saveResult = await saveStructureLocally(content, projectDir, project, {
                        force: true,
                        output: options.output,
                    });

                    options.output = relative(projectDir, saveResult.filePath);
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    if (parent.json) {
                        printJson({ error: message }, deps.stdout);
                    } else {
                        deps.stderr?.(message) ?? deps.stdout(message);
                    }
                    process.exitCode = 1;
                    return;
                }
            }

            if (!options.status && options.installSkill !== false) {
                const gate = await ensureStructureAgentSkills(deps, {
                    force: Boolean(options.force),
                    noInstallSkill: false,
                    projectDir,
                    toolsArg: options.tools,
                    skillName: STRUCTURE_APPLY_SKILL_NAME,
                    commandId: STRUCTURE_APPLY_COMMAND_ID,
                });

                if (!gate.ok) {
                    deps.stderr?.(gate.message) ?? deps.stdout(gate.message);
                    process.exitCode = gate.exitCode;
                    return;
                }

                if (gate.setupRan && gate.agentTools.length) {
                    await persistConfigAgentTools(projectDir, gate.agentTools);
                }
            }

            let scaffold;
            try {
                scaffold = await scaffoldStructureOutput(projectDir, options.output);
            } catch (error) {
                if (error instanceof StructurePathResolutionError) {
                    deps.stderr?.(error.message) ?? deps.stdout(error.message);
                    process.exitCode = 1;
                    return;
                }
                throw error;
            }

            if (scaffold.usesDefaultOrganization) {
                deps.stdout(
                    '  Note: organization not set in config; using "default" in blueprint filename. Run only-one-cli init to set organization.',
                );
            }

            const blueprintStatus = readBlueprintStatus(scaffold.blueprintPath, {
                output: options.output,
                projectDir,
            });

            if (options.status) {
                const payload = {
                    blueprint: blueprintStatus,
                    outputPath: scaffold.blueprintPath,
                    projectDir,
                    relativeBlueprintPath: scaffold.relativeBlueprintPath,
                };
                if (parent.json) {
                    printJson(payload, deps.stdout);
                    return;
                }
                deps.stdout(`Blueprint: ${scaffold.relativeBlueprintPath}`);
                deps.stdout(`  Exists: ${blueprintStatus.exists ? 'yes' : 'no'}`);
                if (blueprintStatus.legacyExists && blueprintStatus.legacyPath) {
                    deps.stdout(`  Legacy: ${relative(projectDir, blueprintStatus.legacyPath)} (migrate to structure/ layout)`);
                }
                if (blueprintStatus.missingSections.length) {
                    deps.stdout(`  Missing sections: ${blueprintStatus.missingSections.join(', ')}`);
                }
                return;
            }

            const config = await loadConfig(projectDir);
            const agentTools = config.agent_tools ?? [];
            const agentArtifacts = buildAgentArtifactSummaries(
                projectDir,
                agentTools,
                STRUCTURE_APPLY_SKILL_NAME,
                STRUCTURE_APPLY_COMMAND_ID,
            );

            const payload: StructureApplyCommandJson = {
                agentArtifacts,
                blueprint: blueprintStatus,
                blueprintFile: basename(scaffold.blueprintPath),
                cliVersion,
                folderCreated: scaffold.created,
                outputDir: scaffold.outputDir,
                outputPath: scaffold.blueprintPath,
                projectDir,
                relativeBlueprintPath: scaffold.relativeBlueprintPath,
                relativeOutputDir: scaffold.relativeOutputDir,
                steps: getStructureApplyPlaybookSteps(),
                ...(options.remote ? { source: 'remote', pulledFrom } : {}),
            };

            if (parent.json) {
                printJson({ ...payload, skillName: STRUCTURE_APPLY_SKILL_NAME }, deps.stdout);
                return;
            }

            const relProject = relative(deps.cwd, projectDir) || '.';

            deps.stdout('┌────────────────────────────────────────────────────────────────────────┐');
            deps.stdout('│  STRUCTURAL SKELETON INITIALIZATION (APPLY)                            │');
            deps.stdout('├────────────────────────────────────────────────────────────────────────┤');
            deps.stdout(`│  Project:   ${relProject.padEnd(59)}│`);
            deps.stdout(`│  Blueprint: ${scaffold.relativeBlueprintPath.padEnd(59)}│`);
            deps.stdout('└────────────────────────────────────────────────────────────────────────┘');
            deps.stdout('');
            deps.stdout('  How to run this skill inside your AI agent chat:');
            if (agentArtifacts.length) {
                for (const artifact of agentArtifacts) {
                    const toolName = getAgentToolDisplayName(artifact.toolId);
                    deps.stdout(`  • ${toolName}:`);
                    for (const line of formatAgentToolInstruction(artifact.toolId, artifact.invokeLabel)) {
                        deps.stdout(line);
                    }
                    deps.stdout('');
                }
            } else {
                deps.stdout('  • Tell your agent:');
                deps.stdout('    "Initialize a new source structure from the blueprint file"');
                deps.stdout('');
            }

            if (options.installSkill === false) {
                deps.stdout('  Agent skills: skipped (--no-install-skill)');
                deps.stdout('');
            }

            deps.stdout('  Next Steps:');
            deps.stdout('  1. Open your AI agent/IDE chat window in the target project directory.');
            deps.stdout('  2. Type the slash command or prompt shown above to initialize the skeleton.');
            deps.stdout('  3. The agent will read the blueprint and scaffold the structure automatically.');
            deps.stdout('──────────────────────────────────────────────────────────────────────────');
        });
}
