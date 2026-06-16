/** Ported from open-spec-source command-generation/adapters/roocode.ts */

import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '@/core/command-generation/types.js';

/**
 * RooCode adapter for command generation.
 * File path: .roo/commands/opsx-<id>.md
 * Format: Markdown header with description
 */
export const roocodeCommandAdapter: ToolCommandAdapter = {
    toolId: 'roocode',

    getFilePath(commandId: string): string {
        return join('.roo', 'commands', `opsx-${commandId}.md`);
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
        return `# ${content.name}

${content.description}

${content.body}
`;
    },
};
