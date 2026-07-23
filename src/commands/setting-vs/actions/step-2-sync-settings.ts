import { homedir } from 'node:os';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { syncVsSettings, type VsEditorId } from '@/core/vs/index.js';
import { resolveVsPlatform } from '@/utils/index.js';
import type { SettingVsCommandOptions } from '../types.js';

export const syncSettingsStep = async (deps: ProgramDeps, editorIds: VsEditorId[], options: SettingVsCommandOptions): Promise<void> => {
    const result = await syncVsSettings({
        cwd: deps.cwd,
        editorIds,
        homeDir: homedir(),
        platform: resolveVsPlatform(),
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
        if (!newKeysEntries.length && !changedKeysEntries.length) {
            deps.stdout(COLORS.dim(`  No changes.`));
        }
    }
};
