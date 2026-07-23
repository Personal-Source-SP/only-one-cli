import React from 'react';
import { Box, Text } from 'ink';

interface FooterProps {
    hints?: string[];
}

export const Footer: React.FC<FooterProps> = ({ hints }) => {
    const defaultHints = ['↑/↓ Navigate', 'Enter Select', 'q Exit'];
    const activeHints = hints || defaultHints;

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
