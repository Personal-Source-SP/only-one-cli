/** Ported from open-spec-source command-generation/adapters/continue.ts */

import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '@/core/command-generation/types.js';

/**
 * Continue adapter for command generation.
 * File path: .continue/prompts/opsx-<id>.prompt
 * Frontmatter: name, description, invokable
 */
export const continueCommandAdapter: ToolCommandAdapter = {
    toolId: 'continue',

    getFilePath(commandId: string): string {
        return join('.continue', 'prompts', `opsx-${commandId}.prompt`);
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
name: opsx-${content.id}
description: ${content.description}
invokable: true
---

${content.body}
`;
    },
};
