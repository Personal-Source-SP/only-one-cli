import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import type { ProgramDeps } from '../../cli/deps.js';

const execFileAsync = promisify(execFile);

const OPENSPEC_PACKAGE = '@fission-ai/openspec';

export class OpenspecBootstrapError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OpenspecBootstrapError';
    }
}

export const ensureOpenspecCli = async (): Promise<void> => {
    try {
        await execFileAsync('npm', ['list', '-g', OPENSPEC_PACKAGE, '--depth=0'], {
            timeout: 15000,
        });
    } catch {
        try {
            await execFileAsync('npm', ['install', '-g', OPENSPEC_PACKAGE], {
                timeout: 60000,
            });
        } catch {
            throw new OpenspecBootstrapError(
                `Failed to install ${OPENSPEC_PACKAGE}. Install manually:\n  npm install -g ${OPENSPEC_PACKAGE}`,
            );
        }
    }
};

export const getOpenspecCliVersion = async (): Promise<string | null> => {
    try {
        const { stdout } = await execFileAsync('openspec', ['--version'], { timeout: 5000 });
        return stdout.trim() || null;
    } catch {
        return null;
    }
};

export const runOpenspecInit = async (
    deps: ProgramDeps,
    projectDir: string,
    options: { force?: boolean; tools?: string },
): Promise<void> => {
    const args: string[] = ['init'];

    if (options.force) {
        args.push('--force');
    }

    if (options.tools !== undefined) {
        args.push('--tools', options.tools);
    }

    args.push(projectDir);

    try {
        const child = spawn('openspec', args, {
            cwd: projectDir,
            timeout: 120000,
            stdio: deps.prompts ? 'inherit' : undefined,
        });

        await new Promise<void>((resolve, reject) => {
            child.on('exit', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`openspec init exited with code ${code}`));
                }
            });
            child.on('error', reject);
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new OpenspecBootstrapError(`openspec init failed:\n  ${message}`);
    }
};
