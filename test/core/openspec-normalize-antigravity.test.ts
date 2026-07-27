import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { normalizeOpenSpecAntigravityOutput } from '@/core/openspec/normalize-antigravity.js';

const roots: string[] = [];
const project = async (): Promise<string> => {
    const root = await mkdtemp(join(tmpdir(), 'only-one-openspec-'));
    roots.push(root);
    return root;
};
const put = async (root: string, path: string, content: string): Promise<void> => {
    const target = join(root, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content);
};
afterEach(async () => Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))));

describe('normalizeOpenSpecAntigravityOutput', () => {
    it('merges OpenSpec skills and workflows into canonical .agents paths', async () => {
        const root = await project();
        await put(root, '.agent/skills/openspec-propose/SKILL.md', 'new skill');
        await put(root, '.agent/workflows/opsx-propose.md', 'new workflow');
        await normalizeOpenSpecAntigravityOutput(root);
        expect(await readFile(join(root, '.agents/skills/openspec-propose/SKILL.md'), 'utf8')).toBe('new skill');
        expect(await readFile(join(root, '.agents/workflows/opsx-propose.md'), 'utf8')).toBe('new workflow');
        expect(existsSync(join(root, '.agent'))).toBe(false);
    });

    it('preserves unrelated canonical files and refreshes collisions', async () => {
        const root = await project();
        await put(root, '.agents/skills/custom/SKILL.md', 'custom');
        await put(root, '.agents/skills/openspec-propose/SKILL.md', 'old');
        await put(root, '.agent/skills/openspec-propose/SKILL.md', 'new');
        await normalizeOpenSpecAntigravityOutput(root);
        expect(await readFile(join(root, '.agents/skills/custom/SKILL.md'), 'utf8')).toBe('custom');
        expect(await readFile(join(root, '.agents/skills/openspec-propose/SKILL.md'), 'utf8')).toBe('new');
    });

    it('keeps unknown .agent content while removing migrated directories', async () => {
        const root = await project();
        await put(root, '.agent/skills/openspec-propose/SKILL.md', 'skill');
        await put(root, '.agent/keep.txt', 'keep');
        await normalizeOpenSpecAntigravityOutput(root);
        expect(await readFile(join(root, '.agent/keep.txt'), 'utf8')).toBe('keep');
        expect(existsSync(join(root, '.agent/skills'))).toBe(false);
    });
});
