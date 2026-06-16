/**
 * Convert relative imports (../*) in src/ and libraries/ to @/ alias.
 * Usage: node scripts/fix-imports.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = join(ROOT, 'src');
const LIBS = join(ROOT, 'libraries');
const ALIAS = '@/';
const LIB_ALIAS = '@library/';

const IMPORT_RE = /(?<=from\s+['"])\.\.\/[^'"]+(?=['"])/g;

async function* walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules') {
            yield* walk(full);
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
            yield full;
        }
    }
}

function resolveRelative(filePath, importPath) {
    return resolve(dirname(filePath), importPath);
}

function toAlias(absolutePath, originalImport) {
    const ext = originalImport.match(/\.\w+$/)?.[0] || '';
    if (absolutePath.startsWith(SRC + '/')) {
        const rel = relative(SRC, absolutePath);
        return ALIAS + rel.replace(/\.(js|ts)$/, ext === '.js' ? '.js' : '');
    }
    if (absolutePath.startsWith(LIBS + '/')) {
        const rel = relative(LIBS, absolutePath);
        return LIB_ALIAS + rel.replace(/\.(js|ts)$/, ext === '.js' ? '.js' : '');
    }
    return null; // outside src/libraries — leave as is
}

async function main() {
    const allFiles = [];
    for await (const f of walk(SRC)) allFiles.push(f);
    for await (const f of walk(LIBS)) allFiles.push(f);

    let changed = 0;
    let totalChanges = 0;

    for (const filePath of allFiles) {
        const content = readFileSync(filePath, 'utf-8');
        const newContent = content.replace(IMPORT_RE, (match) => {
            const resolved = resolveRelative(filePath, match);
            const alias = toAlias(resolved, match);
            if (alias) {
                return alias;
            }
            return match; // keep unchanged
        });

        if (newContent !== content) {
            writeFileSync(filePath, newContent, 'utf-8');
            changed++;
            totalChanges += countChanges(content, newContent);
            console.log(`✓ ${relative(ROOT, filePath)}`);
        }
    }

    console.log(`\nDone. ${changed} files modified, ${totalChanges} imports converted.`);
}

function countChanges(oldContent, newContent) {
    const oldImports = oldContent.match(IMPORT_RE) || [];
    const newImports = newContent.match(IMPORT_RE) || [];
    return oldImports.length - newImports.length;
}

main().catch(console.error);
