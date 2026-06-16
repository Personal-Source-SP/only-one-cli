/** Ported from open-spec-source command-generation/adapters/codex.ts */

import os from 'node:os';
import { join, resolve } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '@/core/command-generation/types.js';

/**
 * Returns the Codex home directory.
 * Respects the CODEX_HOME env var, defaulting to ~/.codex.
 */
function getCodexHome(): string {
    const envHome = process.env.CODEX_HOME?.trim();
    return resolve(envHome ? envHome : join(os.homedir(), '.codex'));
}

/**
 * Codex adapter for command generation.
 * File path: <CODEX_HOME>/prompts/opsx-<id>.md (absolute, global)
 * Frontmatter: description, argument-hint
 */
export const codexCommandAdapter: ToolCommandAdapter = {
    toolId: 'codex',

    getFilePath(commandId: string): string {
        return join(getCodexHome(), 'prompts', `opsx-${commandId}.md`);
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
argument-hint: command arguments
---

${content.body}
`;
    },
};
