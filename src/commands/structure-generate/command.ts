import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';
import { STRUCTURALS_DIR } from '@/core/structure/paths.js';
import type { StructureGenerateCommandOptions } from './types.js';
import {
    ensureStructureSkillsStep,
    generatePayloadAndReportStep,
    reportStructureStatusStep,
    scaffoldBlueprintStep,
} from './actions/index.js';

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
            const isJsonOutput = Boolean(parent.json);

            const skillsResult = await ensureStructureSkillsStep(deps, projectDir, options);
            if (!skillsResult.ok) {
                return;
            }

            const scaffoldResult = await scaffoldBlueprintStep(deps, projectDir, options);
            if (!scaffoldResult.ok || !scaffoldResult.scaffold || !scaffoldResult.blueprintStatus) {
                return;
            }

            if (options.status) {
                reportStructureStatusStep(deps, projectDir, scaffoldResult.scaffold, scaffoldResult.blueprintStatus, isJsonOutput);
                return;
            }

            await generatePayloadAndReportStep(
                deps,
                projectDir,
                scaffoldResult.scaffold,
                scaffoldResult.blueprintStatus,
                options,
                isJsonOutput,
            );
        });
}
