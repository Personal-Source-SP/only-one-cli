'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
import { X, Send, FileCode } from 'lucide-react';
import type { DashboardTask } from '../app/actions';

type MarkdownModalProps = {
    task: DashboardTask | null;
    onClose: () => void;
    onDispatch: (slug: string, docName: string) => void;
};

export function MarkdownModal({ task, onClose, onDispatch }: MarkdownModalProps) {
    const [activeDocIndex, setActiveDocIndex] = useState(0);

    useEffect(() => {
        mermaid.initialize({ startOnLoad: true, theme: 'dark' });
        mermaid.run();
    }, [task, activeDocIndex]);

    if (!task) return null;
    const activeDoc = task.docs[activeDocIndex] || task.docs[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
            <div className="flex flex-col w-full max-w-5xl h-[85vh] rounded-2xl bg-surface border border-surfaceBorder shadow-2xl overflow-hidden">
                <div className="h-14 border-b border-surfaceBorder px-6 flex items-center justify-between bg-surface/90">
                    <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-accentCyan" />
                        <span className="font-semibold text-white text-sm">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onDispatch(task.slug, activeDoc?.name || '')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accentCyan hover:bg-accentCyan/90 text-slate-950 font-semibold text-xs transition"
                        >
                            <Send className="w-3.5 h-3.5" /> Dispatch Herdr
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surfaceBorder transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex border-b border-surfaceBorder bg-background/50 px-6 gap-2">
                    {task.docs.map((doc, idx) => (
                        <button
                            key={doc.name}
                            onClick={() => setActiveDocIndex(idx)}
                            className={`px-4 py-2.5 text-xs font-mono font-medium border-b-2 transition ${
                                idx === activeDocIndex
                                    ? 'border-accentCyan text-accentCyan'
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {doc.name}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8 prose prose-invert max-w-none prose-pre:bg-background/80 prose-pre:border prose-pre:border-surfaceBorder">
                    <ReactMarkdown>{activeDoc?.content || '*Không có nội dung*'}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
