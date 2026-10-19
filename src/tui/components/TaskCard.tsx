import { Box, Text } from 'ink';
import React, { FC } from 'react';
import type { TaskModel } from '../types/task.js';

interface TaskCardProps {
    task: TaskModel;
    isSelected: boolean;
    isGrabbed: boolean;
}

export const TaskCard: FC<TaskCardProps> = ({ task, isSelected, isGrabbed }) => {
    const borderColor = isGrabbed ? 'yellow' : isSelected ? 'cyan' : 'gray';
    const bg = isGrabbed ? 'yellow' : isSelected ? 'cyan' : undefined;
    const textColor = isGrabbed || isSelected ? 'black' : 'white';

    return (
        <Box flexDirection="column" borderStyle="round" borderColor={borderColor} paddingX={1} marginBottom={1}>
            <Box backgroundColor={bg} paddingX={bg ? 1 : 0} justifyContent="space-between">
                <Text bold color={textColor}>
                    {isGrabbed ? '✦ [GRABBED] ' + task.slug : isSelected ? '► ' + task.slug : task.slug}
                </Text>
            </Box>
            <Box marginTop={0}>
                <Text dimColor wrap="truncate-end">
                    {task.title}
                </Text>
            </Box>
            <Box marginTop={1} gap={1}>
                {task.docs.map((doc) => {
                    const tagColor =
                        doc.name === 'concept.md'
                            ? 'cyan'
                            : doc.name === 'plan.md'
                              ? 'blue'
                              : doc.name === 'debug.md'
                                ? 'yellow'
                                : doc.name === 'review.md'
                                  ? 'magenta'
                                  : 'green';
                    return (
                        <Text key={doc.name} color={tagColor} bold={doc.name === 'plan.md' || doc.name === 'concept.md'}>
                            [{doc.name.replace('.md', '')}]
                        </Text>
                    );
                })}
            </Box>
        </Box>
    );
};
