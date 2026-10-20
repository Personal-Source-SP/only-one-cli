'use client';

import React from 'react';
import { Terminal } from 'lucide-react';
import type { HerdrPaneInfo } from '../app/actions';

type HerdrPanelProps = {
    panes: HerdrPaneInfo[];
    onDispatchPane: (paneId: string) => void;
};

export function HerdrPanel({ panes, onDispatchPane }: HerdrPanelProps) {
    return (
        <aside className="w-80 border-r border-surfaceBorder bg-surface/30 p-4 flex flex-col gap-3 h-full overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-surfaceBorder/60">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-accentCyan" /> Herdr Agents
                </span>
                <span className="text-xs text-slate-500 font-mono">{panes.length} Panes</span>
            </div>

            <div className="flex flex-col gap-2.5">
                {panes.map((pane) => (
                    <div
                        key={pane.paneId}
                        onClick={() => onDispatchPane(pane.paneId)}
                        className="rounded-xl border border-surfaceBorder bg-surface p-3 hover:border-slate-600 transition cursor-pointer"
                    >
                        <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-accentCyan font-bold">{pane.paneId}</span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${
                                    pane.status === 'working'
                                        ? 'bg-accentYellow/10 text-accentYellow'
                                        : 'bg-accentGreen/10 text-accentGreen'
                                }`}
                            >
                                {pane.status}
                            </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-slate-200">{pane.agentType}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Tab: {pane.tabName}</p>
                    </div>
                ))}
            </div>
        </aside>
    );
}
