import type { ProgramDeps } from '@/cli/deps.js';
import { selectAllowedAgentTargets } from '@/core/target-selection/wrappers.js';
import { select } from '@inquirer/prompts';
import { readComboManifests } from '@/core/combo/index.js';
import { PACKAGES } from '@assets/packages/index.js';
import { readMcpManifests } from '@/core/mcp/registry.js';
import { SKILLS } from '@assets/skills/index.js';
import { PLUGINS } from '@assets/plugins/index.js';
import { RULES } from '@assets/rules/index.js';

export interface InitSelectionInputs {
    selectedTools: string[];
    mode: 'combo' | 'custom';
    comboId?: string;
    packages: string[];
    configs: string[];
    mcps: string[];
    skills: string[];
    pluginsPerAgent: Record<string, string[]>;
    rulesPerAgent: Record<string, string[]>;
}

export async function promptInitSelections(
    deps: ProgramDeps,
    options: {
        explicitTools?: string;
        explicitCombo?: string;
        explicitPackages?: string;
        explicitSkills?: string;
    },
): Promise<InitSelectionInputs> {
    // 1. Target Agent selection (once)
    const targetTools = await selectAllowedAgentTargets({
        automatic: !options.explicitTools && !deps.prompts?.checkbox,
        emptyMessage: 'Select at least one target tool/IDE',
        explicit: options.explicitTools,
        message: 'Select target IDEs/Tools for setup:',
        prompts: deps.prompts,
    });
    const selectedTools = targetTools.map((t) => t.value);

    // 2. Setup mode: Combo vs Custom
    let mode: 'combo' | 'custom' = 'custom';
    let comboId = options.explicitCombo;

    if (options.explicitCombo) {
        mode = 'combo';
    } else if (deps.prompts?.checkbox) {
        const selectPrompt = (deps.prompts as any).select ?? select;
        mode = await selectPrompt({
            message: 'Choose setup mode:',
            choices: [
                { name: 'Combo (Predefined setup package)', value: 'combo' },
                { name: 'Custom (Select components step-by-step)', value: 'custom' },
            ],
            default: 'custom',
        });
    }

    if (mode === 'combo' && !comboId && deps.prompts?.checkbox) {
        const availableCombos = await readComboManifests();
        const selectPrompt = (deps.prompts as any).select ?? select;
        comboId = await selectPrompt({
            message: 'Select a predefined combo to install:',
            choices: availableCombos.map((c) => ({
                name: c.description ? `${c.name} — ${c.description}` : c.name,
                value: c.id,
            })),
        });
    }

    if (mode === 'combo') {
        return {
            selectedTools,
            mode: 'combo',
            comboId,
            packages: [],
            configs: [],
            mcps: [],
            skills: [],
            pluginsPerAgent: {},
            rulesPerAgent: {},
        };
    }

    // 3. Custom category order: Package -> Config -> MCP -> Skill -> Plugin -> Rule
    let selectedPackages: string[] = options.explicitPackages ? options.explicitPackages.split(',').map((s) => s.trim()) : [];
    let selectedConfigs: string[] = [];
    let selectedMcps: string[] = [];
    let selectedSkills: string[] = options.explicitSkills ? options.explicitSkills.split(',').map((s) => s.trim()) : [];
    const pluginsPerAgent: Record<string, string[]> = {};
    const rulesPerAgent: Record<string, string[]> = {};

    if (deps.prompts?.checkbox) {
        if (!options.explicitPackages) {
            selectedPackages = await deps.prompts.checkbox({
                message: 'Select packages to install (optional, empty to skip):',
                choices: PACKAGES.map((p) => ({ name: `${p.id} — ${p.description}`, value: p.id })),
            });
        }

        selectedConfigs = await deps.prompts.checkbox({
            message: 'Select configuration templates to generate (optional, empty to skip):',
            choices: [{ name: 'openspec — OpenSpec project configuration', value: 'openspec', checked: true }],
        });

        const { manifests: mcpManifests } = await readMcpManifests();
        selectedMcps = await deps.prompts.checkbox({
            message: 'Select MCP servers to configure (optional, empty to skip):',
            choices: mcpManifests.map((m) => ({ name: m.id, value: m.id })),
        });

        if (!options.explicitSkills) {
            selectedSkills = await deps.prompts.checkbox({
                message: 'Select custom skills to add (optional, empty to skip):',
                choices: SKILLS.map((s) => ({ name: `${s.name} — ${s.description}`, value: s.name })),
            });
        }

        for (const toolId of selectedTools) {
            const compatiblePlugins = PLUGINS.filter((p) => p.supportedTargets.includes(toolId as any));
            if (compatiblePlugins.length > 0) {
                pluginsPerAgent[toolId] = await deps.prompts.checkbox({
                    message: `Select plugins for ${toolId} (optional, empty to skip):`,
                    choices: compatiblePlugins.map((p) => ({ name: `${p.id} — ${p.description}`, value: p.id, checked: true })),
                });
            }

            const compatibleRules = RULES.filter((r) => r.supportedTargets.includes(toolId as any));
            if (compatibleRules.length > 0) {
                rulesPerAgent[toolId] = await deps.prompts.checkbox({
                    message: `Select rules for ${toolId} (optional, empty to skip):`,
                    choices: compatibleRules.map((r) => ({ name: `${r.id} — ${r.description}`, value: r.id, checked: true })),
                });
            }
        }
    }

    return {
        selectedTools,
        mode: 'custom',
        packages: selectedPackages,
        configs: selectedConfigs,
        mcps: selectedMcps,
        skills: selectedSkills,
        pluginsPerAgent,
        rulesPerAgent,
    };
}
