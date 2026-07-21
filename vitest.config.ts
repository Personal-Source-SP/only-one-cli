import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const cliRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            '@src': path.join(cliRoot, 'src'),
            '@assets': path.join(cliRoot, 'assets'),
            '@': path.join(cliRoot, 'src'),
        },
    },
    test: {
        environment: 'node',
        include: ['test/**/*.test.ts'],
    },
});
