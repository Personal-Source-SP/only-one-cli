import React, { FC, useState } from 'react';
import { Box, Text } from 'ink';
import { SelectMenu } from '../components/SelectMenu.js';
import { TaskRunnerView } from '../components/TaskRunnerView.js';
import { COMBOS } from '@assets/combos/index.js';
import { installCombo } from '@/core/combo/index.js';
import { getAllowedVsSettingsTargets } from '@/core/target-selection/index.js';
import type { ProgramDeps } from '@/cli/deps.js';
import type { MenuItem } from '../types/index.js';
import { homedir } from 'node:os';

interface ComboViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const ComboView: FC<ComboViewProps> = ({ deps, onBack }) => {
    const [selectedComboId, setSelectedComboId] = useState<string | null>(null);

    const comboMenuItems: MenuItem[] = COMBOS.map((c) => ({
        label: c.name,
        value: c.id,
        icon: '✨',
        description: c.description,
    }));

    const selectedCombo = COMBOS.find((c) => c.id === selectedComboId);

    const handleRunCombo = async (log: (msg: string) => void) => {
        if (!selectedCombo) return;

        log(`Applying combo "${selectedCombo.name}"...`);
        const targetTools = getAllowedVsSettingsTargets().map((t) => ({
            value: t.id,
            name: t.vs?.name || t.id,
            description: '',
            ruleExt: 'md' as const,
        }));

        if (deps) {
            const results = await installCombo({
                deps: {
                    ...deps,
                    stdout: (msg) => log(msg),
                },
                projectDir: process.cwd(),
                homeDir: homedir(),
                platform: process.platform,
                selectedTools: targetTools,
                combo: selectedCombo,
                overwriteList: [],
                noIgnore: false,
            });
            log(`Applied ${results.rules.length} rules, ${results.skills?.length ?? 0} skills.`);
        } else {
            log(`Combo ${selectedCombo.name} loaded.`);
        }
    };

    if (selectedComboId && selectedCombo) {
        return (
            <Box flexDirection="column" paddingX={1}>
                <TaskRunnerView title={`Apply Combo: ${selectedCombo.name}`} runTask={handleRunCombo} onDone={onBack} />
            </Box>
        );
    }

    return (
        <Box flexDirection="column" paddingX={1}>
            <Box marginY={0}>
                <Text bold color="cyan">
                    ✨ Select Predefined Combo:
                </Text>
            </Box>
            <SelectMenu items={comboMenuItems} onSelect={(item) => setSelectedComboId(item.value)} />
        </Box>
    );
};
