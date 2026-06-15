/** Ported from open-spec-source command-generation/adapters/junie.ts */

import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '../types.js';

/**
 * Junie adapter for command generation.
 * File path: .junie/commands/opsx-<id>.md
 * Frontmatter: description
 */
export const junieCommandAdapter: ToolCommandAdapter = {
    toolId: 'junie',

    getFilePath(commandId: string): string {
        return join('.junie', 'commands', `opsx-${commandId}.md`);
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
        return `---
description: ${content.description}
---

${content.body}
`;
    },
};
