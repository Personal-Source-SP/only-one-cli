/** Ported from open-spec-source command-generation/adapters/kiro.ts */

import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '@/core/command-generation/types.js';

/**
 * Kiro adapter for command generation.
 * File path: .kiro/prompts/opsx-<id>.prompt.md
 * Frontmatter: description
 */
export const kiroCommandAdapter: ToolCommandAdapter = {
    toolId: 'kiro',

    getFilePath(commandId: string): string {
        return join('.kiro', 'prompts', `opsx-${commandId}.prompt.md`);
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
