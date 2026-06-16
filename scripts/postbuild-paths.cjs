const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join, relative, sep } = require('node:path');

function replaceInDir(dir) {
    const { readdirSync, statSync } = require('node:fs');
    const { join, relative } = require('node:path');

    for (const entry of readdirSync(dir)) {
        const fullPath = join(dir, entry);
        const s = statSync(fullPath);
        if (s.isDirectory()) {
            replaceInDir(fullPath);
        } else if (s.isFile() && entry.endsWith('.js')) {
            const content = readFileSync(fullPath, 'utf-8');
            if (content.includes("from '@/") || content.includes('from "@/')) {
                // Compute relative path from this file to dist/ root
                const rel = relative(dir, distDir);
                const prefix = rel ? rel.split(sep).map(() => '..').join('/') + '/' : './';
                const cleaned = content
                    .replaceAll(/from '@\//g, "from '" + prefix)
                    .replaceAll(/from "@\//g, 'from "' + prefix);
                writeFileSync(fullPath, cleaned);
            }
        }
    }
}

const distDir = join(__dirname, '..', 'dist');
if (existsSync(distDir)) {
    replaceInDir(distDir);
}
