import * as vscode from 'vscode';

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function getDashboardHtml(webview: vscode.Webview, extensionUri: vscode.Uri, workspaceName: string): string {
    const toolkitUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode', 'webview-ui-toolkit', 'dist', 'toolkit.js'),
    );
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'vs-extension', 'webview', 'media', 'main.css'));
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'vs-extension', 'webview', 'media', 'main.js'));
    const iconUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'assets', 'icon.png'));
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline' https://fonts.googleapis.com; script-src 'nonce-${nonce}' ${webview.cspSource}; font-src ${webview.cspSource} https://fonts.gstatic.com; img-src ${webview.cspSource} data:;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="module" nonce="${nonce}" src="${toolkitUri}"></script>
    <link rel="stylesheet" href="${styleUri}">
    <title>Only One AI Dashboard</title>
</head>
<body>
    <div class="header">
        <div class="header-brand">
            <img src="${iconUri}" alt="Only One AI Logo" />
            <h1>Only One AI Dashboard</h1>
        </div>
        <vscode-badge>${workspaceName}</vscode-badge>
    </div>

    <vscode-panels activeid="tab-actions">
        <vscode-panel-tab id="tab-actions">QUICK ACTIONS</vscode-panel-tab>
        <vscode-panel-tab id="tab-info">ENV & AGENTS</vscode-panel-tab>

        <vscode-panel-view id="view-actions">
            <div class="cards-grid">
                <div class="card">
                    <h3>⚙️ Init Workspace</h3>
                    <p>Setup workspace configs, agent templates, and skills non-interactively or step-by-step.</p>
                    <vscode-button class="action-btn" data-command="only-one.init">Run Init</vscode-button>
                </div>

                <div class="card">
                    <h3>🩺 Environment Doctor</h3>
                    <p>Verify system environment, Git, and Node.js readiness for agent workflows.</p>
                    <vscode-button class="action-btn" data-command="only-one.doctor">Run Doctor</vscode-button>
                </div>

                <div class="card">
                    <h3>🧠 Sync Agent Skills</h3>
                    <p>Install and synchronize custom agent skills across active IDEs/agents.</p>
                    <vscode-button class="action-btn" data-command="only-one.syncSkills">Sync Skills</vscode-button>
                </div>

                <div class="card">
                    <h3>🔌 Configure MCP</h3>
                    <p>Configure global Model Context Protocol (MCP) servers (GitHub, Clockify, etc.).</p>
                    <vscode-button class="action-btn" data-command="only-one.syncMcp">Configure MCP</vscode-button>
                </div>
            </div>
        </vscode-panel-view>

        <vscode-panel-view id="view-info">
            <p><strong>Supported Target Agents:</strong> Cursor, Claude Desktop, Antigravity, VS Code, Windsurf</p>
            <p><strong>Status:</strong> Environment Ready</p>
        </vscode-panel-view>
    </vscode-panels>

    <h3>Activity Output</h3>
    <div class="log-container" id="log-output">
        <div>Only-one Extension initialized ready for actions...</div>
    </div>

    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}
