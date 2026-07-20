import { Command } from 'commander';
import { basename, relative } from 'node:path';
import type { ProgramDeps } from '@/cli/deps.js';
import { buildAgentArtifactSummaries, formatAgentToolInstruction } from '@/core/agent/artifact-summary.js';
import { ensureStructureAgentSkills } from '@/core/agent/ensure-skills.js';
import { getAgentToolDisplayName } from '@/core/agent/prompt-setup.js';
import { loadConfig, persistConfigAgentTools } from '@/core/config/index.js';
import { printJson } from '@/core/output/index.js';
import { readCliVersion } from '@/core/runtime/read-cli-version.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';
import { STRUCTURALS_DIR, StructurePathResolutionError } from '@/core/structure/paths.js';
import { scaffoldStructureOutput } from '@/core/structure/scaffold.js';
import { readBlueprintStatus } from '@/core/structure/status.js';
import { getStructurePlaybookSteps, STRUCTURE_BLUEPRINT_NAMING_HINT, STRUCTURE_SKILL_NAME } from '@/core/templates/structure.js';
import type { AgentArtifactSummary, StructureGenerateCommandJson, StructureGenerateCommandOptions } from './types.js';
import { COLORS } from '@/constants/index.js';

export function createStructureGenerateCommand(deps: ProgramDeps): Command {
    return new Command('structure-generate')
        .description('🏗️  Scaffold structural blueprint markdown files')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory to scaffold (default: current directory)')
        .option(
            '--output <path>',
            `Override output blueprint file path (.md) or directory (default: .only-one/${STRUCTURALS_DIR}/{org}-{project}-structural.md)`,
        )
        .option('--no-install-skill', 'Skip checking and downloading structural skills; generate structure scaffolding only')
        .option(
            '--tools <tools>',
            'Install skills for specific agent tools (choices: all, none, or comma-separated editor ids like cursor,windsurf)',
        )
        .option('--force', 'Force overwrite of existing structural skills and workspace configurations')
        .option('--status', 'Report existence and path details of the current structural blueprint only')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one structure-generate')}\n` +
                `  ${COLORS.cli.command('$ only-one structure-generate --tools cursor,windsurf')}\n` +
                `  ${COLORS.cli.command('$ only-one structure-generate --output ./custom-blueprint.md')}\n` +
                `  ${COLORS.cli.command('$ only-one structure-generate --status')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('Unless --no-install-skill is set, this command will automatically download and set up structural agent skills.')}\n` +
                `  - ${COLORS.dim('If the organization name is not configured, a default "default" organization value is fallback.')}`,
        )
        .action(async (path: string | undefined, options: StructureGenerateCommandOptions, command) => {
            const projectDir = resolveProjectDir(deps, path);
            assertProjectDirectory(projectDir);

            const parent = command.parent?.opts() ?? {};
            const cliVersion = readCliVersion();

            if (!options.status && options.installSkill !== false) {
                const gate = await ensureStructureAgentSkills(deps, {
                    force: Boolean(options.force),
                    noInstallSkill: false,
                    projectDir,
                    toolsArg: options.tools,
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
                    COLORS.warning(
                        '  Note: organization not set in config; using "default" in blueprint filename. Run only-one init to set organization.',
                    ),
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
                deps.stdout(`${COLORS.primary('Blueprint:')} ${COLORS.cli.accent(scaffold.relativeBlueprintPath)}`);
                deps.stdout(`  ${COLORS.primary('Exists:')} ${blueprintStatus.exists ? COLORS.success('yes') : COLORS.error('no')}`);
                if (blueprintStatus.legacyExists && blueprintStatus.legacyPath) {
                    deps.stdout(
                        `  ${COLORS.warning('Legacy:')} ${COLORS.dim(relative(projectDir, blueprintStatus.legacyPath))} (migrate to structure/ layout)`,
                    );
                }
                if (blueprintStatus.missingSections.length) {
                    deps.stdout(`  ${COLORS.error('Missing sections:')} ${COLORS.warning(blueprintStatus.missingSections.join(', '))}`);
                }
                return;
            }

            const config = await loadConfig(projectDir);
            const agentTools = config.agent_tools ?? [];
            const agentArtifacts = buildAgentArtifactSummaries(projectDir, agentTools);

            const payload: StructureGenerateCommandJson = {
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
                steps: getStructurePlaybookSteps(),
            };

            if (parent.json) {
                printJson({ ...payload, skillName: STRUCTURE_SKILL_NAME }, deps.stdout);
                return;
            }

            const relProject = relative(deps.cwd, projectDir) || '.';

            const border = (text: string) => COLORS.dim(text);
            deps.stdout(border('┌────────────────────────────────────────────────────────────────────────┐'));
            deps.stdout(border('│  ') + COLORS.cli.header('STRUCTURAL BLUEPRINT GENERATION'.padEnd(70)) + border('│'));
            deps.stdout(border('├────────────────────────────────────────────────────────────────────────┤'));
            deps.stdout(border('│  ') + COLORS.primary('Project:   ') + COLORS.cli.accent(relProject.padEnd(59)) + border('│'));
            deps.stdout(
                border('│  ') + COLORS.primary('Folder:    ') + COLORS.cli.accent(scaffold.relativeOutputDir.padEnd(59)) + border('│'),
            );
            deps.stdout(
                border('│  ') + COLORS.primary('Blueprint: ') + COLORS.cli.accent(scaffold.relativeBlueprintPath.padEnd(59)) + border('│'),
            );
            deps.stdout(border('└────────────────────────────────────────────────────────────────────────┘'));
            deps.stdout('');
            deps.stdout(`  ${COLORS.bold('How to run this skill inside your AI agent chat:')}`);
            if (agentArtifacts.length) {
                for (const artifact of agentArtifacts) {
                    const toolName = getAgentToolDisplayName(artifact.toolId);
                    deps.stdout(`  ${COLORS.success('•')} ${COLORS.secondary(toolName)}:`);
                    for (const line of formatAgentToolInstruction(artifact.toolId, artifact.invokeLabel)) {
                        deps.stdout(COLORS.dim(line));
                    }
                    deps.stdout('');
                }
            } else {
                deps.stdout(`  ${COLORS.warning('•')} ${COLORS.warning('Tell your agent:')}`);
                deps.stdout(`    ${COLORS.dim('"Generate the structural blueprint for this codebase"')}`);
                deps.stdout('');
            }

            if (options.installSkill === false) {
                deps.stdout(`  ${COLORS.warning('Agent skills: skipped (--no-install-skill)')}`);
                deps.stdout('');
            }

            deps.stdout(`  ${COLORS.bold('Next Steps:')}`);
            deps.stdout(`  1. ${COLORS.dim('Open your AI agent/IDE chat window.')}`);
            deps.stdout(`  2. ${COLORS.dim('Type the slash command, tag the file, or run the command shown above.')}`);
            deps.stdout(`  3. ${COLORS.dim('Upload the generated index to the backend server:')}`);
            deps.stdout(`     ${COLORS.cli.command('only-one push-index --skip-gitnexus --skip-cocoindex')}`);
            deps.stdout(COLORS.dim('──────────────────────────────────────────────────────────────────────────'));
        });
}
