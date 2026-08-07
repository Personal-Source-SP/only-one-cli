import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { NO_KEY_INPUTS, YES_KEY_INPUTS } from '../constants/index.js';

interface ConfirmInputProps {
    label: string;
    onConfirm: (result: boolean) => void;
}

export const ConfirmInput: React.FC<ConfirmInputProps> = ({ label, onConfirm }) => {
    const [selected, setSelected] = useState<boolean>(true);

    useInput((input, key) => {
        if (key.leftArrow || key.rightArrow) {
            setSelected((prev) => !prev);
        } else if (YES_KEY_INPUTS.includes(input)) {
            onConfirm(true);
        } else if (NO_KEY_INPUTS.includes(input)) {
            onConfirm(false);
        } else if (key.return) {
            onConfirm(selected);
        }
    });

    return (
        <Box flexDirection="column" marginY={1}>
            <Text bold color="yellow">
                {label}
            </Text>
            <Box marginTop={1}>
                <Box marginRight={2}>
                    <Text color={selected ? 'green' : 'gray'}>{selected ? '❯ [ Yes ]' : '  [ Yes ]'}</Text>
                </Box>
                <Box>
                    <Text color={!selected ? 'red' : 'gray'}>{!selected ? '❯ [ No ]' : '  [ No ]'}</Text>
                </Box>
            </Box>
        </Box>
    );
};
