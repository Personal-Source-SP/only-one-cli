#!/usr/bin/env node
/**
 * Ports OpenSpec command adapters into hybrid-index CLI adapters.
 * Adds getInvokeLabel and normalizes ESM paths.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '../../open-spec-source/src/core/command-generation/adapters');
const destDir = join(__dirname, '../src/core/command-generation/adapters');

const SKIP = new Set(['index.ts', 'cursor.ts']);

const invokeLabelSnippet = `
    getInvokeLabel(commandId: string): string {
        const filePath = this.getFilePath(commandId);
        if (filePath.startsWith('/') || /^[A-Za-z]:\\\\/.test(filePath)) {
            return filePath;
        }
        return filePath;
    },
`;

for (const file of readdirSync(srcDir).filter((f) => f.endsWith('.ts') && !SKIP.has(f))) {
    let content = readFileSync(join(srcDir, file), 'utf-8');
    content = content.replace(
        /^\/\*\*[\s\S]*?\*\/\n\n/,
        '/** Ported from open-spec-source command-generation/adapters/' + file + ' */\n\n',
    );
    content = content.replace(/import path from 'path';/g, "import { join } from 'node:path';");
    content = content.replace(/import os from 'os';/g, "import os from 'node:os';");
    content = content.replace(/\bpath\.join\b/g, 'join');
    content = content.replace(/export const (\w+)Adapter/g, 'export const $1CommandAdapter');
    content = content.replace(/: ToolCommandAdapter = \{(\s+)toolId:/, `: ToolCommandAdapter = {$1toolId:`);

    if (!content.includes('getInvokeLabel')) {
        content = content.replace(/(getFilePath\([^)]+\)[^}]+\},)\s*\n(\s*formatFile)/, `$1\n${invokeLabelSnippet}\n$2`);
    }

    writeFileSync(join(destDir, file), content);
    console.log('ported', file);
}

console.log('done (cursor.ts kept as hybrid-index variant)');
