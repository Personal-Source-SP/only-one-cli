import { execFileSync } from 'node:child_process';
import { GITNEXUS_DOCKER_CLI_PATH, resolveCocoindexImage, resolveGitnexusImage } from '@/core/indexing/tools.js';

export const GITNEXUS_CONTAINER_NAME = 'only-one-gitnexus';
export const COCOINDEX_CONTAINER_NAME = 'only-one-cocoindex';

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

export function gitnexusContainerRunArgs(image: string): string[] {
    return ['run', '-d', '--name', GITNEXUS_CONTAINER_NAME, '--restart', 'unless-stopped', image];
}

export function cocoindexContainerRunArgs(image: string): string[] {
    return ['run', '-d', '--name', COCOINDEX_CONTAINER_NAME, '--restart', 'unless-stopped', '--entrypoint', 'sleep', image, 'infinity'];
}

export function ensureGitnexusContainerRunning(image = resolveGitnexusImage()): void {
    ensureContainerRunning(GITNEXUS_CONTAINER_NAME, gitnexusContainerRunArgs(image));
}

export function ensureCocoindexContainerRunning(image = resolveCocoindexImage()): void {
    ensureContainerRunning(COCOINDEX_CONTAINER_NAME, cocoindexContainerRunArgs(image));
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

export function verifyGitnexusInContainer(): string {
    const state = getContainerState(GITNEXUS_CONTAINER_NAME);
    if (state !== 'running') {
        throw new Error(`container ${GITNEXUS_CONTAINER_NAME} is not running`);
    }
    return execFileSync(DOCKER, ['exec', GITNEXUS_CONTAINER_NAME, 'node', GITNEXUS_DOCKER_CLI_PATH, '--version'], {
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 120_000,
    }).trim();
}

export function verifyCocoindexInContainer(): void {
    const state = getContainerState(COCOINDEX_CONTAINER_NAME);
    if (state !== 'running') {
        throw new Error(`container ${COCOINDEX_CONTAINER_NAME} is not running`);
    }
    execFileSync(DOCKER, ['exec', COCOINDEX_CONTAINER_NAME, 'ccc', '--help'], {
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 120_000,
    });
}
