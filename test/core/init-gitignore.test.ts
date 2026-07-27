import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { updateGitignore } from '@/core/init/gitignore.js';

const roots: string[] = [];
afterEach(async () => Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))));

describe('updateGitignore', () => {
    it('writes OpenSpec directories with trailing slashes only', async () => {
        const root = await mkdtemp(join(tmpdir(), 'only-one-gitignore-'));
        roots.push(root);
        await updateGitignore(root, []);
        const lines = (await readFile(join(root, '.gitignore'), 'utf8')).split(/\r?\n/);
        expect(lines).toContain('adr/');
        expect(lines).toContain('openspec/');
        expect(lines).not.toContain('adr');
        expect(lines).not.toContain('openspec');
    });

    it('does not add slashless duplicates when directory patterns already exist', async () => {
        const root = await mkdtemp(join(tmpdir(), 'only-one-gitignore-'));
        roots.push(root);
        await writeFile(join(root, '.gitignore'), 'adr/\nopenspec/\n', 'utf8');
        await updateGitignore(root, []);
        const content = await readFile(join(root, '.gitignore'), 'utf8');
        expect(content.match(/^adr\/?$/gm)).toHaveLength(1);
        expect(content.match(/^openspec\/?$/gm)).toHaveLength(1);
    });
});
