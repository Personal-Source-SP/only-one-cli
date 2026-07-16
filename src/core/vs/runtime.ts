import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import type { VsFileSystem, VsProcessResult, VsProcessRunner } from './types.js';

export const nodeVsFileSystem: VsFileSystem = {
    copyFile: fs.copyFile,
    mkdir: async (path) => {
        await fs.mkdir(path, { recursive: true });
    },
    readFile: async (path) => fs.readFile(path, 'utf8'),
    rename: fs.rename,
    rm: async (path) => {
        await fs.rm(path, { recursive: true, force: true });
    },
    stat: fs.stat,
    writeFile: fs.writeFile,
};

export class NodeVsProcessRunner implements VsProcessRunner {
    public async run(command: string, args: string[]): Promise<VsProcessResult> {
        return new Promise((resolve) => {
            const child = spawn(command, args, { shell: false });
            let stderr = '';
            let stdout = '';
            child.stderr.on('data', (chunk: Buffer) => {
                stderr += chunk.toString();
            });
            child.stdout.on('data', (chunk: Buffer) => {
                stdout += chunk.toString();
            });
            child.on('error', (error) => resolve({ code: 127, stderr: error.message, stdout }));
            child.on('close', (code) => resolve({ code: code ?? 1, stderr, stdout }));
        });
    }
}
