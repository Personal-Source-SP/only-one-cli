import { homedir, platform } from 'node:os';
import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { parseVsEditorIds, syncVsSettings, vsEditors, VsPlatform, type VsEditorId } from '@/core/vs/index.js';

import { COLORS } from '@/constants/index.js';

interface SettingVsOptions {
    editors?: string;
    force?: boolean;
}

const resolvePlatform = (): VsPlatform => {
    const current = platform();
    if (current === 'win32') return VsPlatform.Win32;
    return VsPlatform.Darwin;
};

const selectEditors = async (deps: ProgramDeps, options: SettingVsOptions): Promise<VsEditorId[]> => {
    const parsed = parseVsEditorIds(options.editors);
    if (parsed.length) return parsed;
    if (deps.prompts?.checkbox) {
        return deps.prompts.checkbox({
            message: 'Select editors to sync settings',
            choices: vsEditors.map((editor) => ({ name: editor.name, value: editor.id, checked: true })),
        });
    }
    return vsEditors.map((editor) => editor.id);
};

export const createSettingVsCommand = (deps: ProgramDeps): Command => {
    const cmd = new Command('setting-vs')
        .description('⚙️  Merge VS Code editor configurations')
        .helpOption('-h, --help', 'display help for command')
        .option('--editors <ids>', 'Comma-separated list of editor identifiers to sync (choices: vscode, cursor, antigravity)')
        .option('--force', 'Force overwrite settings, bypassing merging', false)
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one setting-vs')}\n` +
                `  ${COLORS.cli.command('$ only-one setting-vs --editors vscode,cursor')}\n` +
                `  ${COLORS.cli.command('$ only-one setting-vs --force')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('If no --editors option is provided, an interactive prompt will allow you to select which editors to sync (if supported by terminal).')}\n` +
                `  - ${COLORS.dim('Modifies the global user settings.json of the selected editor applications on your OS.')}`,
        );

    cmd.action(async (options: SettingVsOptions) => {
        const editorIds = await selectEditors(deps, options);
        const result = await syncVsSettings({
            cwd: deps.cwd,
            editorIds,
            homeDir: homedir(),
            platform: resolvePlatform(),
            write: deps.stdout,
            force: options.force,
        });

        deps.stdout(COLORS.cli.header('\nSync Summary:'));
        for (const res of result.results) {
            deps.stdout(COLORS.secondary(`${res.editorName}:`));
            const newKeysEntries = Object.entries(res.newKeys);
            if (newKeysEntries.length > 0) {
                deps.stdout(COLORS.success(`  New fields:`));
                for (const [key, val] of newKeysEntries) {
                    deps.stdout(`    - ${COLORS.cli.option(key)} (value: ${COLORS.dim(JSON.stringify(val))})`);
                }
            }
            const changedKeysEntries = Object.entries(res.changedKeys);
            if (changedKeysEntries.length > 0) {
                deps.stdout(COLORS.warning(`  Changed fields:`));
                for (const [key, change] of changedKeysEntries) {
                    deps.stdout(
                        `    - ${COLORS.cli.option(key)} (${COLORS.dim(JSON.stringify(change.old))} -> ${COLORS.warning(JSON.stringify(change.new))})`,
                    );
                }
            }
            if (newKeysEntries.length === 0 && changedKeysEntries.length === 0) {
                deps.stdout(COLORS.dim(`  No changes.`));
            }
        }
    });

    return cmd;
};
