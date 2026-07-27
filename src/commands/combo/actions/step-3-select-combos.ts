import { homedir } from 'node:os';
import type { ProgramDeps } from '@/cli/deps.js';
import type { AgentToolOption } from '@/core/agent/tools.js';
import {
    buildComboDependencyPlan,
    checkExistingComboComponents,
    summarizeComboInstallation,
    type ComboComponentStatus,
    type ExistingComboComponent,
    type ExtendedComboManifest,
} from '@/core/combo/index.js';
import { parseCsv } from '@/utils/index.js';

const statusFor = (checks: ExistingComboComponent[], type: ExistingComboComponent['type'], name: string): ComboComponentStatus => {
    const matches = checks.filter((check) => check.type === type && check.name === name);
    if (matches.length === 0) return 'not-applicable';
    if (matches.every((check) => check.status === 'installed')) return 'installed';
    if (matches.every((check) => check.status === 'missing')) return 'missing';
    if (matches.every((check) => check.status === 'not-applicable')) return 'not-applicable';
    return 'partial';
};

const detailLine = (label: string, type: ExistingComboComponent['type'], names: string[], checks: ExistingComboComponent[]): string =>
    `  ${label}: ${names.length > 0 ? names.map((name) => `${name} [${statusFor(checks, type, name)}]`).join(', ') : '(none)'}`;

const formatComboChoice = (combo: ExtendedComboManifest, checks: ExistingComboComponent[]): string => {
    const plan = buildComboDependencyPlan(combo);
    return [
        `${combo.id} — ${combo.name}`,
        `  ${combo.description || ''}`,
        detailLine('Packages', 'package', plan.packages, checks),
        detailLine('Plugins', 'plugin', plan.plugins, checks),
        detailLine('Rules', 'rule', plan.rules, checks),
        detailLine('Skills', 'skill', plan.skills, checks),
        detailLine('Configs', 'config', plan.configs, checks),
        detailLine('Workflows', 'workflow', plan.workflows, checks),
        detailLine('MCPs', 'mcp', plan.mcps, checks),
    ].join('\n');
};

export const selectCombosStep = async (
    deps: ProgramDeps,
    projectDir: string,
    namesArg: string | undefined,
    availableCombos: ExtendedComboManifest[],
    targetTool: AgentToolOption,
    targetTools: AgentToolOption[],
): Promise<string[]> => {
    const comboChecks = await Promise.all(
        availableCombos.map(async (combo) => {
            const checks = await checkExistingComboComponents({
                projectDir,
                homeDir: homedir(),
                platform: process.platform,
                selectedTools: targetTools,
                combo,
            });
            return { combo, checks, installationStatus: summarizeComboInstallation(checks) };
        }),
    );

    let selectedComboNames = parseCsv(namesArg);
    if (!selectedComboNames?.length) {
        if (!deps.prompts?.checkbox) {
            throw new Error('Combo selection is required in non-interactive mode. Pass combo names positionally.');
        } else {
            const choices = comboChecks.map(({ combo, checks, installationStatus }) => ({
                name: formatComboChoice(combo, checks),
                value: combo.id,
                checked: installationStatus !== 'installed',
                installationStatus,
            }));
            choices.sort((a, b) => Number(a.installationStatus === 'installed') - Number(b.installationStatus === 'installed'));

            selectedComboNames = await deps.prompts.checkbox({
                message: `Select combos to install for ${targetTool.name}:`,
                choices: choices.map(({ installationStatus: _installationStatus, ...choice }) => choice),
            });
        }
    }

    return selectedComboNames;
};
