import { describe, expect, it } from 'vitest';
import { PLUGINS } from '@assets/plugins/index.js';
import type { PluginManifest } from '@assets/types.js';
import { AllowedToolId } from '@/constants/allowed-tools.js';

describe('Plugin Registry Model (Task 1.1)', () => {
    it('all plugin manifest entries have stable IDs, descriptions, and supported targets', () => {
        expect(PLUGINS.length).toBeGreaterThan(0);
        const ids = new Set<string>();

        for (const plugin of PLUGINS) {
            expect(plugin.id).toBeDefined();
            expect(typeof plugin.id).toBe('string');
            expect(ids.has(plugin.id)).toBe(false);
            ids.add(plugin.id);

            expect(plugin.description).toBeDefined();
            expect(plugin.supportedTargets.length).toBeGreaterThan(0);

            for (const targetId of plugin.supportedTargets) {
                expect(Object.values(AllowedToolId)).toContain(targetId);
                const action = plugin.actions[targetId];
                expect(action).toBeDefined();
                expect(['command', 'manual']).toContain(action.type);
                if (action.type === 'command') {
                    expect(typeof action.executable).toBe('string');
                } else {
                    expect(typeof action.instruction).toBe('string');
                }
            }
        }
    });

    it('Superpowers exists in plugin registry with correct target actions', () => {
        const superpowers = PLUGINS.find((p) => p.id === 'superpowers');
        expect(superpowers).toBeDefined();
        expect(superpowers?.supportedTargets).toEqual([
            AllowedToolId.Antigravity,
            AllowedToolId.Claude,
            AllowedToolId.Cursor,
            AllowedToolId.Codex,
        ]);
        expect(superpowers?.actions[AllowedToolId.Antigravity]).toEqual({
            type: 'command',
            executable: 'agy',
            args: ['plugin', 'install', 'https://github.com/obra/superpowers'],
        });
        expect(superpowers?.actions[AllowedToolId.Claude]).toEqual({
            type: 'manual',
            instruction: 'Run `/plugin install superpowers@claude-plugins-official` in Claude Code',
        });
    });
});
