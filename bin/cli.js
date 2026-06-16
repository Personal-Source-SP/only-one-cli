#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

// Resolve to real path (in case of npm link symlink)
const __filename = realpathSync(fileURLToPath(import.meta.url));
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

// Force cwd to project root so tsx finds the right tsconfig.json for @/* aliases
process.chdir(root);

// Bypass isCliEntrypoint guard in src/index.ts (wrapper argv doesn't match .ts file)
process.env.ONLY_ONE_CLI_BYPASS_ENTRYPOINT_CHECK = '1';

// Use project-local tsx (devDependency, not installed globally)
const localRequire = createRequire(resolve(root, 'package.json'));
const tsxPath = localRequire.resolve('tsx/esm');

await import(tsxPath);
await import(resolve(root, 'src', 'index.ts'));
