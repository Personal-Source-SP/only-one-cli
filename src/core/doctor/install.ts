import filter from 'lodash/filter.js';
import isEmpty from 'lodash/isEmpty.js';
import map from 'lodash/map.js';
import type { CheckResult } from './checks.js';
import type { DoctorBuildInstallScriptRequest, DoctorInstallDependenciesRequest, DoctorMode, InstallResult } from './types.js';

export function missingIndexingDependencies(checks: CheckResult[]): string[] {
    return map(
        filter(checks, (check) => !check.ok && check.required),
        'name',
    );
}

export function buildInstallScript(request: DoctorBuildInstallScriptRequest): string {
    const { missing } = request;
    const lines = ['#!/usr/bin/env bash', 'set -euo pipefail', ''];

    if (missing.includes('docker')) {
        lines.push('# Install Docker: https://docs.docker.com/get-docker/');
        lines.push('# After Docker is installed, start the daemon and re-run only-one doctor');
        lines.push('');
    }

    return lines.join('\n').trimEnd();
}

export async function runMissingInstalls(_mode: DoctorMode, missing: string[]): Promise<InstallResult[]> {
    const results: InstallResult[] = [];

    if (missing.includes('docker')) {
        results.push({
            ok: false,
            dependency: 'docker',
            detail: 'manual install required — see https://docs.docker.com/get-docker/',
        });
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
