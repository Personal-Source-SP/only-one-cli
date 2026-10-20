'use client';

import React from 'react';
import { Sparkles, Settings, RefreshCw, FolderKanban } from 'lucide-react';

type HeaderProps = {
    workspaceName: string;
    herdrConnected: boolean;
    onRefresh: () => void;
    onOpenSettings: () => void;
};

export function Header({ workspaceName, herdrConnected, onRefresh, onOpenSettings }: HeaderProps) {
    return (
        <header className="h-14 border-b border-surfaceBorder bg-surface/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accentCyan to-accentBlue flex items-center justify-center text-slate-950 font-bold shadow-md shadow-accentCyan/20">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-sm font-semibold tracking-wide text-white uppercase flex items-center gap-2">
                    Only-One <span className="text-slate-400 font-normal">Workflow Dashboard</span>
                </h1>
                <div className="h-4 w-px bg-surfaceBorder mx-2" />
                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-background/50 px-2.5 py-1 rounded-md border border-surfaceBorder">
                    <FolderKanban className="w-3.5 h-3.5 text-accentCyan" />
                    <span>{workspaceName}</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-surfaceBorder bg-background/60">
                    <span className={`w-2 h-2 rounded-full ${herdrConnected ? 'bg-accentGreen animate-pulse' : 'bg-slate-500'}`} />
                    <span className={herdrConnected ? 'text-accentGreen' : 'text-slate-400'}>
                        HERDR: {herdrConnected ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                </div>
                <button onClick={onRefresh} className="p-2 rounded-md hover:bg-surfaceBorder text-slate-400 hover:text-white transition">
                    <RefreshCw className="w-4 h-4" />
                </button>
                <button
                    onClick={onOpenSettings}
                    className="p-2 rounded-md hover:bg-surfaceBorder text-slate-400 hover:text-white transition"
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
}
