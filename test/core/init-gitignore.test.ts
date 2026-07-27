import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { updateGitignore } from '@/core/init/gitignore.js';

const roots: string[] = [];
afterEach(async () => Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))));

const templatePatterns = ['.agent/', '.agents/', '.claude/', '.cursor/', 'openspec/', '.worktrees/', '.gitnexus/'];

describe('updateGitignore', () => {
    it('creates .gitignore with template sections and no hard-coded entries', async () => {
        const root = await mkdtemp(join(tmpdir(), 'only-one-gitignore-'));
        roots.push(root);

        await updateGitignore(root);

        const content = await readFile(join(root, '.gitignore'), 'utf8');
        expect(content).toBe(
            '# AI project settings\n.agent/\n.agents/\n.claude/\n.cursor/\n\n# Openspec\nopenspec/\n\n# Git worktrees\n.worktrees/\n\n# Git Nexus\n.gitnexus/\n',
        );
        expect(content).not.toContain('adr/');
        expect(content).not.toContain('.gemini/');
    });

    it('merges missing patterns into matching sections without adding equivalent duplicates', async () => {
        const root = await mkdtemp(join(tmpdir(), 'only-one-gitignore-'));
        roots.push(root);
        await writeFile(join(root, '.gitignore'), '# Existing\nnode_modules/\n\n# AI project settings\n.agent\n.cursor/\n', 'utf8');

        await updateGitignore(root);

        const content = await readFile(join(root, '.gitignore'), 'utf8');
        expect(content).toContain('# Existing\nnode_modules/');
        expect(content.match(/^\.agent\/?$/gm)).toHaveLength(1);
        expect(content.match(/^# AI project settings$/gm)).toHaveLength(1);
        for (const pattern of templatePatterns.filter((pattern) => pattern !== '.agent/')) expect(content).toContain(pattern);
        expect(content).not.toContain('unlisted-tool');
    });

    it('does not add a section when all of its patterns already exist elsewhere', async () => {
        const root = await mkdtemp(join(tmpdir(), 'only-one-gitignore-'));
        roots.push(root);
        await writeFile(join(root, '.gitignore'), '.worktrees/\n', 'utf8');

        await updateGitignore(root);

        const content = await readFile(join(root, '.gitignore'), 'utf8');
        expect(content.match(/^\.worktrees\/?$/gm)).toHaveLength(1);
        expect(content).not.toContain('# Git worktrees');
    });

    it('preserves CRLF and is byte-for-byte idempotent', async () => {
        const root = await mkdtemp(join(tmpdir(), 'only-one-gitignore-'));
        roots.push(root);
        await writeFile(join(root, '.gitignore'), 'node_modules/\r\n', 'utf8');

        await updateGitignore(root);
        const first = await readFile(join(root, '.gitignore'), 'utf8');
        await updateGitignore(root);
        const second = await readFile(join(root, '.gitignore'), 'utf8');

        expect(first).toBe(second);
        expect(first.replace(/\r\n/g, '')).not.toContain('\n');
        expect(first.endsWith('\r\n')).toBe(true);
    });
});
