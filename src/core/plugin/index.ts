import type { ProgramDeps } from '@/cli/deps.js';
import { AllowedToolId } from '@/constants/allowed-tools.js';
import { PLUGINS } from '@assets/plugins/index.js';
import type { PluginManifest, TargetAction } from '@assets/types.js';

export interface PluginActionResult {
    installed: string[];
    actionRequired: string[];
    skipped: string[];
    failed: string[];
}

export interface ExecutePluginActionsOptions {
    deps: ProgramDeps;
    projectDir: string;
    pluginManifests?: PluginManifest[];
    selectedPluginIds: string[];
    targetIds: AllowedToolId[];
    perTargetPluginIds?: Record<string, string[]>;
    execFileAsync?: (file: string, args: string[], options: any) => Promise<{ stdout: string; stderr: string }>;
}

export const executePluginActions = async (
    options: ExecutePluginActionsOptions,
): Promise<{
    installedPlugins: string[];
    summary: PluginActionResult;
}> => {
    const { deps, projectDir, pluginManifests = PLUGINS, selectedPluginIds, targetIds } = options;

    const selectedManifests = selectedPluginIds
        .map((id) => pluginManifests.find((m) => m.id === id))
        .filter((m): m is PluginManifest => m !== undefined);

    const installed: string[] = [];
    const actionRequired: string[] = [];
    const skipped: string[] = [];
    const failed: string[] = [];

    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const runExecFile = options.execFileAsync ?? promisify(execFile);

    for (const plugin of selectedManifests) {
        deps.stdout(`  Configuring plugin ${plugin.id}...`);
        for (const targetId of targetIds) {
            if (options.perTargetPluginIds && !options.perTargetPluginIds[targetId]?.includes(plugin.id)) {
                continue;
            }
            if (!plugin.supportedTargets.includes(targetId)) {
                skipped.push(`${plugin.id} (${targetId})`);
                deps.stdout(`    - ${targetId}: skipped (unsupported target)`);
                continue;
            }

            const action = plugin.actions[targetId];
            if (!action) {
                skipped.push(`${plugin.id} (${targetId})`);
                continue;
            }

            if (action.type === 'command') {
                deps.stdout(`    Executing command for ${targetId}: ${action.executable} ${(action.args || []).join(' ')}`);
                try {
                    await runExecFile(action.executable, action.args || [], { cwd: projectDir, shell: true });
                    installed.push(`${plugin.id}:${targetId}`);
                    deps.stdout(`      ✓ Successfully installed ${plugin.id} for ${targetId}`);
                } catch (error) {
                    failed.push(`${plugin.id}:${targetId}`);
                    const msg = error instanceof Error ? error.message : String(error);
                    deps.stdout(`      ✗ Command execution failed for ${targetId}: ${msg}`);
                }
            } else if (action.type === 'manual') {
                actionRequired.push(`${plugin.id} (${targetId})`);
                deps.stdout(`    [Action Required for ${targetId}]: ${action.instruction}`);
                if (action.docUrl) {
                    deps.stdout(`      Documentation: ${action.docUrl}`);
                }
            }
        }
    }

    return {
        installedPlugins: installed,
        summary: { installed, actionRequired, skipped, failed },
    };
};
