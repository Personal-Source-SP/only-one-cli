import * as vscode from 'vscode';
import { getDashboardHtml } from './dashboard-html.js';

export class OnlyOneDashboardPanel {
    public static currentPanel: OnlyOneDashboardPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        const workspaceName = vscode.workspace.workspaceFolders?.[0]?.name ?? 'No Workspace';
        this._panel.webview.html = getDashboardHtml(this._panel.webview, this._extensionUri, workspaceName);

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                if (message.command) {
                    await vscode.commands.executeCommand(message.command);
                }
            },
            null,
            this._disposables,
        );
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

    public dispose() {
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
