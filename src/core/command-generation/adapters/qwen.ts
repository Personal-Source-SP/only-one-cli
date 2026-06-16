/** Ported from open-spec-source command-generation/adapters/qwen.ts */

import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '@/core/command-generation/types.js';

/**
 * Qwen adapter for command generation.
 * File path: .qwen/commands/opsx-<id>.toml
 * Format: TOML with description and prompt fields
 */
export const qwenCommandAdapter: ToolCommandAdapter = {
    toolId: 'qwen',

    getFilePath(commandId: string): string {
        return join('.qwen', 'commands', `opsx-${commandId}.toml`);
    },

    getInvokeLabel(commandId: string): string {
        const filePath = this.getFilePath(commandId);
        if (filePath.startsWith('/') || /^[A-Za-z]:\\/.test(filePath)) {
            return filePath;
        }
        if (this.toolId === 'cursor') {
            return `/${commandId}`;
        }
        return filePath.replace(/\/opsx\//g, '/').replace(new RegExp(`opsx-${commandId}`, 'g'), commandId);
    },

    formatFile(content: CommandContent): string {
        return `description = "${content.description}"

prompt = """
${content.body}
"""
`;
    },
};
