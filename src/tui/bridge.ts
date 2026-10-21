import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function resolveGoBinaryPath(baseDir: string = process.cwd()): string | null {
    const ext = process.platform === 'win32' ? '.exe' : '';
    const binaryName = `only-one-ui${ext}`;

    const candidates = [
        path.join(baseDir, 'bin', binaryName),
        path.join(baseDir, 'packages', 'tui-engine', binaryName),
        path.join(baseDir, 'dist', 'bin', binaryName),
    ];

    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

export async function launchGoTui(workspaceDir: string = process.cwd()): Promise<number> {
    const binaryPath = resolveGoBinaryPath();
    if (!binaryPath) {
        throw new Error('Go TUI Engine binary không tìm thấy. Vui lòng chạy npm run build:go.');
    }

    return new Promise((resolve, reject) => {
        const proc = spawn(binaryPath, ['board'], {
            cwd: workspaceDir,
            stdio: 'inherit',
        });

        proc.on('close', (code) => resolve(code ?? 0));
        proc.on('error', (err) => reject(err));
    });
}

export async function launchGoInit(workspaceDir: string = process.cwd()): Promise<number> {
    const binaryPath = resolveGoBinaryPath();
    if (!binaryPath) {
        throw new Error('Go TUI Engine binary không tìm thấy. Vui lòng chạy npm run build:go.');
    }

    return new Promise((resolve, reject) => {
        const proc = spawn(binaryPath, ['init'], {
            cwd: workspaceDir,
            stdio: 'inherit',
        });

        proc.on('close', (code) => resolve(code ?? 0));
        proc.on('error', (err) => reject(err));
    });
}
