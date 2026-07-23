import { basename, relative } from 'node:path';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { buildAgentArtifactSummaries, formatAgentToolInstruction } from '@/core/agent/artifact-summary.js';
import { getAgentToolDisplayName } from '@/core/agent/prompt-setup.js';
import { loadConfig } from '@/core/config/index.js';
import { printJson } from '@/core/output/index.js';
import { readCliVersion } from '@/core/runtime/read-cli-version.js';
import type { readBlueprintStatus } from '@/core/structure/status.js';
import { getStructurePlaybookSteps, STRUCTURE_SKILL_NAME } from '@/core/templates/structure.js';
import type { StructureGenerateCommandJson, StructureGenerateCommandOptions } from '../types.js';

export const generatePayloadAndReportStep = async (
    deps: ProgramDeps,
    projectDir: string,
    scaffold: {
        blueprintPath: string;
        relativeBlueprintPath: string;
        created: boolean;
        outputDir: string;
        relativeOutputDir: string;
    },
    blueprintStatus: ReturnType<typeof readBlueprintStatus>,
    options: StructureGenerateCommandOptions,
    isJsonOutput: boolean,
): Promise<void> => {
    const cliVersion = readCliVersion();
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

    if (isJsonOutput) {
        printJson({ ...payload, skillName: STRUCTURE_SKILL_NAME }, deps.stdout);
        return;
    }

    const relProject = relative(deps.cwd, projectDir) || '.';

    const border = (text: string) => COLORS.dim(text);
    deps.stdout(border('┌────────────────────────────────────────────────────────────────────────┐'));
    deps.stdout(border('│  ') + COLORS.cli.header('STRUCTURAL BLUEPRINT GENERATION'.padEnd(70)) + border('│'));
    deps.stdout(border('├────────────────────────────────────────────────────────────────────────┤'));
    deps.stdout(border('│  ') + COLORS.primary('Project:   ') + COLORS.cli.accent(relProject.padEnd(59)) + border('│'));
    deps.stdout(border('│  ') + COLORS.primary('Folder:    ') + COLORS.cli.accent(scaffold.relativeOutputDir.padEnd(59)) + border('│'));
    deps.stdout(border('│  ') + COLORS.primary('Blueprint: ') + COLORS.cli.accent(scaffold.relativeBlueprintPath.padEnd(59)) + border('│'));
    deps.stdout(border('└────────────────────────────────────────────────────────────────────────┘'));
    deps.stdout('');
    deps.stdout(`  ${COLORS.bold('How to run this skill inside your AI agent chat:')}`);
    if (agentArtifacts?.length) {
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
};
