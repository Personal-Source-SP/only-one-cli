import React from 'react';
import { Box, Text } from 'ink';
import { DEFAULT_FOOTER_HINTS } from '../constants/index.js';

interface FooterProps {
    hints?: string[];
    activePane?: string;
}

export const Footer: React.FC<FooterProps> = ({ hints, activePane }) => {
    const activeHints = hints || DEFAULT_FOOTER_HINTS;

    return (
        <Box
            marginTop={1}
            paddingTop={0}
            borderStyle="single"
            borderTop
            borderBottom={false}
            borderLeft={false}
            borderRight={false}
            borderColor="gray"
            justifyContent="space-between"
        >
            <Box>
                <Text color="gray">
                    {activeHints.map((hint, idx) => (
                        <Text key={idx}>
                            {idx > 0 ? '  •  ' : ''}
                            <Text color="cyan">{hint}</Text>
                        </Text>
                    ))}
                </Text>
            </Box>
            {activePane && (
                <Box>
                    <Text color="gray">
                        Focus:{' '}
                        <Text bold color="yellow">
                            {activePane.toUpperCase()}
                        </Text>
                    </Text>
                </Box>
            )}
        </Box>
    );
};
