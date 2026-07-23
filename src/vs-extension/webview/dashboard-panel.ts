import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';
import { getDashboardHtml } from './dashboard-html.js';
import { SKILLS } from '@assets/skills/index.js';
import { MCPS } from '@assets/mcps/index.js';

export class OnlyOneDashboardPanel {
    public static currentPanel: OnlyOneDashboardPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _childProcess: child_process.ChildProcess | null = null;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        const workspaceName = vscode.workspace.workspaceFolders?.[0]?.name ?? 'No Workspace';
        this._panel.webview.html = getDashboardHtml(this._panel.webview, this._extensionUri, workspaceName);

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'ready':
                        this.sendInitData();
                        break;
                    case 'runCli':
                        await this.runCli(message.args);
                        break;
                    case 'cancelCli':
                        this.cancelCli();
                        break;
                    default:
                        if (message.command) {
                            await vscode.commands.executeCommand(message.command);
                        }
                        break;
                }
            },
            null,
            this._disposables,
        );
    }

    private sendInitData() {
        const workspaceName = vscode.workspace.workspaceFolders?.[0]?.name ?? 'No Workspace';
        this._panel.webview.postMessage({
            type: 'initData',
            skills: SKILLS.map((s) => ({ name: s.name, description: s.description })),
            mcps: MCPS.map((m) => m.id),
            workspaceName,
        });
    }

    private async runCli(args: string[]) {
        if (this._childProcess) {
            this.log('[SYSTEM] A CLI process is already running. Please cancel or wait for it to finish.');
            return;
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        const cwd = workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();

        // Path to dist/src/index.js
        const cliPath = path.join(this._extensionUri.fsPath, 'dist', 'src', 'index.js');

        this.log(`[SYSTEM] Starting: only-one ${args.join(' ')}`);
        this.sendStatus('running');

        try {
            this._childProcess = child_process.spawn(process.execPath, [cliPath, ...args], {
                cwd,
                env: {
                    ...process.env,
                    ONLY_ONE_CLI_BYPASS_ENTRYPOINT_CHECK: 'true',
                },
            });

            this._childProcess.stdout?.on('data', (data) => {
                const text = data.toString();
                // Send lines
                const lines = text.split(/\r?\n/);
                for (const line of lines) {
                    // Send non-empty or empty lines to maintain formatting
                    this.log(line);
                }
            });

            this._childProcess.stderr?.on('data', (data) => {
                const text = data.toString();
                const lines = text.split(/\r?\n/);
                for (const line of lines) {
                    this.log(`[ERROR] ${line}`);
                }
            });

            this._childProcess.on('error', (err) => {
                this.log(`[SYSTEM ERROR] Failed to start process: ${err.message}`);
                this.sendStatus('error', -1);
                this._childProcess = null;
            });

            this._childProcess.on('close', (code) => {
                this._childProcess = null;
                if (code === 0) {
                    this.log('[SYSTEM] Command finished successfully!');
                    this.sendStatus('success', 0);
                } else {
                    this.log(`[SYSTEM] Command exited with code ${code}`);
                    this.sendStatus('error', code ?? -1);
                }
            });
        } catch (error: any) {
            this.log(`[SYSTEM ERROR] Exception: ${error.message}`);
            this.sendStatus('error', -1);
            this._childProcess = null;
        }
    }

    private cancelCli() {
        if (this._childProcess) {
            this.log('[SYSTEM] Cancelling current execution...');
            this._childProcess.kill();
            this._childProcess = null;
            this.sendStatus('idle');
        } else {
            this.log('[SYSTEM] No command is currently running.');
        }
    }

    public static createOrShow(extensionUri: vscode.Uri): OnlyOneDashboardPanel {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        if (OnlyOneDashboardPanel.currentPanel) {
            OnlyOneDashboardPanel.currentPanel._panel.reveal(column);
            return OnlyOneDashboardPanel.currentPanel;
        }

        const panel = vscode.window.createWebviewPanel('onlyOneDashboard', 'Only One AI Dashboard', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [extensionUri],
        });

        OnlyOneDashboardPanel.currentPanel = new OnlyOneDashboardPanel(panel, extensionUri);
        return OnlyOneDashboardPanel.currentPanel;
    }

    public log(text: string) {
        this._panel.webview.postMessage({ type: 'log', text });
    }

    private sendStatus(status: 'idle' | 'running' | 'success' | 'error', code?: number) {
        this._panel.webview.postMessage({ type: 'status', status, code });
    }

    public dispose() {
        if (this._childProcess) {
            this._childProcess.kill();
            this._childProcess = null;
        }
        OnlyOneDashboardPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
