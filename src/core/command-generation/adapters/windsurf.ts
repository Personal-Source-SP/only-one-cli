/** Ported from open-spec-source command-generation/adapters/windsurf.ts */

import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '@/core/command-generation/types.js';

/**
 * Escapes a string value for safe YAML output.
 * Quotes the string if it contains special YAML characters.
 */
function escapeYamlValue(value: string): string {
    // Check if value needs quoting (contains special YAML characters or starts/ends with whitespace)
    const needsQuoting = /[:\n\r#{}[\],&*!|>'"%@`]|^\s|\s$/.test(value);
    if (needsQuoting) {
        // Use double quotes and escape internal double quotes and backslashes
        const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
        return `"${escaped}"`;
    }
    return value;
}

/**
 * Formats a tags array as a YAML array with proper escaping.
 */
function formatTagsArray(tags: string[]): string {
    const escapedTags = tags.map((tag) => escapeYamlValue(tag));
    return `[${escapedTags.join(', ')}]`;
}

/**
 * Windsurf adapter for command generation.
 * File path: .windsurf/workflows/opsx-<id>.md
 * Frontmatter: name, description, category, tags
 */
export const windsurfCommandAdapter: ToolCommandAdapter = {
    toolId: 'windsurf',

    getFilePath(commandId: string): string {
        return join('.windsurf', 'workflows', `opsx-${commandId}.md`);
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
name: ${escapeYamlValue(content.name)}
description: ${escapeYamlValue(content.description)}
category: ${escapeYamlValue(content.category)}
tags: ${formatTagsArray(content.tags)}
---

${content.body}
`;
    },
};
