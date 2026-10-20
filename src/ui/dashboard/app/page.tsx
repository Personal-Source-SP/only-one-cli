'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { KanbanBoard } from '../components/KanbanBoard';
import { HerdrPanel } from '../components/HerdrPanel';
import { MarkdownModal } from '../components/MarkdownModal';
import { SettingsModal } from '../components/SettingsModal';
import { getTasksAction, moveTaskAction, getHerdrPanesAction, type DashboardTask, type HerdrPaneInfo } from './actions';

export default function DashboardPage() {
    const [tasks, setTasks] = useState<DashboardTask[]>([]);
    const [panes, setPanes] = useState<HerdrPaneInfo[]>([]);
    const [selectedTask, setSelectedTask] = useState<DashboardTask | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    async function loadData() {
        const [fetchedTasks, fetchedPanes] = await Promise.all([getTasksAction(), getHerdrPanesAction()]);
        setTasks(fetchedTasks);
        setPanes(fetchedPanes);
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleMoveTask(folderPath: string, newStatus: DashboardTask['status']) {
        setTasks((prev) => prev.map((t) => (t.folderPath === folderPath ? { ...t, status: newStatus } : t)));
        await moveTaskAction(folderPath, newStatus);
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            <Header
                workspaceName="only-one-cli"
                herdrConnected={panes.length > 0}
                onRefresh={loadData}
                onOpenSettings={() => setIsSettingsOpen(true)}
            />

            <div className="flex flex-1 overflow-hidden">
                <HerdrPanel panes={panes} onDispatchPane={() => {}} />

                <main className="flex-1 overflow-y-auto">
                    <KanbanBoard tasks={tasks} onMoveTask={handleMoveTask} onViewDoc={(task) => setSelectedTask(task)} />
                </main>
            </div>

            <MarkdownModal
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onDispatch={(slug) => console.log('Dispatch:', slug)}
            />

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
}
