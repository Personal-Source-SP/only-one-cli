import React, { FC } from 'react';
import { Box, Text } from 'ink';
import type { RouteItem } from '../router/types.js';

interface PreviewCardProps {
    item: RouteItem;
}

export const PreviewCard: FC<PreviewCardProps> = ({ item }) => {
    return (
        <Box flexDirection="column" paddingX={1} paddingY={1}>
            <Box marginBottom={1}>
                <Text bold color="cyan">
                    {item.icon} {item.label.toUpperCase()}
                </Text>
            </Box>

            <Box marginBottom={1}>
                <Text color="white">{item.description}</Text>
            </Box>

            {item.quickSummary && item.quickSummary.length > 0 && (
                <Box flexDirection="column" marginBottom={1}>
                    <Text bold color="yellow">
                        📋 Highlights & Capabilities:
                    </Text>
                    {item.quickSummary.map((summary, idx) => (
                        <Box key={idx} marginLeft={1}>
                            <Text color="gray">• </Text>
                            <Text color="white">{summary}</Text>
                        </Box>
                    ))}
                </Box>
            )}

            {item.tags && item.tags.length > 0 && (
                <Box marginBottom={1}>
                    <Text color="gray">Tags: </Text>
                    {item.tags.map((tag, idx) => (
                        <Text key={idx} color="blue">
                            #{tag}{' '}
                        </Text>
                    ))}
                </Box>
            )}

            <Box
                marginTop={1}
                paddingTop={1}
                borderStyle="single"
                borderTop
                borderBottom={false}
                borderLeft={false}
                borderRight={false}
                borderColor="gray"
            >
                <Text color="green">
                    Press{' '}
                    <Text bold color="yellow">
                        [Enter]
                    </Text>{' '}
                    to launch this action
                </Text>
            </Box>
        </Box>
    );
};
