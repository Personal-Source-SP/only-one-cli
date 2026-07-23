import forEach from 'lodash/forEach.js';
import isEmpty from 'lodash/isEmpty.js';
import max from 'lodash/max.js';
import map from 'lodash/map.js';
import { localConfigDisplayPath } from '@/core/config/index.js';
import type { SampleCommand } from './checks.js';
import type { DoctorPrintInstallResultsRequest, DoctorPrintReportRequest } from './types.js';

export function printSampleCommands(commands: SampleCommand[], write: (line: string) => void): void {
    if (isEmpty(commands)) return;

    const width = max(map(commands, ({ command }) => command.length)) ?? 0;
    write('');
    write('Commands:');
    forEach(commands, ({ command, description }) => {
        write(`  ${command.padEnd(width)}  ${description}`);
    });
}

export function printDoctorReport(request: DoctorPrintReportRequest): void {
    const { configChecks, envChecks, report, sampleCommands, write } = request;
    write(`Pre-indexing readiness: ${report.status} (mode: ${report.mode}, source: ${report.modeSource})`);

    if (report.status === 'NOT_INITIALIZED') {
        write('');
        write('Project has not been initialized.');
        write('Missing:');
        forEach(report.missing, (name) => {
            write(`  - ${name}`);
        });
        if (!isEmpty(report.remediation)) {
            write('');
            write('Remediation:');
            forEach(report.remediation, (step) => {
                write(`  - ${step}`);
            });
        }
        printSampleCommands(sampleCommands, write);
        return;
    }

    forEach(report.checks, (check) => {
        const icon = check.ok ? '✓' : '✗';
        write(`${icon} ${check.name}: ${check.detail}`);
    });

    if (report.status === 'MISSING') {
        write('');
        write('Missing dependencies:');
        forEach(report.missing, (name) => {
            write(`  - ${name}`);
        });
        if (!isEmpty(report.remediation)) {
            write('');
            write('Remediation:');
            forEach(report.remediation, (step) => {
                write(`  - ${step}`);
            });
            write('');
            write('Tip: answer Yes when prompted to install missing dependencies, or run only-one doctor --install-missing');
        }
    }

    write('');
    write(`Config (${localConfigDisplayPath()}):`);
    forEach(configChecks, (check) => {
        const icon = check.ok ? '✓' : '✗';
        write(`${icon} ${check.name}: ${check.detail}`);
        if (!check.ok && check.remediation) {
            write(`    → ${check.remediation}`);
        }
    });

    write('');
    write('Environment:');
    forEach(envChecks, (check) => {
        const icon = check.ok ? '✓' : '✗';
        write(`${icon} ${check.name}: ${check.detail}`);
        if (!check.ok && check.remediation) {
            write(`    → ${check.remediation}`);
        }
    });

    printSampleCommands(sampleCommands, write);
}

export function printInstallResults(request: DoctorPrintInstallResultsRequest): void {
    const { results, write } = request;
    if (isEmpty(results)) return;

    write('');
    write('Installing missing dependencies...');
    forEach(results, (result) => {
        const icon = result.ok ? '✓' : '✗';
        write(`${icon} install ${result.dependency}: ${result.detail}`);
    });
}
