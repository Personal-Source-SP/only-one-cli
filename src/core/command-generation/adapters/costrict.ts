/** Ported from open-spec-source command-generation/adapters/costrict.ts */

import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '../types.js';

/**
 * CoStrict adapter for command generation.
 * File path: .cospec/openspec/commands/opsx-<id>.md
 * Frontmatter: description, argument-hint
 */
export const costrictCommandAdapter: ToolCommandAdapter = {
    toolId: 'costrict',

    getFilePath(commandId: string): string {
        return join('.cospec', 'openspec', 'commands', `opsx-${commandId}.md`);
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
description: "${content.description}"
argument-hint: command arguments
---

${content.body}
`;
    },
};
