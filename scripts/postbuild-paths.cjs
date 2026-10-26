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

            if (content.includes("'@/") || content.includes('"@/')) {
                const rel = relative(dir, join(distDir, 'src'));
                const prefix = rel ? rel.split(sep).join('/') + '/' : './';
                cleaned = cleaned
                    .replaceAll(/from '@\//g, "from '" + prefix)
                    .replaceAll(/from "@\//g, 'from "' + prefix)
                    .replaceAll(/import\('@\//g, "import('" + prefix)
                    .replaceAll(/import\("@\//g, 'import("' + prefix);
                needsWrite = true;
            }

            const hasAssetsAlias =
                content.includes('@assets/') ||
                content.includes('@agents/') ||
                content.includes('@devenv/') ||
                content.includes('@templates/');

            if (hasAssetsAlias) {
                const relToAssets = relative(dir, join(distDir, 'assets'));
                const prefixAssets = relToAssets.split(sep).join('/');
                const prefix = prefixAssets.startsWith('.') ? prefixAssets + '/' : './' + prefixAssets + '/';

                const domainMappings = [
                    ['@assets/skills/', prefix + 'agents/skills/'],
                    ['@assets/rules/', prefix + 'agents/rules/'],
                    ['@assets/mcps/', prefix + 'agents/mcps/'],
                    ['@assets/packages/', prefix + 'agents/packages/'],
                    ['@assets/combos/', prefix + 'agents/combos/'],
                    ['@assets/hooks/', prefix + 'agents/hooks/'],
                    ['@assets/vs/', prefix + 'devenv/editor/'],
                    ['@assets/git/', prefix + 'devenv/shell/'],
                    ['@assets/configs/', prefix + 'templates/configs/'],
                    ['@assets/ignore/', prefix + 'templates/ignore/'],
                    ['@assets/agents/', prefix + 'agents/'],
                    ['@assets/devenv/', prefix + 'devenv/'],
                    ['@assets/templates/', prefix + 'templates/'],
                    ['@agents/', prefix + 'agents/'],
                    ['@devenv/', prefix + 'devenv/'],
                    ['@templates/', prefix + 'templates/'],
                    ['@assets/', prefix],
                ];

                for (const [alias, target] of domainMappings) {
                    cleaned = cleaned
                        .replaceAll("from '" + alias, "from '" + target)
                        .replaceAll('from "' + alias, 'from "' + target)
                        .replaceAll("import('" + alias, "import('" + target)
                        .replaceAll('import("' + alias, 'import("' + target);
                }
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
