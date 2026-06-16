import { join } from 'node:path';
import type { CommandContent, ToolCommandAdapter } from '@/core/command-generation/types.js';

const escapeYamlValue = (value: string): string => {
    const needsQuoting = /[:\n\r#{}[\],&*!|>'"%@`]|^\s|\s$/.test(value);
    if (needsQuoting) {
        const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
        return `"${escaped}"`;
    }
    return value;
};

export type CursorCommandInput = {
    body: string;
    category: string;
    description: string;
    id: string;
    slashName: string;
};

export const formatCursorCommandFile = (input: CursorCommandInput): string => `---
name: ${input.slashName}
id: ${input.id}
category: ${escapeYamlValue(input.category)}
description: ${escapeYamlValue(input.description)}
---

${input.body}
`;

export const cursorCommandAdapter: ToolCommandAdapter = {
    toolId: 'cursor',

    getFilePath(commandId: string): string {
        return join('.cursor', 'commands', `${commandId}.md`);
    },

    getInvokeLabel(commandId: string): string {
        return `/${commandId}`;
    },

    formatFile(content: CommandContent): string {
        return formatCursorCommandFile({
            body: content.body,
            category: content.category,
            description: content.description,
            id: content.id,
            slashName: `/${content.id}`,
        });
    },
};
