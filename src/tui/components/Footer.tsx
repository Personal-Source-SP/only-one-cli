import React from 'react';
import { Box, Text } from 'ink';
import { DEFAULT_FOOTER_HINTS } from '../constants/index.js';

interface FooterProps {
    hints?: string[];
}

export const Footer: React.FC<FooterProps> = ({ hints }) => {
    const activeHints = hints || DEFAULT_FOOTER_HINTS;

    return (
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
            <Text color="gray">
                {activeHints.map((hint, idx) => (
                    <Text key={idx}>
                        {idx > 0 ? '  •  ' : ''}
                        <Text color="cyan">{hint}</Text>
                    </Text>
                ))}
            </Text>
        </Box>
    );
};
