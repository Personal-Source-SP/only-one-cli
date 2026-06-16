import type { ProgramDeps } from '@/cli/deps.js';
import type { CheckResult, DoctorReport, SampleCommand } from './checks.js';
import type { DoctorMode } from '@/core/indexing/tools.js';

export interface InstallResult {
    ok: boolean;
    detail: string;
    dependency: string;
}

export interface InstallMissingOptions {
    confirm?: (message: string) => Promise<boolean>;
    skipConfirm?: boolean;
}

export interface DoctorCommandOptions {
    yes?: boolean;
    mode?: string;
    noInstall?: boolean;
    installMissing?: boolean;
    printInstallScript?: boolean;
}

export interface DoctorInstallFlowOptions {
    yes?: boolean;
    json?: boolean;
    noInstall?: boolean;
    installMissing?: boolean;
}

export interface DoctorInstallMissingRequest {
    deps: ProgramDeps;
    mode: DoctorMode;
    report: DoctorReport;
    options: DoctorInstallFlowOptions;
    modeSource: DoctorReport['modeSource'];
}

export interface DoctorInstallFlowResponse {
    report: DoctorReport;
    installResults: InstallResult[];
}

export interface DoctorInstallDependenciesRequest {
    mode: DoctorMode;
    missing: string[];
    options?: InstallMissingOptions;
}

export interface DoctorBuildInstallScriptRequest {
    mode: DoctorMode;
    missing: string[];
}

export interface DoctorPrintReportRequest {
    write: (line: string) => void;
    report: DoctorReport;
    envChecks: CheckResult[];
    configChecks: CheckResult[];
    sampleCommands: SampleCommand[];
}

export interface DoctorPrintInstallResultsRequest {
    write: (line: string) => void;
    results: InstallResult[];
}
