import React, { FC, useState } from 'react';
import { Box, Text } from 'ink';
import { SelectMenu } from '../components/SelectMenu.js';
import { TaskRunnerView } from '../components/TaskRunnerView.js';
import { SETTINGS_MENU_ITEMS } from '../constants/index.js';
import { syncVsSettings } from '@/core/vs/settings-sync.js';
import { syncVsExtensions } from '@/core/vs/extensions-sync.js';
import { getAllowedVsSettingsTargets } from '@/core/target-selection/index.js';
import type { ProgramDeps } from '@/cli/deps.js';
import type { MenuItem } from '../types/index.js';
import { homedir } from 'node:os';

interface SettingsViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const SettingsView: FC<SettingsViewProps> = ({ deps, onBack }) => {
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    const handleRunSettingsSync = async (log: (msg: string) => void) => {
        if (!selectedItem) return;

        const isExtensions = selectedItem.value.includes('extension') || selectedItem.value.includes('vscode');
        const editorIds = getAllowedVsSettingsTargets().map((t) => t.id as any);

        if (isExtensions) {
            log(`Syncing editor extensions for ${editorIds.join(', ')}...`);
            await syncVsExtensions({
                cwd: process.cwd(),
                editorIds,
                write: (line) => log(line),
                force: true,
            });
            log('Editor extensions sync complete.');
        } else {
            log(`Syncing editor settings for ${editorIds.join(', ')}...`);
            await syncVsSettings({
                cwd: process.cwd(),
                editorIds,
                homeDir: homedir(),
                platform: process.platform as any,
                write: (line) => log(line),
                force: true,
            });
            log('Editor settings sync complete.');
        }
    };

    if (selectedItem) {
        return (
            <Box flexDirection="column" paddingX={1}>
                <TaskRunnerView title={selectedItem.label} runTask={handleRunSettingsSync} onDone={onBack} />
            </Box>
        );
    }

    return (
        <Box flexDirection="column" paddingX={1}>
            <Box marginY={0}>
                <Text bold color="blue">
                    ⚙️ Editor Settings & Extensions Options:
                </Text>
            </Box>
            <SelectMenu items={SETTINGS_MENU_ITEMS} onSelect={(item) => setSelectedItem(item)} />
        </Box>
    );
};
