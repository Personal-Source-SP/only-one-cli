import type { ProgramDeps } from '@/cli/deps.js';
import { Box, Text, useApp, useInput } from 'ink';
import React, { FC, useEffect, useState } from 'react';
import { Footer } from './components/Footer.js';
import { Header } from './components/Header.js';
import { BoardView } from './components/BoardView.js';
import { MarkdownViewer } from './components/MarkdownViewer.js';
import { SettingsView } from './components/SettingsView.js';
import { cleanCompletedTasks } from './services/taskCleaner.js';
import { loadGlobalConfig, saveGlobalConfig } from './services/configService.js';
import { dispatchTaskViaHerdr } from './services/herdrService.js';
import { startTaskWatcher } from './services/taskWatcher.js';
import { DEFAULT_GLOBAL_CONFIG, type OnlyOneGlobalConfig } from './types/config.js';
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
    const [globalConfig, setGlobalConfig] = useState<OnlyOneGlobalConfig>(DEFAULT_GLOBAL_CONFIG);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const workspaceDir = deps?.cwd || process.cwd();

    const refresh = async () => {
        setLoading(true);
        const loaded = await scanTasks(workspaceDir);
        setTasks(loaded);
        setLoading(false);

        if (globalConfig.cleanPolicy.enabled && globalConfig.cleanPolicy.trigger === 'threshold') {
            const cleanRes = await cleanCompletedTasks(workspaceDir, globalConfig.cleanPolicy.thresholdCount);
            if (cleanRes.archivedSlugs.length > 0) {
                setStatusMessage(`Đã tự động lưu trữ ${cleanRes.archivedSlugs.length} task đã hoàn thành.`);
            }
        }
    };

    useEffect(() => {
        loadGlobalConfig().then(setGlobalConfig);
        refresh();

        const watcher = startTaskWatcher(workspaceDir, () => {
            refresh();
        });

        return () => watcher.close();
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

    const handleDispatch = async (task: TaskModel) => {
        setStatusMessage(`Đang điều phối ${task.slug} qua Herdr...`);
        const res = await dispatchTaskViaHerdr(task, task.status, globalConfig, workspaceDir);
        setStatusMessage(res.message);
    };

    const handleCleanNow = async () => {
        const res = await cleanCompletedTasks(workspaceDir, 0);
        setStatusMessage(`Đã dọn dẹp ${res.archivedSlugs.length} task sang only-one/archives/.`);
        await refresh();
    };

    const columns: ColumnModel[] = groupTasksByColumn(tasks);

    return (
        <Box flexDirection="column" padding={1}>
            <Header workspacePath={workspaceDir} columns={columns} totalTasks={tasks.length} />

            {loading ? (
                <Text color="yellow">Scanning only-one/tasks...</Text>
            ) : mode === 'settings' ? (
                <SettingsView
                    initialConfig={globalConfig}
                    onSave={(newCfg) => {
                        setGlobalConfig(newCfg);
                        saveGlobalConfig(newCfg);
                    }}
                    onClose={() => setMode('board')}
                />
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
                    onOpenSettings={() => setMode('settings')}
                    onCleanNow={handleCleanNow}
                    onDispatchTask={handleDispatch}
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

            {statusMessage && (
                <Box marginY={1}>
                    <Text color="cyan">ℹ {statusMessage}</Text>
                </Box>
            )}

            <Footer mode={mode} />
        </Box>
    );
};
