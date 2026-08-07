import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface TextInputProps {
    label: string;
    placeholder?: string;
    onSubmit: (value: string) => void;
    onCancel?: () => void;
}

export const TextInput: React.FC<TextInputProps> = ({ label, placeholder, onSubmit, onCancel }) => {
    const [value, setValue] = useState('');

    useInput((input, key) => {
        if (key.return) {
            onSubmit(value);
        } else if (key.escape && onCancel) {
            onCancel();
        } else if (key.backspace || key.delete) {
            setValue((prev) => prev.slice(0, -1));
        } else if (!key.ctrl && !key.meta && input && input.length === 1) {
            setValue((prev) => prev + input);
        }
    });

    return (
        <Box flexDirection="column" marginY={1}>
            <Text bold color="cyan">
                {label}
            </Text>
            <Box borderStyle="single" borderColor="cyan" paddingX={1} marginTop={1}>
                <Text color={value ? 'white' : 'gray'}>{value || placeholder || 'Type and press Enter...'}</Text>
            </Box>
        </Box>
    );
};
