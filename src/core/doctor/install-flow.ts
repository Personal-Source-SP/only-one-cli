import { confirm as confirmPrompt } from '@inquirer/prompts';
import isEmpty from 'lodash/isEmpty.js';
import { stdin as input } from 'node:process';
import { buildDoctorReport, runIndexingChecks } from './checks.js';
import { installMissingDependencies } from './install.js';
import { printInstallResults } from './format.js';
import type { DoctorInstallFlowResponse, DoctorInstallMissingRequest } from './types.js';

function canPrompt(request: DoctorInstallMissingRequest): boolean {
    return Boolean(request.deps.prompts?.confirm) || Boolean(input.isTTY);
}

export async function maybeInstallMissing(request: DoctorInstallMissingRequest): Promise<DoctorInstallFlowResponse> {
    const { deps, mode, modeSource, options, report } = request;

    if (report.status !== 'MISSING' || isEmpty(report.missing) || options.noInstall) {
        return { report, installResults: [] };
    }

    let shouldInstall = Boolean(options.yes);

    if (!shouldInstall && !options.json && (options.installMissing || canPrompt(request))) {
        const confirm = deps.prompts?.confirm ?? confirmPrompt;
        shouldInstall = await confirm({
            default: true,
            message: `Missing: ${report.missing.join(', ')}. Install missing dependencies now?`,
        });
    }

    if (!shouldInstall) return { report, installResults: [] };

    const installResults = await installMissingDependencies({
        mode,
        missing: report.missing,
        options: { skipConfirm: true },
    });

    if (!options.json) printInstallResults({ results: installResults, write: deps.stdout });

    const indexingChecks = await runIndexingChecks(mode);
    return {
        installResults,
        report: buildDoctorReport(mode, modeSource, indexingChecks),
    };
}
