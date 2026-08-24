import React, { FC, useState } from 'react';
import { Box, Text } from 'ink';
import { SelectMenu } from '../components/SelectMenu.js';
import { TaskRunnerView } from '../components/TaskRunnerView.js';
import { updateArtifactsStep } from '@/commands/update/actions/step-2-update-artifacts.js';
import type { ProgramDeps } from '@/cli/deps.js';
import type { MenuItem } from '../types/index.js';

interface UpdateViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const UpdateView: FC<UpdateViewProps> = ({ deps, onBack }) => {
    const [selectedAction, setSelectedAction] = useState<string | null>(null);

    const updateItems: MenuItem[] = [
        {
            label: 'Refresh Skills & Templates',
            value: 'refresh-all',
            icon: '🔄',
            description: 'Refresh installed agent skills, rules, and workspace templates',
        },
    ];

    const handleRunUpdate = async (log: (msg: string) => void) => {
        log('Checking and refreshing workspace artifacts...');
        const runDeps: ProgramDeps = deps ?? {
            stdout: (msg: string) => log(msg),
            stderr: (msg: string) => log(`[stderr] ${msg}`),
            cwd: process.cwd(),
            env: process.env,
            fetcher: globalThis.fetch,
        };

        await updateArtifactsStep(
            {
                ...runDeps,
                stdout: (msg) => log(msg),
            },
            process.cwd(),
            { force: true },
            false,
        );
        log('Workspace artifacts refreshed successfully.');
    };

    if (selectedAction) {
        return (
            <Box flexDirection="column" paddingX={1}>
                <TaskRunnerView title="Refresh Skills & Templates" runTask={handleRunUpdate} onDone={onBack} />
            </Box>
        );
    }

    return (
        <Box flexDirection="column" paddingX={1}>
            <Box marginY={0}>
                <Text bold color="green">
                    🔄 Refresh Skills & Templates:
                </Text>
            </Box>
            <SelectMenu items={updateItems} onSelect={(item) => setSelectedAction(item.value)} />
        </Box>
    );
};
