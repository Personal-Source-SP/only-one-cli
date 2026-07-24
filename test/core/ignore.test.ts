import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { IgnoreTarget, resolveIgnoreTemplatePath } from '@/core/ignore/index.js';

describe('resolveIgnoreTemplatePath', () => {
    it('resolves templates from package root when module runs under dist', async () => {
        const packageRoot = await mkdtemp(join(tmpdir(), 'only-one-ignore-'));
        const modulePath = join(packageRoot, 'dist', 'src', 'core', 'ignore', 'index.js');
        const templatePath = join(packageRoot, 'assets', 'ignore', 'git.ignore');

        await mkdir(join(packageRoot, 'dist', 'src', 'core', 'ignore'), { recursive: true });
        await mkdir(join(packageRoot, 'assets', 'ignore'), { recursive: true });
        await writeFile(join(packageRoot, 'package.json'), '{}', 'utf8');
        await writeFile(templatePath, '.agents\n', 'utf8');

        expect(resolveIgnoreTemplatePath(pathToFileURL(modulePath).href, IgnoreTarget.Git)).toBe(templatePath);
    });
});
