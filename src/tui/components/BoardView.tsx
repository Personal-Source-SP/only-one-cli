import { Box, Text, useInput } from 'ink';
import React, { FC, useState } from 'react';
import type { ColumnModel, TaskModel, TaskStatus } from '../types/task.js';
import { TaskCard } from './TaskCard.js';

interface BoardViewProps {
    columns: ColumnModel[];
    onSelectTask: (task: TaskModel) => void;
    onMoveTask: (task: TaskModel, newStatus: TaskStatus) => void;
    onTriggerAction: (task: TaskModel, action: 'plan' | 'apply' | 'debug') => void;
    onDispatchTask: (task: TaskModel) => void;
    onOpenSettings: () => void;
    onCleanNow: () => void;
    onRefresh: () => void;
    onQuit: () => void;
}

const COLUMN_ICONS: Record<string, string> = {
    concept: '💡',
    plan: '📋',
    processing: '⚡',
    review: '🔍',
};

export const BoardView: FC<BoardViewProps> = ({
    columns,
    onSelectTask,
    onMoveTask,
    onTriggerAction,
    onDispatchTask,
    onOpenSettings,
    onCleanNow,
    onRefresh,
    onQuit,
}) => {
    const [colIndex, setColIndex] = useState(0);
    const [cardIndices, setCardIndices] = useState<Record<number, number>>({ 0: 0, 1: 0, 2: 0, 3: 0 });
    const [grabbedTask, setGrabbedTask] = useState<TaskModel | null>(null);

    const currentCol = columns[colIndex];
    const currentCardIndex = cardIndices[colIndex] || 0;
    const currentTask = currentCol?.tasks[currentCardIndex] || null;

    useInput((input, key) => {
        if (input === 'q') {
            onQuit();
            return;
        }
        if (input === 'r') {
            onRefresh();
            return;
        }
        if (input === 's') {
            onOpenSettings();
            return;
        }
        if (input === 'c') {
            onCleanNow();
            return;
        }
        if (key.leftArrow) {
            setColIndex((prev) => Math.max(0, prev - 1));
            return;
        }
        if (key.rightArrow) {
            setColIndex((prev) => Math.min(columns.length - 1, prev + 1));
            return;
        }
        if (key.upArrow && currentCol) {
            setCardIndices((prev) => ({
                ...prev,
                [colIndex]: Math.max(0, (prev[colIndex] || 0) - 1),
            }));
            return;
        }
        if (key.downArrow && currentCol) {
            setCardIndices((prev) => ({
                ...prev,
                [colIndex]: Math.min(Math.max(0, currentCol.tasks.length - 1), (prev[colIndex] || 0) + 1),
            }));
            return;
        }
        if (input === 'm') {
            if (grabbedTask) {
                if (currentCol) {
                    onMoveTask(grabbedTask, currentCol.id);
                }
                setGrabbedTask(null);
            } else if (currentTask) {
                setGrabbedTask(currentTask);
            }
            return;
        }
        if (key.return && !grabbedTask && currentTask) {
            onSelectTask(currentTask);
            return;
        }
        if (key.escape && grabbedTask) {
            setGrabbedTask(null);
            return;
        }
        if (currentTask && !grabbedTask) {
            if (input === 'p') onTriggerAction(currentTask, 'plan');
            if (input === 'a') onTriggerAction(currentTask, 'apply');
            if (input === 'd') onDispatchTask(currentTask);
        }
    });

    return (
        <Box flexDirection="row" gap={1} width="100%" flexGrow={1}>
            {columns.map((col, idx) => {
                const isColActive = idx === colIndex;
                return (
                    <Box
                        key={col.id}
                        flexDirection="column"
                        flexGrow={1}
                        flexShrink={1}
                        flexBasis={0}
                        borderStyle="round"
                        borderColor={isColActive ? col.color : 'gray'}
                        paddingX={1}
                    >
                        <Box justifyContent="space-between" marginBottom={1}>
                            <Text bold color={isColActive ? col.color : 'white'}>
                                {COLUMN_ICONS[col.id] || '●'} {col.title} ({col.tasks.length})
                            </Text>
                        </Box>
                        {col.tasks.length === 0 ? (
                            <Text dimColor italic>
                                (Empty)
                            </Text>
                        ) : (
                            col.tasks.map((t, taskIdx) => (
                                <TaskCard
                                    key={t.slug}
                                    task={t}
                                    isSelected={isColActive && taskIdx === cardIndices[idx]}
                                    isGrabbed={grabbedTask?.slug === t.slug}
                                />
                            ))
                        )}
                    </Box>
                );
            })}
        </Box>
    );
};
