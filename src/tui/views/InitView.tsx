import React, { FC, useState } from 'react';
import { Box, Text } from 'ink';
import { SelectMenu } from '../components/SelectMenu.js';
import { TaskRunnerView } from '../components/TaskRunnerView.js';
import { INIT_MENU_ITEMS } from '../constants/index.js';
import { buildInitPlan } from '@/core/init/plan-builder.js';
import { executeInitPlan } from '@/core/init/plan-executor.js';
import { getAllowedAgentTargets } from '@/core/target-selection/index.js';
import type { MenuItem } from '../types/index.js';
import type { ProgramDeps } from '@/cli/deps.js';

interface InitViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const InitView: FC<InitViewProps> = ({ deps, onBack }) => {
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    const handleRunInit = async (log: (msg: string) => void) => {
        if (!selectedItem) return;

        log(`Building initialization plan for ${selectedItem.label}...`);
        const agentTargets = getAllowedAgentTargets();
        const selectedTools = agentTargets.map((t) => t.id);

        const selections = {
            selectedTools,
            mode: 'custom' as const,
            packages: [],
            configs: selectedItem.value === 'full' || selectedItem.value === 'rules' ? ['cursorrules'] : [],
            mcps: [],
            skills: selectedItem.value === 'full' || selectedItem.value === 'workflows' ? ['c4-diagrams'] : [],
            rulesPerAgent: {},
        };

        const plan = await buildInitPlan({
            projectDir: process.cwd(),
            selections,
        });

        log(`Executing plan with ${plan.items.length} items...`);
        const runDeps: ProgramDeps = deps ?? {
            stdout: (msg: string) => log(msg),
            stderr: (msg: string) => log(`[stderr] ${msg}`),
            cwd: process.cwd(),
            env: process.env,
            fetcher: globalThis.fetch,
        };

        await executeInitPlan({
            deps: {
                ...runDeps,
                stdout: (msg) => log(msg),
            },
            plan,
            noIgnore: false,
        });

        log('Workspace initialization complete.');
    };

    if (selectedItem) {
        return (
            <Box flexDirection="column" paddingX={1}>
                <TaskRunnerView title={`Workspace Initialization: ${selectedItem.label}`} runTask={handleRunInit} onDone={onBack} />
            </Box>
        );
    }

    return (
        <Box flexDirection="column" paddingX={1}>
            <Box marginY={0}>
                <Text bold color="yellow">
                    🚀 Workspace Initializer Options:
                </Text>
            </Box>
            <SelectMenu items={INIT_MENU_ITEMS} onSelect={(item) => setSelectedItem(item)} />
        </Box>
    );
};
