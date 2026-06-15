/** Ported from open-spec-source command-generation/adapters/qoder.ts */

import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '../types.js';

/**
 * Qoder adapter for command generation.
 * File path: .qoder/commands/opsx/<id>.md
 * Frontmatter: name, description, category, tags
 */
export const qoderCommandAdapter: ToolCommandAdapter = {
    toolId: 'qoder',

    getFilePath(commandId: string): string {
        return join('.qoder', 'commands', 'opsx', `${commandId}.md`);
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
