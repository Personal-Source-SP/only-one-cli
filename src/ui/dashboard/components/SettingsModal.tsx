'use client';

import React from 'react';
import { X } from 'lucide-react';

type SettingsModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
            <div className="flex flex-col w-full max-w-lg rounded-2xl bg-surface border border-surfaceBorder shadow-2xl p-6">
                <div className="flex items-center justify-between pb-4 border-b border-surfaceBorder">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cấu hình Hệ thống</h3>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="py-6 flex flex-col gap-4 text-xs text-slate-300">
                    <div>
                        <label className="block font-medium mb-1.5 text-slate-400">Herdr Dispatch Mode</label>
                        <select className="w-full bg-background border border-surfaceBorder rounded-lg p-2.5 text-white">
                            <option value="reuse-target-pane">Reuse Target Pane (Khuyên dùng)</option>
                            <option value="split-new-pane">Split New Pane</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-surfaceBorder">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-surfaceBorder text-slate-300 hover:text-white">
                        Đóng
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-accentCyan text-slate-950 font-semibold hover:bg-accentCyan/90"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
}
