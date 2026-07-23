(function () {
    const vscode = acquireVsCodeApi();

    document.querySelectorAll('.action-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const command = e.currentTarget.getAttribute('data-command');
            if (command) {
                vscode.postMessage({ command });
            }
        });
    });

    window.addEventListener('message', (event) => {
        const message = event.data;
        if (message.type === 'log') {
            const logBox = document.getElementById('log-output');
            if (logBox) {
                const line = document.createElement('div');
                line.textContent = message.text;
                logBox.appendChild(line);
                logBox.scrollTop = logBox.scrollHeight;
            }
        }
    });
})();
