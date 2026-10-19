import React from 'react';
import { Box, Text } from 'ink';
import { VERSION } from '@/constants/index.js';
import type { ColumnModel } from '../types/task.js';

interface HeaderProps {
    workspacePath: string;
    columns: ColumnModel[];
    totalTasks: number;
}

export const Header: React.FC<HeaderProps> = ({ workspacePath, columns, totalTasks }) => {
    const iconMap: Record<string, string> = {
        concept: '💡',
        plan: '📋',
        in_progress: '⚡',
        review: '🔍',
        done: '✅',
    };

    return (
        <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1} marginBottom={1}>
            <Box justifyContent="space-between">
                <Text bold color="cyan">
                    🚀 ONLY-ONE ⚡ WORKFLOW BOARD <Text color="gray">v{VERSION}</Text>
                </Text>
                <Text dimColor>Workspace: {workspacePath}</Text>
            </Box>
            <Box marginTop={1} justifyContent="space-between">
                <Box gap={2}>
                    {columns.map((col) => (
                        <Text key={col.id} color={col.color}>
                            {iconMap[col.id] || '●'} {col.tasks.length} {col.title}
                        </Text>
                    ))}
                </Box>
                <Text bold color="white">
                    Total: {totalTasks} Tasks
                </Text>
            </Box>
        </Box>
    );
};
