import type { ProgramDeps } from '@/cli/deps.js';
import { Box, Text, useApp, useInput } from 'ink';
import React, { FC, useEffect, useState } from 'react';
import { Footer } from './components/Footer.js';
import { Header } from './components/Header.js';
import { BoardView } from './components/BoardView.js';
import { MarkdownViewer } from './components/MarkdownViewer.js';
import { groupTasksByColumn, scanTasks, updateTaskStatus } from './services/taskScanner.js';
import type { ColumnModel, ConfirmActionState, TaskModel, TaskStatus, TuiMode } from './types/task.js';

interface AppProps {
    deps?: ProgramDeps;
}

export const App: FC<AppProps> = ({ deps }) => {
    const { exit } = useApp();
    const [mode, setMode] = useState<TuiMode>('board');
    const [tasks, setTasks] = useState<TaskModel[]>([]);
    const [selectedTask, setSelectedTask] = useState<TaskModel | null>(null);
    const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        setLoading(true);
        const loaded = await scanTasks(deps?.cwd || process.cwd());
        setTasks(loaded);
        setLoading(false);
    };

    useEffect(() => {
        refresh();
    }, []);

    useInput((input, key) => {
        if (confirmAction) {
            if (input === 'y' || key.return) {
                // Future expansion: execute workflow runner
                setConfirmAction(null);
            } else if (input === 'n' || key.escape) {
                setConfirmAction(null);
            }
        }
    });

    const handleMoveTask = async (task: TaskModel, newStatus: TaskStatus) => {
        await updateTaskStatus(task.folderPath, newStatus);
        await refresh();
    };

    const columns: ColumnModel[] = groupTasksByColumn(tasks);

    return (
        <Box flexDirection="column" padding={1}>
            <Header workspacePath={deps?.cwd || process.cwd()} columns={columns} totalTasks={tasks.length} />

            {loading ? (
                <Text color="yellow">Scanning only-one/tasks...</Text>
            ) : mode === 'viewer' && selectedTask ? (
                <MarkdownViewer task={selectedTask} onClose={() => setMode('board')} />
            ) : (
                <BoardView
                    columns={columns}
                    onSelectTask={(task) => {
                        setSelectedTask(task);
                        setMode('viewer');
                    }}
                    onMoveTask={handleMoveTask}
                    onTriggerAction={(task, action) => {
                        setConfirmAction({ task, action });
                    }}
                    onRefresh={refresh}
                    onQuit={exit}
                />
            )}

            {confirmAction && (
                <Box borderStyle="single" borderColor="yellow" paddingX={1} marginY={1}>
                    <Text bold color="yellow">
                        Action: Run /only-one-{confirmAction.action} for &quot;{confirmAction.task.slug}&quot;? (y/n)
                    </Text>
                </Box>
            )}

            <Footer mode={mode} />
        </Box>
    );
};
