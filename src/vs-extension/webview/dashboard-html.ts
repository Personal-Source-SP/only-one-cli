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
        <div class="header-status">
            <vscode-badge id="workspace-badge" appearance="secondary">${workspaceName}</vscode-badge>
            <vscode-badge id="process-status-badge" appearance="secondary">Status: Idle</vscode-badge>
        </div>
    </div>

    <vscode-panels activeid="tab-dashboard" id="main-panels">
        <vscode-panel-tab id="tab-dashboard">DASHBOARD</vscode-panel-tab>
        <vscode-panel-tab id="tab-vssync">VS CODE SYNC</vscode-panel-tab>
        <vscode-panel-tab id="tab-mcp">MCP SERVERS</vscode-panel-tab>
        <vscode-panel-tab id="tab-skills">SKILLS & AGENTS</vscode-panel-tab>
        <vscode-panel-tab id="tab-console">CONSOLE OUTPUT</vscode-panel-tab>

        <!-- DASHBOARD VIEW -->
        <vscode-panel-view id="view-dashboard">
            <div class="view-description">
                <h2>🚀 Quick Diagnostic & Setup Actions</h2>
                <p>Run main health checks and initialize workspaces using standard combinations.</p>
            </div>
            <div class="cards-grid">
                <div class="card">
                    <h3>⚙️ Init Workspace</h3>
                    <p>Initialize workspace configurations, default agent templates, and core skills.</p>
                    <div class="card-options">
                        <vscode-checkbox id="init-force">Force overwrite (--force)</vscode-checkbox>
                    </div>
                    <vscode-button class="action-btn" id="btn-init">Run Init</vscode-button>
                </div>

                <div class="card">
                    <h3>🩺 Environment Doctor</h3>
                    <p>Check Node.js, npm, Git, and active IDE path setups for compatibility issues.</p>
                    <vscode-button class="action-btn" id="btn-doctor">Run Doctor Check</vscode-button>
                </div>

                <div class="card">
                    <h3>🧠 Refresh Assets</h3>
                    <p>Re-download and refresh global skills, templates, and rule assets.</p>
                    <div class="card-options">
                        <vscode-checkbox id="update-force">Force refresh (--force)</vscode-checkbox>
                    </div>
                    <vscode-button class="action-btn" id="btn-update">Update Assets</vscode-button>
                </div>
            </div>
        </vscode-panel-view>

        <!-- VS SYNC VIEW -->
        <vscode-panel-view id="view-vssync">
            <div class="view-description">
                <h2>🔄 Sync VS Code & Cursor Settings</h2>
                <p>Merge global settings and missing extensions automatically for target editors.</p>
            </div>
            <div class="sync-form-container">
                <div class="form-group">
                    <label>Select Target Editor:</label>
                    <vscode-dropdown id="sync-target-ide">
                        <vscode-option value="antigravity">Antigravity</vscode-option>
                        <vscode-option value="cursor">Cursor</vscode-option>
                        <vscode-option value="antigravity,cursor">Both Editors</vscode-option>
                    </vscode-dropdown>
                </div>
                <div class="form-group options-group">
                    <label>Synchronization Scope:</label>
                    <vscode-checkbox id="sync-settings" checked>Sync Settings (settings.json)</vscode-checkbox>
                    <vscode-checkbox id="sync-extensions" checked>Sync Extension Packs (extensions.json)</vscode-checkbox>
                    <vscode-checkbox id="sync-force-settings">Force overwrite conflicting settings (--force)</vscode-checkbox>
                </div>
                <vscode-button class="action-btn" id="btn-sync-vs">Synchronize Editor Configurations</vscode-button>
            </div>
        </vscode-panel-view>

        <!-- MCP SERVERS VIEW -->
        <vscode-panel-view id="view-mcp">
            <div class="view-description">
                <h2>🔌 Model Context Protocol Configurator</h2>
                <p>Configure external tools and merge MCP configuration setups to target agents.</p>
            </div>
            <div class="mcp-form-container">
                <div class="form-row">
                    <div class="form-col">
                        <label>Target IDEs/Agents:</label>
                        <div class="checkbox-list inline-list">
                            <vscode-checkbox class="mcp-target-ide" value="antigravity" checked>Antigravity</vscode-checkbox>
                            <vscode-checkbox class="mcp-target-ide" value="cursor" checked>Cursor</vscode-checkbox>
                            <vscode-checkbox class="mcp-target-ide" value="claude" checked>Claude</vscode-checkbox>
                            <vscode-checkbox class="mcp-target-ide" value="codex">Codex</vscode-checkbox>
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-col">
                        <label>Select MCP Servers to Install/Sync:</label>
                        <div class="checkbox-grid" id="mcp-checkboxes-container">
                            <div class="loading-placeholder">Loading available MCP servers...</div>
                        </div>
                    </div>
                </div>
                <vscode-button class="action-btn" id="btn-sync-mcp">Install & Merge MCP Servers</vscode-button>
            </div>
        </vscode-panel-view>

        <!-- SKILLS & AGENTS VIEW -->
        <vscode-panel-view id="view-skills">
            <div class="view-description">
                <h2>🧠 Synchronize Agent Skills & Workflows</h2>
                <p>Inject custom instruction sets and prompt rules into target agent profiles.</p>
            </div>
            <div class="skills-form-container">
                <div class="form-row">
                    <div class="form-col">
                        <label>Target IDEs/Agents:</label>
                        <div class="checkbox-list inline-list">
                            <vscode-checkbox class="skills-target-ide" value="antigravity" checked>Antigravity</vscode-checkbox>
                            <vscode-checkbox class="skills-target-ide" value="cursor" checked>Cursor</vscode-checkbox>
                            <vscode-checkbox class="skills-target-ide" value="claude" checked>Claude</vscode-checkbox>
                            <vscode-checkbox class="skills-target-ide" value="codex">Codex</vscode-checkbox>
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-col">
                        <label>Select Custom Skills to Sync:</label>
                        <div class="checkbox-grid" id="skills-checkboxes-container">
                            <div class="loading-placeholder">Loading available agent skills...</div>
                        </div>
                    </div>
                </div>
                <div class="form-row options-group">
                    <vscode-checkbox id="skills-no-ignore">Skip adding patterns to .gitignore (--no-ignore)</vscode-checkbox>
                </div>
                <vscode-button class="action-btn" id="btn-sync-skills">Deploy Selected Skills</vscode-button>
            </div>
        </vscode-panel-view>

        <!-- CONSOLE VIEW -->
        <vscode-panel-view id="view-console">
            <div class="console-controls">
                <div class="console-title">
                    <h3>📟 Execution Output Log</h3>
                </div>
                <div class="console-actions">
                    <vscode-button appearance="secondary" id="btn-clear-console">Clear Console</vscode-button>
                    <vscode-button appearance="danger" id="btn-cancel-process" disabled>Cancel Execution</vscode-button>
                </div>
            </div>
            <div class="log-container" id="log-output">
                <div class="sys-log">Only-one Extension initialized ready for actions. Select a task above to execute.</div>
            </div>
        </vscode-panel-view>
    </vscode-panels>

    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}
