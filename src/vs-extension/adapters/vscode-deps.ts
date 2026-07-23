import * as vscode from 'vscode';
import type { ProgramDeps, PromptDeps } from '@/cli/deps.js';

export function createVSCodeProgramDeps(outputChannel: vscode.OutputChannel): ProgramDeps {
    const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();

    const prompts: PromptDeps = {
        input: async (config) => {
            const res = await vscode.window.showInputBox({
                prompt: config.message,
                value: config.default ?? '',
                ignoreFocusOut: true,
            });
            if (res === undefined) {
                throw new Error('Cancelled by user');
            }
            return res;
        },

        confirm: async (config) => {
            const yesItem = 'Yes';
            const noItem = 'No';
            const choice = await vscode.window.showInformationMessage(config.message, { modal: false }, yesItem, noItem);
            if (!choice) {
                return false;
            }
            return choice === yesItem;
        },

        select: async <T>(config: { message: string; choices: Array<{ name: string; value: T }>; default?: T }) => {
            const items = config.choices.map((c) => ({
                label: c.name,
                value: c.value,
            }));

            const picked = await vscode.window.showQuickPick(items, {
                placeHolder: config.message,
                ignoreFocusOut: true,
            });

            if (!picked) {
                throw new Error('Cancelled by user');
            }
            return picked.value;
        },

        checkbox: async <T>(config: {
            message: string;
            choices: Array<{ name: string; value: T; checked?: boolean; preSelected?: boolean; configured?: boolean; detected?: boolean }>;
            default?: T[];
        }): Promise<T[]> => {
            const items = config.choices.map((c) => {
                const isPicked = c.checked ?? c.preSelected ?? false;
                const statusTag = c.configured ? ' (configured)' : c.detected ? ' (detected)' : '';
                return {
                    label: `${c.name}${statusTag}`,
                    picked: isPicked,
                    value: c.value,
                };
            });

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: config.message,
                canPickMany: true,
                ignoreFocusOut: true,
            });

            if (!selected) {
                return [];
            }
            return selected.map((s) => s.value);
        },
    };

    return {
        cwd,
        env: process.env,
        fetcher: globalThis.fetch,
        isInteractive: true,
        prompts,
        stdout: (line: string) => outputChannel.appendLine(line),
        stderr: (line: string) => outputChannel.appendLine(`[ERROR] ${line}`),
    };
}
