import React from 'react';
import { Box, Text } from 'ink';
import { VERSION } from '@/constants/index.js';

export const Header: React.FC = () => {
    return (
        <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1} marginBottom={1}>
            <Text bold color="cyan">
                🚀 ONLY-ONE CLI <Text color="gray">v{VERSION}</Text>
            </Text>
            <Text color="dim">Developer environment setups, agent workspace management & editor syncing</Text>
        </Box>
    );
};
