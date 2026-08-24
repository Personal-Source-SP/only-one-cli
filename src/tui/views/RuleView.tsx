import React, { FC, useState } from 'react';
import { Box, Text } from 'ink';
import { SelectMenu } from '../components/SelectMenu.js';
import { TaskRunnerView } from '../components/TaskRunnerView.js';
import { RULES } from '@assets/rules/index.js';
import { installRules } from '@/core/rule/index.js';
import { getAllowedAgentTargets } from '@/core/target-selection/index.js';
import type { ProgramDeps } from '@/cli/deps.js';
import type { MenuItem } from '../types/index.js';

interface RuleViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const RuleView: FC<RuleViewProps> = ({ deps, onBack }) => {
    const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

    const ruleMenuItems: MenuItem[] = [
        {
            label: 'Sync All Agent Rules',
            value: 'all',
            icon: '📝',
            description: `Sync all ${RULES.length} official agent rules`,
        },
        ...RULES.map((r) => ({
            label: r.id,
            value: r.id,
            icon: '📝',
            description: r.description || `Sync ${r.id} rule`,
        })),
    ];

    const handleRunRuleSync = async (log: (msg: string) => void) => {
        log(`Preparing rule sync...`);
        const ruleIds = selectedRuleId === 'all' ? RULES.map((r) => r.id) : [selectedRuleId!];

        const selectedTargets = getAllowedAgentTargets();
        const runDeps: ProgramDeps = deps ?? {
            stdout: (msg: string) => log(msg),
            stderr: (msg: string) => log(`[stderr] ${msg}`),
            cwd: process.cwd(),
            env: process.env,
            fetcher: globalThis.fetch,
        };

        const { results } = await installRules({
            deps: {
                ...runDeps,
                stdout: (msg) => log(msg),
            },
            projectDir: process.cwd(),
            selectedTargets,
            ruleIds,
            overwriteList: ruleIds,
            ruleManifests: RULES,
        });

        log(`Sync completed: ${results.filter((r) => r.status === 'success').length} installed.`);
    };

    if (selectedRuleId) {
        const title = selectedRuleId === 'all' ? 'All Agent Rules' : selectedRuleId;
        return (
            <Box flexDirection="column" paddingX={1}>
                <TaskRunnerView title={`Sync Rule: ${title}`} runTask={handleRunRuleSync} onDone={onBack} />
            </Box>
        );
    }

    return (
        <Box flexDirection="column" paddingX={1}>
            <Box marginY={0}>
                <Text bold color="cyan">
                    📝 Select Agent Rule to Sync:
                </Text>
            </Box>
            <SelectMenu items={ruleMenuItems} onSelect={(item) => setSelectedRuleId(item.value)} />
        </Box>
    );
};
