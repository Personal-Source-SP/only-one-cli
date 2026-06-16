/** Ported from open-spec-source command-generation/adapters/crush.ts */

import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '@/core/command-generation/types.js';

/**
 * Crush adapter for command generation.
 * File path: .crush/commands/opsx/<id>.md
 * Frontmatter: name, description, category, tags
 */
export const crushCommandAdapter: ToolCommandAdapter = {
    toolId: 'crush',

    getFilePath(commandId: string): string {
        return join('.crush', 'commands', 'opsx', `${commandId}.md`);
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
        const tagsStr = content.tags.join(', ');
        return `---
name: ${content.name}
description: ${content.description}
category: ${content.category}
tags: [${tagsStr}]
---

${content.body}
`;
    },
};
