import { describe, expect, it } from 'vitest';

import { resolveWorktreePath } from '../../assets/agents/skills/only-one-apply/scripts/worktree-runner.js';

describe('Worktree Runner Invariants', () => {
    it('tính toán chính xác đường dẫn worktree theo slug', () => {
        const fakeRoot = 'd:/workspace/project';
        const slug = 'feature-auth';
        const expectedPath = resolveWorktreePath(fakeRoot, slug);
        expect(expectedPath.replace(/\\/g, '/')).toContain('.worktrees/feature-auth');
    });
});
