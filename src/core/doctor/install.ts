import filter from 'lodash/filter.js';
import isEmpty from 'lodash/isEmpty.js';
import map from 'lodash/map.js';
import { execFileSync } from 'node:child_process';
import type { DoctorMode } from '@/core/indexing/tools.js';
import { resolveCocoindexImage, resolveGitnexusImage } from '@/core/indexing/tools.js';
import type { CheckResult } from './checks.js';
import {
    COCOINDEX_CONTAINER_NAME,
    ensureCocoindexContainerRunning,
    ensureGitnexusContainerRunning,
    GITNEXUS_CONTAINER_NAME,
} from '@/core/indexing/docker-runtime.js';
import type { DoctorBuildInstallScriptRequest, DoctorInstallDependenciesRequest, InstallResult } from './types.js';

export function missingIndexingDependencies(checks: CheckResult[]): string[] {
    return map(
        filter(checks, (check) => !check.ok && check.required),
        'name',
    );
}

export function buildInstallScript(request: DoctorBuildInstallScriptRequest): string {
    const { mode, missing } = request;
    const lines = ['#!/usr/bin/env bash', 'set -euo pipefail', ''];

    if (missing.includes('docker')) {
        lines.push('# Install Docker: https://docs.docker.com/get-docker/');
        lines.push('# After Docker is installed, start the daemon and re-run only-one doctor');
        lines.push('');
    }

    if (mode === 'docker') {
        if (missing.includes('gitnexus')) {
            const image = resolveGitnexusImage();
            lines.push(`docker pull ${image}`);
            lines.push(`docker run -d --name ${GITNEXUS_CONTAINER_NAME} --restart unless-stopped ${image}`);
            lines.push('');
        }
        if (missing.includes('cocoindex')) {
            const image = resolveCocoindexImage();
            lines.push(`docker pull ${image}`);
            lines.push(`docker run -d --name ${COCOINDEX_CONTAINER_NAME} --restart unless-stopped --entrypoint sleep ${image} infinity`);
            lines.push('');
        }
        return lines.join('\n').trimEnd();
    }

    if (missing.includes('gitnexus')) {
        lines.push('npm install -g gitnexus@1.6.4');
        lines.push('');
    }

    if (missing.includes('cocoindex')) {
        lines.push('# Requires Python 3.11+');
        lines.push('pip3 install cocoindex');
        lines.push('');
    }

    return lines.join('\n').trimEnd();
}

async function pullDockerImage(image: string): Promise<void> {
    execFileSync('docker', ['pull', image], { encoding: 'utf-8', stdio: 'pipe' });
}

export async function runMissingInstalls(mode: DoctorMode, missing: string[]): Promise<InstallResult[]> {
    const results: InstallResult[] = [];

    if (missing.includes('docker')) {
        results.push({
            ok: false,
            dependency: 'docker',
            detail: 'manual install required — see https://docs.docker.com/get-docker/',
        });
    }

    if (mode === 'docker') {
        if (missing.includes('gitnexus')) {
            try {
                const image = resolveGitnexusImage();
                await pullDockerImage(image);
                ensureGitnexusContainerRunning(image);
                results.push({
                    ok: true,
                    dependency: 'gitnexus',
                    detail: `GitNexus image pulled; container ${GITNEXUS_CONTAINER_NAME} running`,
                });
            } catch (err: any) {
                results.push({
                    ok: false,
                    dependency: 'gitnexus',
                    detail: err?.message ? String(err.message) : 'docker pull failed',
                });
            }
        }

        if (missing.includes('cocoindex')) {
            try {
                const image = resolveCocoindexImage();
                await pullDockerImage(image);
                ensureCocoindexContainerRunning(image);
                results.push({
                    ok: true,
                    dependency: 'cocoindex',
                    detail: `CocoIndex image pulled; container ${COCOINDEX_CONTAINER_NAME} running`,
                });
            } catch (err: any) {
                results.push({
                    ok: false,
                    dependency: 'cocoindex',
                    detail: err?.message ? String(err.message) : 'docker pull failed',
                });
            }
        }

        return results;
    }

    if (missing.includes('gitnexus')) {
        try {
            execFileSync('npm', ['install', '-g', 'gitnexus@1.6.4'], {
                stdio: 'pipe',
                encoding: 'utf-8',
            });
            results.push({
                ok: true,
                dependency: 'gitnexus',
                detail: 'installed globally via npm',
            });
        } catch (err: any) {
            results.push({
                ok: false,
                dependency: 'gitnexus',
                detail: err?.message ? String(err.message) : 'npm install failed',
            });
        }
    }

    if (missing.includes('cocoindex')) {
        try {
            execFileSync('pip3', ['install', 'cocoindex'], {
                stdio: 'pipe',
                encoding: 'utf-8',
            });
            results.push({
                ok: true,
                dependency: 'cocoindex',
                detail: 'installed via pip3',
            });
        } catch (err: any) {
            results.push({
                ok: false,
                dependency: 'cocoindex',
                detail: err?.message ? String(err.message) : 'pip3 install failed',
            });
        }
    }

    return results;
}

export async function installMissingDependencies(request: DoctorInstallDependenciesRequest): Promise<InstallResult[]> {
    const { mode, missing, options = {} } = request;
    if (isEmpty(missing)) return [];

    if (!options.skipConfirm) {
        const confirm = options.confirm;
        if (!confirm) throw new Error('confirm callback is required when skipConfirm is false');

        const proceed = await confirm(`Install missing dependencies (${missing.join(', ')})? This may require network access.`);
        if (!proceed) {
            return missing.map((dependency) => ({
                ok: false,
                dependency,
                detail: 'skipped by user',
            }));
        }
    }

    return runMissingInstalls(mode, missing);
}
