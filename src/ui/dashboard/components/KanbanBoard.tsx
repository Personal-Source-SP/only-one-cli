'use client';

import React from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import type { DashboardTask } from '../app/actions';

const COLUMNS: { id: DashboardTask['status']; title: string; color: string }[] = [
    { id: 'concept', title: 'CONCEPT', color: 'border-t-accentCyan' },
    { id: 'plan', title: 'PLAN', color: 'border-t-accentBlue' },
    { id: 'processing', title: 'PROCESSING', color: 'border-t-accentYellow' },
    { id: 'done', title: 'DONE', color: 'border-t-accentGreen' },
];

type KanbanBoardProps = {
    tasks: DashboardTask[];
    onMoveTask: (folderPath: string, newStatus: DashboardTask['status']) => void;
    onViewDoc: (task: DashboardTask) => void;
};

export function KanbanBoard({ tasks, onMoveTask, onViewDoc }: KanbanBoardProps) {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeTask = active.data.current?.task as DashboardTask | undefined;
        if (!activeTask) return;

        const overId = String(over.id);
        const targetCol = COLUMNS.find((c) => c.id === overId);
        if (targetCol && activeTask.status !== targetCol.id) {
            onMoveTask(activeTask.folderPath, targetCol.id);
            return;
        }

        const overTask = tasks.find((t) => t.folderPath === overId);
        if (overTask && overTask.status !== activeTask.status) {
            onMoveTask(activeTask.folderPath, overTask.status);
        }
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full p-6">
                {COLUMNS.map((col) => {
                    const colTasks = tasks.filter((t) => t.status === col.id);
                    return (
                        <div
                            key={col.id}
                            id={col.id}
                            className={`flex flex-col rounded-2xl bg-surface/40 border border-surfaceBorder border-t-2 ${col.color} p-4 h-full min-h-[500px]`}
                        >
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-surfaceBorder/60">
                                <span className="text-xs font-bold tracking-wider text-slate-300">{col.title}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-surfaceBorder/80 font-mono text-slate-400">
                                    {colTasks.length}
                                </span>
                            </div>

                            <SortableContext items={colTasks.map((t) => t.folderPath)} strategy={verticalListSortingStrategy}>
                                <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                                    {colTasks.map((task) => (
                                        <TaskCard key={task.folderPath} task={task} onViewDoc={onViewDoc} />
                                    ))}
                                    {colTasks.length === 0 && (
                                        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-surfaceBorder/40 rounded-xl p-6 text-center">
                                            <p className="text-xs text-slate-500">Kéo thẻ vào đây</p>
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </div>
                    );
                })}
            </div>
        </DndContext>
    );
}
