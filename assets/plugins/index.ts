import { AllowedToolId } from '@/constants/allowed-tools.js';
import type { PluginManifest } from '../types.js';

export const PLUGINS: PluginManifest[] = [
    {
        id: 'superpowers',
        description: 'Superpowers — agentic software design and workflow framework',
        supportedTargets: [
            AllowedToolId.Antigravity,
            AllowedToolId.Claude,
            AllowedToolId.Cursor,
            AllowedToolId.Codex,
        ],
        actions: {
            [AllowedToolId.Antigravity]: {
                type: 'command',
                executable: 'agy',
                args: ['plugin', 'install', 'https://github.com/obra/superpowers'],
            },
            [AllowedToolId.Claude]: {
                type: 'manual',
                instruction: 'Run `/plugin install superpowers@claude-plugins-official` in Claude Code',
            },
            [AllowedToolId.Cursor]: {
                type: 'manual',
                instruction: 'Run `/add-plugin superpowers` in Cursor',
            },
            [AllowedToolId.Codex]: {
                type: 'manual',
                instruction: 'Open `/plugins`, search `superpowers`, and choose `Install Plugin` in Codex',
            },
        },
    },
];
