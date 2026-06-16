/** Ported from open-spec-source command-generation/adapters/amazon-q.ts */

import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '@/core/command-generation/types.js';

/**
 * Amazon Q adapter for command generation.
 * File path: .amazonq/prompts/opsx-<id>.md
 * Frontmatter: description
 */
export const amazonQCommandAdapter: ToolCommandAdapter = {
    toolId: 'amazon-q',

    getFilePath(commandId: string): string {
        return join('.amazonq', 'prompts', `opsx-${commandId}.md`);
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
