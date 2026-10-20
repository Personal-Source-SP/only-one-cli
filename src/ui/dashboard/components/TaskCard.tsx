'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileText, GripVertical } from 'lucide-react';
import type { DashboardTask } from '../app/actions';

type TaskCardProps = {
    task: DashboardTask;
    onViewDoc: (task: DashboardTask) => void;
};

export function TaskCard({ task, onViewDoc }: TaskCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.folderPath,
        data: { task },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative rounded-xl border border-surfaceBorder bg-surface p-4 shadow-sm hover:border-accentCyan/50 hover:shadow-accentCyan/5 transition duration-150"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <button
                        {...attributes}
                        {...listeners}
                        className="text-slate-600 hover:text-slate-300 cursor-grab active:cursor-grabbing"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-medium text-slate-400">{task.slug}</span>
                </div>
                <button
                    onClick={() => onViewDoc(task)}
                    className="text-slate-400 hover:text-accentCyan p-1 rounded hover:bg-background/80 transition"
                >
                    <FileText className="w-3.5 h-3.5" />
                </button>
            </div>

            <h4 className="mt-2 text-sm font-semibold text-slate-100 line-clamp-2 leading-snug">{task.title}</h4>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-surfaceBorder/60">
                <span>{task.docs.length} tài liệu (.md)</span>
                <span className="capitalize">{task.status}</span>
            </div>
        </div>
    );
}
