import React, { FC } from 'react';
import { Box, Text, useInput } from 'ink';

interface SearchFilterProps {
    query: string;
    onChange: (query: string) => void;
    isActive: boolean;
    onDeactivate: () => void;
}

export const SearchFilter: FC<SearchFilterProps> = ({ query, onChange, isActive, onDeactivate }) => {
    useInput(
        (input, key) => {
            if (!isActive) return;

            if (key.escape || key.downArrow || key.return) {
                onDeactivate();
                return;
            }

            if (key.backspace || key.delete) {
                onChange(query.slice(0, -1));
                return;
            }

            // Normal typing (filter out control codes)
            if (input && !key.ctrl && !key.meta && input.length === 1) {
                onChange(query + input);
            }
        },
        { isActive },
    );

    return (
        <Box borderStyle="single" borderColor={isActive ? 'yellow' : 'gray'} paddingX={1} marginBottom={1}>
            <Text color={isActive ? 'yellow' : 'gray'}>🔍 </Text>
            {query.length === 0 ? (
                <Text color="gray" italic>
                    {isActive ? 'Type to search actions...' : 'Press [/] to filter'}
                </Text>
            ) : (
                <Text color="white" bold>
                    {query}
                    {isActive ? <Text color="yellow">▎</Text> : null}
                </Text>
            )}
        </Box>
    );
};
