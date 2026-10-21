import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const cliRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            '@src': path.join(cliRoot, 'src'),
            '@assets/skills': path.join(cliRoot, 'assets/agents/skills'),
            '@assets/rules': path.join(cliRoot, 'assets/agents/rules'),
            '@assets/mcps': path.join(cliRoot, 'assets/agents/mcps'),
            '@assets/packages': path.join(cliRoot, 'assets/agents/packages'),
            '@assets/combos': path.join(cliRoot, 'assets/agents/combos'),
            '@assets/hooks': path.join(cliRoot, 'assets/agents/hooks'),
            '@assets/vs': path.join(cliRoot, 'assets/devenv/editor'),
            '@assets/git': path.join(cliRoot, 'assets/devenv/shell'),
            '@assets/eslint-rules': path.join(cliRoot, 'assets/devenv/linter'),
            '@assets/configs': path.join(cliRoot, 'assets/templates/configs'),
            '@assets/ignore': path.join(cliRoot, 'assets/templates/ignore'),
            '@assets': path.join(cliRoot, 'assets'),
            '@agents': path.join(cliRoot, 'assets/agents'),
            '@devenv': path.join(cliRoot, 'assets/devenv'),
            '@templates': path.join(cliRoot, 'assets/templates'),
            '@': path.join(cliRoot, 'src'),
        },
    },
    test: {
        environment: 'node',
        include: ['test/**/*.test.ts'],
        testTimeout: 15000,
    },
});
