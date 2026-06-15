/** Ported from open-spec-source command-generation/adapters/gemini.ts */

import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '../types.js';

/**
 * Gemini adapter for command generation.
 * File path: .gemini/commands/opsx/<id>.toml
 * Format: TOML with description and prompt fields
 */
export const geminiCommandAdapter: ToolCommandAdapter = {
    toolId: 'gemini',

    getFilePath(commandId: string): string {
        return join('.gemini', 'commands', 'opsx', `${commandId}.toml`);
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
