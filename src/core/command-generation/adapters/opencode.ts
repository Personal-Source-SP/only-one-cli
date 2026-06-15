/** Ported from open-spec-source command-generation/adapters/opencode.ts */

import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '../types.js';
import { transformToHyphenCommands } from '../../../utils/command-references.js';

/**
 * OpenCode adapter for command generation.
 * File path: .opencode/commands/opsx-<id>.md
 * Frontmatter: description
 */
export const opencodeCommandAdapter: ToolCommandAdapter = {
    toolId: 'opencode',

    getFilePath(commandId: string): string {
        return join('.opencode', 'commands', `opsx-${commandId}.md`);
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
        // Transform command references from colon to hyphen format for OpenCode
        const transformedBody = transformToHyphenCommands(content.body);

        return `---
description: ${content.description}
---

${transformedBody}
`;
    },
};
