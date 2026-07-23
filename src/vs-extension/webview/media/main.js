(function () {
    const vscode = acquireVsCodeApi();

    // Command Queue for sequential executions (e.g. Sync Settings + Sync Extensions)
    let executionQueue = [];
    let isRunning = false;

    // Send ready event to load dynamic lists
    vscode.postMessage({ command: 'ready' });

    // Handle messages from extension backend
    window.addEventListener('message', (event) => {
        const message = event.data;
        switch (message.type) {
            case 'initData':
                renderMcpCheckboxes(message.mcps);
                renderSkillCheckboxes(message.skills);
                updateWorkspaceBadge(message.workspaceName);
                break;
            case 'log':
                appendLog(message.text);
                break;
            case 'status':
                updateStatus(message.status, message.code);
                break;
        }
    });

    // Helper: Update workspace badge
    function updateWorkspaceBadge(name) {
        const badge = document.getElementById('workspace-badge');
        if (badge) {
            badge.textContent = name;
        }
    }

    // Helper: Render MCP checkbox list
    function renderMcpCheckboxes(mcps) {
        const container = document.getElementById('mcp-checkboxes-container');
        if (!container) return;
        container.innerHTML = '';

        if (!mcps || mcps.length === 0) {
            container.innerHTML = '<div class="loading-placeholder">No MCP servers available.</div>';
            return;
        }

        mcps.forEach(mcp => {
            const wrapper = document.createElement('div');
            wrapper.className = 'checkbox-item-wrapper';

            const checkbox = document.createElement('vscode-checkbox');
            checkbox.className = 'mcp-checkbox';
            checkbox.setAttribute('value', mcp);
            checkbox.textContent = mcp.toUpperCase();

            // Auto-check common ones
            if (mcp === 'github' || mcp === 'clockify' || mcp === 'gitnexus') {
                checkbox.setAttribute('checked', 'true');
            }

            const desc = document.createElement('div');
            desc.className = 'checkbox-desc';
            desc.textContent = getMcpDesc(mcp);

            wrapper.appendChild(checkbox);
            wrapper.appendChild(desc);
            container.appendChild(wrapper);
        });
    }

    function getMcpDesc(mcp) {
        const descs = {
            clockify: 'Track and log task time entries to Clockify.',
            fetch: 'Fetch and convert web page content to markdown.',
            gitnexus: 'Semantic code intelligence and index check.',
            github: 'GitHub integration (PRs, issues, commits).',
            memory: 'Graph-based knowledge and observations memory.',
            notion: 'Manage workspaces, databases and pages in Notion.',
            postgres: 'Read/write database schemas and run queries.',
            tavily: 'Tavily web search and deep research tool.'
        };
        return descs[mcp] || 'Model Context Protocol server configuration.';
    }

    // Helper: Render Skill checkbox list
    function renderSkillCheckboxes(skills) {
        const container = document.getElementById('skills-checkboxes-container');
        if (!container) return;
        container.innerHTML = '';

        if (!skills || skills.length === 0) {
            container.innerHTML = '<div class="loading-placeholder">No skills available.</div>';
            return;
        }

        skills.forEach(skill => {
            const wrapper = document.createElement('div');
            wrapper.className = 'checkbox-item-wrapper';

            const checkbox = document.createElement('vscode-checkbox');
            checkbox.className = 'skill-checkbox';
            checkbox.setAttribute('value', skill.name);
            checkbox.textContent = skill.name;

            // Auto check general helper skills
            if (skill.name === 'grill-me' || skill.name === 'c4-diagrams' || skill.name === 'architectural-decision-records') {
                checkbox.setAttribute('checked', 'true');
            }

            const desc = document.createElement('div');
            desc.className = 'checkbox-desc';
            desc.textContent = skill.description;

            wrapper.appendChild(checkbox);
            wrapper.appendChild(desc);
            container.appendChild(wrapper);
        });
    }

    // Helper: Append log line to terminal
    function appendLog(text) {
        const logBox = document.getElementById('log-output');
        if (!logBox) return;

        const line = document.createElement('div');
        line.className = 'log-line';
        
        // Clean terminal color escapes (ANSI codes)
        const cleanText = text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
        line.textContent = cleanText;

        // Apply color classes
        if (cleanText.toLowerCase().includes('[error]') || cleanText.toLowerCase().includes('error:')) {
            line.classList.add('error-log');
        } else if (cleanText.startsWith('[SYSTEM ERROR]')) {
            line.classList.add('error-log');
        } else if (cleanText.startsWith('[SYSTEM] Starting') || cleanText.startsWith('[SYSTEM] Cancelling')) {
            line.classList.add('sys-log');
        } else if (cleanText.includes('[SYSTEM] Command finished successfully') || cleanText.includes('successfully!') || cleanText.includes('completed!')) {
            line.classList.add('success-log');
        } else {
            line.classList.add('stdout-log');
        }

        logBox.appendChild(line);
        logBox.scrollTop = logBox.scrollHeight;
    }

    // Helper: Update status badge and disable controls
    function updateStatus(status, code) {
        const statusBadge = document.getElementById('process-status-badge');
        const cancelBtn = document.getElementById('btn-cancel-process');

        if (statusBadge) {
            statusBadge.className = ''; // Reset classes
            if (status === 'running') {
                statusBadge.textContent = 'Status: Running...';
                statusBadge.setAttribute('appearance', 'primary');
                statusBadge.classList.add('status-running');
                cancelBtn?.removeAttribute('disabled');
                isRunning = true;
                setControlsDisabled(true);
            } else if (status === 'success') {
                statusBadge.textContent = 'Status: Success';
                statusBadge.setAttribute('appearance', 'secondary');
                cancelBtn?.setAttribute('disabled', 'true');
                isRunning = false;
                setControlsDisabled(false);
                checkQueue();
            } else if (status === 'error') {
                statusBadge.textContent = `Status: Error (${code})`;
                statusBadge.setAttribute('appearance', 'danger');
                cancelBtn?.setAttribute('disabled', 'true');
                isRunning = false;
                setControlsDisabled(false);
                executionQueue = []; // Clear queue on error
            } else {
                statusBadge.textContent = 'Status: Idle';
                statusBadge.setAttribute('appearance', 'secondary');
                cancelBtn?.setAttribute('disabled', 'true');
                isRunning = false;
                setControlsDisabled(false);
            }
        }
    }

    // Helper: Disable/Enable all controls during runs
    function setControlsDisabled(disabled) {
        const buttons = document.querySelectorAll('.action-btn:not(#btn-cancel-process)');
        const inputs = document.querySelectorAll('vscode-checkbox, vscode-dropdown');
        
        buttons.forEach(btn => {
            if (disabled) {
                btn.setAttribute('disabled', 'true');
            } else {
                btn.removeAttribute('disabled');
            }
        });

        inputs.forEach(input => {
            if (disabled) {
                input.setAttribute('disabled', 'true');
            } else {
                input.removeAttribute('disabled');
            }
        });
    }

    // Queue Handler: Run next command if queued
    function checkQueue() {
        if (executionQueue.length > 0) {
            const nextArgs = executionQueue.shift();
            appendLog(`[SYSTEM] Queue progress: running next command...`);
            vscode.postMessage({ command: 'runCli', args: nextArgs });
        }
    }

    // Switch panels to Console tab
    function switchToConsole() {
        const panels = document.getElementById('main-panels');
        if (panels) {
            panels.setAttribute('activeid', 'tab-console');
        }
    }

    // Action listeners
    
    // 1. Dashboard: Run Init
    document.getElementById('btn-init')?.addEventListener('click', () => {
        const force = document.getElementById('init-force')?.checked;
        const args = ['init', '--no-interactive'];
        if (force) args.push('--force');

        switchToConsole();
        vscode.postMessage({ command: 'runCli', args });
    });

    // 2. Dashboard: Run Doctor
    document.getElementById('btn-doctor')?.addEventListener('click', () => {
        switchToConsole();
        vscode.postMessage({ command: 'runCli', args: ['doctor'] });
    });

    // 3. Dashboard: Update Assets
    document.getElementById('btn-update')?.addEventListener('click', () => {
        const force = document.getElementById('update-force')?.checked;
        const args = ['update'];
        if (force) args.push('--force');

        switchToConsole();
        vscode.postMessage({ command: 'runCli', args });
    });

    // 4. VS Code Sync
    document.getElementById('btn-sync-vs')?.addEventListener('click', () => {
        const targetIde = document.getElementById('sync-target-ide')?.value;
        const syncSettings = document.getElementById('sync-settings')?.checked;
        const syncExtensions = document.getElementById('sync-extensions')?.checked;
        const force = document.getElementById('sync-force-settings')?.checked;

        if (!syncSettings && !syncExtensions) {
            appendLog('[SYSTEM ERROR] You must select at least one synchronization scope (Settings or Extensions).');
            return;
        }

        executionQueue = [];

        if (syncSettings) {
            const settingsArgs = ['setting-vs', '--editors', targetIde];
            if (force) settingsArgs.push('--force');
            executionQueue.push(settingsArgs);
        }

        if (syncExtensions) {
            const extensionsArgs = ['extensions-vs', '--editors', targetIde];
            executionQueue.push(extensionsArgs);
        }

        switchToConsole();
        checkQueue(); // Start executing
    });

    // 5. MCP Configurator
    document.getElementById('btn-sync-mcp')?.addEventListener('click', () => {
        const targetIdes = Array.from(document.querySelectorAll('.mcp-target-ide'))
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const selectedMcps = Array.from(document.querySelectorAll('.mcp-checkbox'))
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (targetIdes.length === 0) {
            appendLog('[SYSTEM ERROR] Please select at least one target IDE/Agent.');
            return;
        }

        if (selectedMcps.length === 0) {
            appendLog('[SYSTEM ERROR] Please select at least one MCP server to configure.');
            return;
        }

        const args = ['init', 'mcp', selectedMcps.join(','), '--ide', targetIdes.join(',')];
        switchToConsole();
        vscode.postMessage({ command: 'runCli', args });
    });

    // 6. Skills Deployer
    document.getElementById('btn-sync-skills')?.addEventListener('click', () => {
        const targetIdes = Array.from(document.querySelectorAll('.skills-target-ide'))
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const selectedSkills = Array.from(document.querySelectorAll('.skill-checkbox'))
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const noIgnore = document.getElementById('skills-no-ignore')?.checked;

        if (targetIdes.length === 0) {
            appendLog('[SYSTEM ERROR] Please select at least one target IDE/Agent.');
            return;
        }

        if (selectedSkills.length === 0) {
            appendLog('[SYSTEM ERROR] Please select at least one custom agent skill.');
            return;
        }

        const args = ['skill', '.', selectedSkills.join(','), '--tool', targetIdes.join(',')];
        if (noIgnore) args.push('--no-ignore');

        switchToConsole();
        vscode.postMessage({ command: 'runCli', args });
    });

    // 7. Console Controls: Clear console
    document.getElementById('btn-clear-console')?.addEventListener('click', () => {
        const logBox = document.getElementById('log-output');
        if (logBox) {
            logBox.innerHTML = '<div class="sys-log">[SYSTEM] Console output cleared.</div>';
        }
    });

    // 8. Console Controls: Cancel execution
    document.getElementById('btn-cancel-process')?.addEventListener('click', () => {
        executionQueue = []; // Clear any queued commands
        vscode.postMessage({ command: 'cancelCli' });
    });

})();
