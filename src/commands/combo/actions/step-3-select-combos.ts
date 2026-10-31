import { homedir } from 'node:os';

import type { ProgramDeps } from '@/cli/deps.js';
import type { AgentToolOption } from '@/core/agent/tools.js';
import {
    checkExistingComboComponents,
    type ExtendedComboManifest,
    isComboAgentMatch,
    isComboScopeMatch,
    summarizeComboInstallation,
} from '@/core/combo/index.js';
import { parseCsv } from '@/utils/index.js';

export const formatComboChoice = (combo: ExtendedComboManifest): string => {
    const scopeTag = combo.scope === 'global' ? '[Global]' : combo.scope === 'project' ? '[Project]' : '[Global/Project]';
    const agentsTag =
        !combo.supportedAgents || combo.supportedAgents.includes('*') ? '[All Agents]' : `[Agents: ${combo.supportedAgents.join(', ')}]`;

    return [`${combo.id} — ${combo.name} ${scopeTag} ${agentsTag}`, `  ${combo.description || ''}`].join('\n');
};

export const selectCombosStep = async (
    deps: ProgramDeps,
    projectDir: string,
    namesArg: string | undefined,
    availableCombos: ExtendedComboManifest[],
    targetTool: AgentToolOption,
    targetTools: AgentToolOption[],
    isGlobal = false,
): Promise<string[]> => {
    const selectedComboNames = parseCsv(namesArg);

    if (selectedComboNames?.length) {
        return selectedComboNames;
    }

    const compatibleCombos = availableCombos.filter((combo) => isComboScopeMatch(combo, isGlobal) && isComboAgentMatch(combo, targetTools));

    if (!compatibleCombos.length) {
        deps.stdout(`No compatible combos found for ${targetTool.name} in ${isGlobal ? 'global' : 'local project'} mode.`);

        if (!isGlobal) {
            deps.stdout('Tip: Predefined combos are scoped for global installation. Try running with -g / --global.');
        }

        return [];
    }

    const comboChecks = await Promise.all(
        compatibleCombos.map(async (combo) => {
            const checks = await checkExistingComboComponents({
                projectDir,
                homeDir: homedir(),
                platform: process.platform,
                selectedTools: targetTools,
                combo,
                isGlobal,
            });

            return { combo, checks, installationStatus: summarizeComboInstallation(checks) };
        }),
    );

    let chosenNames: string[] = [];

    if (!deps.prompts?.checkbox) {
        throw new Error('Combo selection is required in non-interactive mode. Pass combo names positionally.');
    } else {
        const choices = comboChecks.map(({ combo, installationStatus }) => ({
            name: formatComboChoice(combo),
            value: combo.id,
            checked: installationStatus !== 'installed',
            installationStatus,
        }));
        choices.sort((a, b) => Number(a.installationStatus === 'installed') - Number(b.installationStatus === 'installed'));

        chosenNames = await deps.prompts.checkbox({
            message: `Select combos to install for ${targetTool.name}:`,
            choices: choices.map(({ installationStatus: _installationStatus, ...choice }) => choice),
        });
    }

    return chosenNames;
};
