import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';

export function createTuiCommand(deps: ProgramDeps): Command {
    return new Command('tui')
        .description('🖥️ Launch Terminal UI (Đã chuyển đổi sang only-one ui)')
        .helpOption('-h, --help', 'display help for command')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one ui')}                               # Chạy Dashboard hiện đại\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('Giao diện TUI cũ đã được chuyển đổi thành UI Dashboard hiện đại.')}`,
        )
        .action(async () => {
            deps.stdout(
                COLORS.cli.header('\nℹ️ Giao diện TUI terminal đã được chuyển đổi thành Dashboard hiện đại.\n') +
                    COLORS.dim('   Vui lòng sử dụng lệnh: ') +
                    COLORS.cli.command('only-one ui') +
                    COLORS.dim(' để mở giao diện quản lý.\n'),
            );
        });
}
