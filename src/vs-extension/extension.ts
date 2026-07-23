import * as vscode from 'vscode';
import { createVSCodeProgramDeps } from './adapters/vscode-deps.js';
import { OnlyOneDashboardPanel } from './webview/dashboard-panel.js';
import { createDoctorCommand, createInitCommand, createMcpCommand, createSkillCommand } from '@/commands/index.js';

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('Only One AI');
    context.subscriptions.push(outputChannel);

    const deps = createVSCodeProgramDeps(outputChannel);

    // 1. Open Dashboard Tab Bar command
    context.subscriptions.push(
        vscode.commands.registerCommand('only-one.openDashboard', () => {
            OnlyOneDashboardPanel.createOrShow(context.extensionUri);
        }),
    );

    // 2. Init Workspace command
    context.subscriptions.push(
        vscode.commands.registerCommand('only-one.init', async () => {
            outputChannel.show(true);
            outputChannel.appendLine('[Only One AI] Running Initialization...');
            try {
                const initCmd = createInitCommand(deps);
                await initCmd.parseAsync([], { from: 'user' });
                vscode.window.showInformationMessage('Only One AI: Workspace initialization completed!');
            } catch (err: any) {
                vscode.window.showErrorMessage(`Only One AI Init failed: ${err.message}`);
            }
        }),
    );

    // 3. Environment Doctor command
    context.subscriptions.push(
        vscode.commands.registerCommand('only-one.doctor', async () => {
            outputChannel.show(true);
            outputChannel.appendLine('[Only One AI] Running Environment Doctor Check...');
            try {
                const doctorCmd = createDoctorCommand(deps);
                await doctorCmd.parseAsync([], { from: 'user' });
                vscode.window.showInformationMessage('Only One AI: Environment check completed!');
            } catch (err: any) {
                vscode.window.showErrorMessage(`Only One AI Doctor failed: ${err.message}`);
            }
        }),
    );

    // 4. Sync Skills command
    context.subscriptions.push(
        vscode.commands.registerCommand('only-one.syncSkills', async () => {
            outputChannel.show(true);
            outputChannel.appendLine('[Only One AI] Running Skills Sync...');
            try {
                const skillCmd = createSkillCommand(deps);
                await skillCmd.parseAsync([], { from: 'user' });
                vscode.window.showInformationMessage('Only One AI: Skills sync completed!');
            } catch (err: any) {
                vscode.window.showErrorMessage(`Only One AI Skills Sync failed: ${err.message}`);
            }
        }),
    );

    // 5. Configure MCP command
    context.subscriptions.push(
        vscode.commands.registerCommand('only-one.syncMcp', async () => {
            outputChannel.show(true);
            outputChannel.appendLine('[Only One AI] Running MCP Configuration...');
            try {
                const mcpCmd = createMcpCommand(deps);
                await mcpCmd.parseAsync([], { from: 'user' });
                vscode.window.showInformationMessage('Only One AI: MCP Configuration completed!');
            } catch (err: any) {
                vscode.window.showErrorMessage(`Only One AI MCP Configuration failed: ${err.message}`);
            }
        }),
    );

    outputChannel.appendLine('🚀 Only One AI Extension activated successfully!');
}

export function deactivate() {}
