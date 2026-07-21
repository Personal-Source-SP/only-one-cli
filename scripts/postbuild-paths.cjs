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
            let cleaned = content;
            let needsWrite = false;

            if (content.includes("from '@/") || content.includes('from "@/')) {
                const rel = relative(dir, join(distDir, 'src'));
                const prefix = rel ? rel.split(sep).join('/') + '/' : './';
                cleaned = cleaned
                    .replaceAll(/from '@\//g, "from '" + prefix)
                    .replaceAll(/from "@\//g, 'from "' + prefix);
                needsWrite = true;
            }

            if (content.includes("from '@assets/") || content.includes('from "@assets/')) {
                const relToAssets = relative(dir, join(distDir, 'assets'));
                const prefixAssets = relToAssets.split(sep).join('/');
                const prefix = prefixAssets.startsWith('.') ? prefixAssets + '/' : './' + prefixAssets + '/';
                cleaned = cleaned
                    .replaceAll(/from '@assets\//g, "from '" + prefix)
                    .replaceAll(/from "@assets\//g, 'from "' + prefix);
                needsWrite = true;
            }

            if (needsWrite) {
                writeFileSync(fullPath, cleaned);
            }
        }
    }
}

const distDir = join(__dirname, '..', 'dist');
if (existsSync(distDir)) {
    replaceInDir(distDir);
}
