import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cliRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(cliRoot, 'src');
const testRoot = path.join(cliRoot, 'test');

const collectTests = (dir, acc = []) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) collectTests(full, acc);
        else if (ent.name.endsWith('.test.ts')) acc.push(full);
    }
    return acc;
};

const toDestPath = (srcPath) => {
    const rel = path.relative(srcRoot, srcPath);
    const parts = rel.split(path.sep);
    const testsIdx = parts.indexOf('__tests__');
    if (testsIdx >= 0) {
        const destParts = [...parts.slice(0, testsIdx), ...parts.slice(testsIdx + 1)];
        return path.join(testRoot, ...destParts);
    }
    throw new Error(`Test not under __tests__: ${srcPath}`);
};

const rewriteSpecifier = (specifier, fromFile) => {
    if (!specifier.startsWith('.')) return specifier;
    const withoutJs = specifier.replace(/\.js$/, '');
    const resolved = path.resolve(path.dirname(fromFile), withoutJs);
    const normalized = path.normalize(resolved);
    if (!normalized.startsWith(srcRoot)) return specifier;
    const rel = path.relative(srcRoot, normalized).split(path.sep).join('/');
    return `@src/${rel}.js`;
};

const rewriteContent = (content, fromFile) => {
    return content
        .replace(/(?:from|import)\s+(['"])(\.[^'"]+)\1/g, (_match, quote, spec) => {
            return `from ${quote}${rewriteSpecifier(spec, fromFile)}${quote}`;
        })
        .replace(/vi\.mock\(\s*(['"])(\.[^'"]+)\1/g, (_match, quote, spec) => {
            return `vi.mock(${quote}${rewriteSpecifier(spec, fromFile)}${quote}`;
        })
        .replace(/import\(\s*(['"])(\.[^'"]+)\1/g, (_match, quote, spec) => {
            return `import(${quote}${rewriteSpecifier(spec, fromFile)}${quote}`;
        });
};

fs.rmSync(testRoot, { recursive: true, force: true });

for (const srcPath of collectTests(srcRoot)) {
    const destPath = toDestPath(srcPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const content = rewriteContent(fs.readFileSync(srcPath, 'utf8'), srcPath);
    fs.writeFileSync(destPath, content);
    fs.unlinkSync(srcPath);
}

const pruneEmpty = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        if (ent.isDirectory()) pruneEmpty(path.join(dir, ent.name));
    }
    if (dir !== srcRoot && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
};

pruneEmpty(srcRoot);

console.log(`Moved tests to ${testRoot}`);
