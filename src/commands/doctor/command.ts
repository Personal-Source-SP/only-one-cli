import { Command } from 'commander';
import isEmpty from 'lodash/isEmpty.js';
import some from 'lodash/some.js';
import type { ProgramDeps } from '@/cli/deps.js';
import { hasLocalConfig, loadConfig, resolveIndexMode } from '@/core/config/index.js';
import {
    buildDoctorReport,
    buildNotInitializedReport,
    buildSampleCommands,
    checkGit,
    checkGlobalConfig,
    checkHybridApiKey,
    checkNode,
    checkServer,
    checkYamlConfig,
    runIndexingChecks,
} from '@/core/doctor/checks.js';
import { buildInstallScript } from '@/core/doctor/install.js';
import { printDoctorReport } from '@/core/doctor/format.js';
import { maybeInstallMissing } from '@/core/doctor/install-flow.js';
import type { DoctorCommandOptions } from '@/core/doctor/types.js';
import { printJson } from '@/core/output/index.js';
import { assertProjectDirectory, globalsFor, resolveProjectDir } from '@/core/runtime/globals.js';

export function createDoctorCommand(deps: ProgramDeps): Command {
    return new Command('doctor')
        .description('Check environment readiness for client-side pre-indexing')
        .option('--mode <mode>', 'Override index mode from config: docker or local')
        .option('--install-missing', 'Install missing pre-indexing dependencies (prompts unless --yes is set)')
        .option('-y, --yes', 'Install missing dependencies without prompting')
        .option('--no-install', 'Do not offer to install missing dependencies')
        .option('--print-install-script', 'Print install script for missing dependencies without executing')
        .argument('[path]', 'Project directory to check (default: current directory)')
        .action(async (path: string | undefined, options: DoctorCommandOptions, command) => {
            const projectDir = resolveProjectDir(deps, path);
            assertProjectDirectory(projectDir);

            const config = await loadConfig(projectDir);
            const { mode, source } = resolveIndexMode(config, options.mode);

            const initialized = await hasLocalConfig(projectDir);
            const globals = await globalsFor(command, deps, projectDir);

            if (!initialized) {
                const report = buildNotInitializedReport(mode, source);
                const sampleCommands = buildSampleCommands(report.status, config);

                if (globals.json) {
                    printJson({ ...report, sampleCommands }, deps.stdout);
                } else {
                    printDoctorReport({
                        write: deps.stdout,
                        report,
                        configChecks: [],
                        envChecks: [],
                        sampleCommands,
                    });
                }

                process.exitCode = 1;
                return;
            }

            let report = buildDoctorReport(mode, source, await runIndexingChecks(mode));

            if (options.printInstallScript) {
                deps.stdout(buildInstallScript({ mode, missing: report.missing }));
                if (report.status === 'MISSING') process.exitCode = 1;
                return;
            }

            const { installResults, report: updatedReport } = await maybeInstallMissing({
                deps,
                mode,
                report,
                modeSource: source,
                options: {
                    json: globals.json,
                    yes: options.yes,
                    noInstall: options.noInstall,
                    installMissing: options.installMissing,
                },
            });
            report = updatedReport;

            const configChecks = checkYamlConfig(config);
            const sampleCommands = buildSampleCommands(report.status, config);
            const envChecks = await Promise.all([
                checkHybridApiKey(),
                checkGit(),
                checkNode(),
                checkServer(globals.server, deps.fetcher, {
                    apiKey: globals.key,
                }),
                checkGlobalConfig(),
            ]);

            if (globals.json) {
                printJson(
                    {
                        ...report,
                        sampleCommands,
                        config: configChecks,
                        environment: envChecks,
                        ...(!isEmpty(installResults) ? { installResults } : {}),
                    },
                    deps.stdout,
                );
            } else {
                printDoctorReport({
                    write: deps.stdout,
                    report,
                    envChecks,
                    configChecks,
                    sampleCommands,
                });
            }

            const hasRequiredCheckFailure = some(report.checks, (check) => !check.ok && check.required);
            const hasRequiredConfigFailure = some(configChecks, (check) => !check.ok && check.required);
            const hasRequiredFailure = report.status === 'MISSING' || hasRequiredCheckFailure || hasRequiredConfigFailure;
            if (hasRequiredFailure) process.exitCode = 1;
        });
}
