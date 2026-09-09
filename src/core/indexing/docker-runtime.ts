import { execFileSync } from 'node:child_process';

const DOCKER = 'docker';

export type DockerContainerState = 'missing' | 'running' | 'stopped';

export function isDockerDaemonRunning(): boolean {
    try {
        execFileSync(DOCKER, ['info', '--format', '{{.ServerVersion}}'], {
            encoding: 'utf-8',
            stdio: 'pipe',
        });
        return true;
    } catch {
        return false;
    }
}

export function getDockerServerVersion(): string | null {
    try {
        return execFileSync(DOCKER, ['version', '--format', '{{.Server.Version}}'], {
            encoding: 'utf-8',
            stdio: 'pipe',
        }).trim();
    } catch {
        return null;
    }
}

export function hasDockerImage(image: string): boolean {
    try {
        execFileSync(DOCKER, ['image', 'inspect', image], {
            encoding: 'utf-8',
            stdio: 'pipe',
        });
        return true;
    } catch {
        return false;
    }
}

export function getContainerState(name: string): DockerContainerState {
    try {
        const running = execFileSync(DOCKER, ['inspect', '-f', '{{.State.Running}}', name], {
            encoding: 'utf-8',
            stdio: 'pipe',
        }).trim();
        return running === 'true' ? 'running' : 'stopped';
    } catch {
        return 'missing';
    }
}

export function ensureContainerRunning(name: string, runArgs: string[]): void {
    const state = getContainerState(name);
    if (state === 'running') {
        return;
    }
    if (state === 'stopped') {
        execFileSync(DOCKER, ['start', name], { encoding: 'utf-8', stdio: 'pipe' });
        return;
    }
    execFileSync(DOCKER, runArgs, { encoding: 'utf-8', stdio: 'pipe' });
}
