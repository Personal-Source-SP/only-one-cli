import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { App } from '@/tui/App.js';

export function createTuiCommand(deps: ProgramDeps): Command {
    return new Command('tui')
        .description('🖥️ Launch interactive Terminal User Interface (TUI) dashboard')
        .helpOption('-h, --help', 'display help for command')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one tui')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('Launches an interactive Ink-powered dashboard in terminal.')}`,
        )
        .action(async () => {
            const instance = render(React.createElement(App, { deps }));
            await instance.waitUntilExit();
        });
}
