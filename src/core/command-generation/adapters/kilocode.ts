/** Ported from open-spec-source command-generation/adapters/kilocode.ts */

import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '../types.js';

/**
 * Kilo Code adapter for command generation.
 * File path: .kilocode/workflows/opsx-<id>.md
 * Format: Plain markdown without frontmatter
 */
export const kilocodeCommandAdapter: ToolCommandAdapter = {
    toolId: 'kilocode',

    getFilePath(commandId: string): string {
        return join('.kilocode', 'workflows', `opsx-${commandId}.md`);
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
        return `${content.body}
`;
    },
};
