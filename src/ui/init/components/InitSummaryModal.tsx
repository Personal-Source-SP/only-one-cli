import React, { FC } from 'react';
import { Box, Text } from 'ink';
import type { ResourceItem } from '../types.js';

type InitSummaryModalProps = {
    resources: ResourceItem[];
    selectedTools: string[];
    overwrite: boolean;
};

export const InitSummaryModal: FC<InitSummaryModalProps> = ({ resources, selectedTools, overwrite }) => {
    const toInstall = resources.filter((r) => !r.isInstalled && r.selected).length;
    const toPrune = resources.filter((r) => r.isInstalled && !r.selected).length;
    const toKeep = resources.filter((r) => r.isInstalled && r.selected).length;

    return (
        <Box flexDirection="column" borderStyle="double" borderColor="yellow" paddingX={2} paddingY={1} marginTop={1}>
            <Text bold color="yellow">
                ⚠️ CONFIRM INITIALIZATION PLAN
            </Text>
            <Box flexDirection="column" marginY={1}>
                <Text>• Target IDEs: {selectedTools.join(', ') || 'None'}</Text>
                <Text>• Overwrite Policy: {overwrite ? 'YES (Overwrite existing)' : 'NO (Preserve existing)'}</Text>
                <Text color="green">• Keep/Preserve: {toKeep} items</Text>
                <Text color="cyan">• New to install: {toInstall} items</Text>
                <Text color="red">• Marked for pruning: {toPrune} items</Text>
            </Box>
            <Text bold color="white">
                Press [y] or [Enter] to execute, [n] or [Esc] to cancel and go back.
            </Text>
        </Box>
    );
};
