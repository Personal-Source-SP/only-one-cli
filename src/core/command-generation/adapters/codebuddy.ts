/** Ported from open-spec-source command-generation/adapters/codebuddy.ts */

import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '@/core/command-generation/types.js';

/**
 * CodeBuddy adapter for command generation.
 * File path: .codebuddy/commands/opsx/<id>.md
 * Frontmatter: name, description, argument-hint
 */
export const codebuddyCommandAdapter: ToolCommandAdapter = {
    toolId: 'codebuddy',

    getFilePath(commandId: string): string {
        return join('.codebuddy', 'commands', 'opsx', `${commandId}.md`);
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
name: ${content.name}
description: "${content.description}"
argument-hint: "[command arguments]"
---

${content.body}
`;
    },
};
