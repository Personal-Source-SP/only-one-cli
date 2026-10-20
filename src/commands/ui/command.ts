import { Command } from 'commander';
import net from 'node:net';
import { spawn } from 'node:child_process';
import path from 'node:path';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';

export async function findAvailablePort(startPort: number = 4200): Promise<number> {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(startPort, () => {
            server.close(() => resolve(startPort));
        });
        server.on('error', () => {
            resolve(findAvailablePort(startPort + 1));
        });
    });
}

export function launchDesktopApp(url: string, useBrowser = false) {
    if (useBrowser) {
        const cmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
        spawn(cmd, [url], { shell: true, detached: true, stdio: 'ignore' }).unref();
        return;
    }

    if (process.platform === 'win32') {
        spawn('msedge', [`--app=${url}`], { shell: true, detached: true, stdio: 'ignore' }).unref();
    } else if (process.platform === 'darwin') {
        spawn('open', ['-na', 'Google Chrome', '--args', `--app=${url}`], { detached: true, stdio: 'ignore' }).unref();
    } else {
        spawn('google-chrome', [`--app=${url}`], { shell: true, detached: true, stdio: 'ignore' }).unref();
    }
}

export function createUiCommand(deps: ProgramDeps): Command {
    return new Command('ui')
        .alias('dashboard')
        .description('🚀 Khởi chạy Bảng điều khiển Fullstack Next.js trong Cửa sổ Desktop App Mode')
        .option('-p, --port <number>', 'Cổng khởi chạy', '4200')
        .option('--browser', 'Mở trên tab trình duyệt thay vì Desktop App Mode', false)
        .action(async (opts) => {
            const initialPort = parseInt(opts.port, 10) || 4200;
            const port = await findAvailablePort(initialPort);
            const url = `http://localhost:${port}`;

            deps.stdout(COLORS.cli.header(`\n🚀 Đang khởi chạy Only-One Dashboard tại: ${url}`));

            const dashboardPkgPath = path.resolve(resolvePackageRoot(import.meta.url), 'src/ui/dashboard');
            const child = spawn('npx', ['next', 'start', '-p', String(port)], {
                cwd: dashboardPkgPath,
                shell: true,
                env: { ...process.env, ONLY_ONE_WORKSPACE: process.cwd() },
                stdio: 'inherit',
            });

            setTimeout(() => {
                launchDesktopApp(url, opts.browser);
            }, 1500);

            child.on('close', (code) => {
                deps.stdout(COLORS.dim(`\nDashboard server đã dừng (code ${code}).`));
            });
        });
}
