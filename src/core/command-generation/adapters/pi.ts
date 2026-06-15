/** Ported from open-spec-source command-generation/adapters/pi.ts */

import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '../types.js';
import { transformToHyphenCommands } from '../../../utils/command-references.js';

const PI_INPUT_HEADING = /^\*\*Input\*\*:[^\n]*$/m;

function injectPiArgs(body: string): string {
    if (body.includes('$@') || body.includes('$ARGUMENTS')) {
        return body;
    }

    return body.replace(PI_INPUT_HEADING, (heading) => `${heading}\n**Provided arguments**: $@`);
}

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
 * Pi adapter for prompt template generation.
 * File path: .pi/prompts/opsx-<id>.md
 * Frontmatter: description
 *
 * Pi uses the filename (minus .md) as the slash command name, so
 * opsx-propose.md → /opsx-propose. Command references in the body
 * are transformed from /opsx: to /opsx- for consistency.
 */
export const piCommandAdapter: ToolCommandAdapter = {
    toolId: 'pi',

    getFilePath(commandId: string): string {
        return join('.pi', 'prompts', `opsx-${commandId}.md`);
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
        // Transform /opsx: references to /opsx- and inject $@ for template args
        const transformedBody = transformToHyphenCommands(content.body);

        return `---
description: ${escapeYamlValue(content.description)}
---

${injectPiArgs(transformedBody)}
`;
    },
};
