import { Command } from 'commander';

import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { launchGoTui, resolveGoBinaryPath } from '@/tui/bridge.js';

export function createTuiCommand(deps: ProgramDeps): Command {
    return new Command('tui')
        .alias('ui')
        .description('🖥️ Launch interactive Terminal User Interface (TUI) dashboard')
        .helpOption('-h, --help', 'display help for command')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one tui')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('Launches an interactive Bubble Tea dashboard in terminal.')}`,
        )
        .action(async () => {
            if (resolveGoBinaryPath()) {
                await launchGoTui(process.cwd());

                return;
            }

            deps.stdout(COLORS.error('Go TUI Engine binary không tìm thấy. Vui lòng chạy "npm run build:go".'));
        });
}
