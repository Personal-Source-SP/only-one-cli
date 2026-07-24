import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import type { PackageCommandOptions } from './types.js';
import { loadPackagesStep, checkEnvironment, selectPackagesStep, executePackagesStep } from './actions/index.js';

export function createPackageCommand(deps: ProgramDeps): Command {
    const cmd = new Command('package')
        .description('📦 Install and manage project dependencies with environment check')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of package names to install')
        .option('--tool <tools>', 'Comma-separated IDE/tool IDs to target')
        .option('--no-ignore', 'Skip updating the project .gitignore file')
        .action(async (pathArg: string | undefined, namesArg: string | undefined, options: PackageCommandOptions) => {
            const { projectDir, availablePackages } = loadPackagesStep(deps, pathArg);
            if (!availablePackages?.length) {
                return;
            }

            // 1. Environment requirements check
            const allReqs = Array.from(new Set(availablePackages.flatMap((p) => p.requirements ?? [])));
            const envResult = checkEnvironment(deps, allReqs);
            if (!envResult.ok) {
                deps.stdout(`\n❌ Environment check failed. Missing requirements: ${envResult.missing.join(', ')}\n`);
                return;
            }

            // 2. Select packages
            const { selectedPackageIds, overwriteList } = await selectPackagesStep(deps, projectDir, namesArg, availablePackages);
            if (selectedPackageIds.length === 0) {
                deps.stdout('No packages selected. Exiting.');
                return;
            }

            // 3. Execution
            await executePackagesStep(deps, projectDir, availablePackages, selectedPackageIds, overwriteList);
        });

    return cmd;
}
