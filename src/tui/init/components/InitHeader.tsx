import React, { FC } from 'react';
import { Box, Text } from 'ink';
import type { IdeTargetOption, WizardFocusArea } from '../types.js';

type InitHeaderProps = {
    ideOptions: IdeTargetOption[];
    activeIdeIndex: number;
    overwrite: boolean;
    focusArea: WizardFocusArea;
};

export const InitHeader: FC<InitHeaderProps> = ({ ideOptions, activeIdeIndex, overwrite, focusArea }) => {
    return (
        <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1} marginBottom={1}>
            <Box justifyContent="space-between">
                <Text bold color="cyan">
                    ONLY-ONE INIT WIZARD
                </Text>
                <Text dimColor>v1.0.0</Text>
            </Box>

            <Box marginTop={1}>
                <Text bold color={focusArea === 'header-ide' ? 'yellow' : 'white'}>
                    Target IDEs:{' '}
                </Text>
                {ideOptions.map((ide, idx) => {
                    const isCursor = focusArea === 'header-ide' && activeIdeIndex === idx;
                    const icon = ide.selected ? '●' : '○';
                    return (
                        <Box key={ide.id} marginRight={2}>
                            <Text color={isCursor ? 'yellow' : ide.selected ? 'green' : 'gray'} underline={isCursor}>
                                [{icon}] {ide.label}
                            </Text>
                        </Box>
                    );
                })}
            </Box>

            <Box marginTop={1}>
                <Text bold color={focusArea === 'header-overwrite' ? 'yellow' : 'white'}>
                    Overwrite Existing Files:{' '}
                </Text>
                <Text color={overwrite ? 'green' : 'gray'} bold={overwrite} underline={focusArea === 'header-overwrite' && overwrite}>
                    [ YES ]
                </Text>
                <Text> </Text>
                <Text color={!overwrite ? 'red' : 'gray'} bold={!overwrite} underline={focusArea === 'header-overwrite' && !overwrite}>
                    [ NO ]
                </Text>
            </Box>
        </Box>
    );
};
