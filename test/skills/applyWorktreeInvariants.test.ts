import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { lintSkill } from '../../assets/agents/skills/only-one-evolve/scripts/lint-skill.js';

describe('only-one-apply Worktree Dual-Engine Invariants', () => {
    const skillPath = path.resolve(process.cwd(), 'assets/agents/skills/only-one-apply/SKILL.md');

    it('tồn tại file assets/agents/skills/only-one-apply/SKILL.md', () => {
        expect(fs.existsSync(skillPath)).toBe(true);
    });

    it('chứa định nghĩa chế độ Dual-Engine và Worktree Mode', () => {
        const content = fs.readFileSync(skillPath, 'utf8');
        expect(content).toContain('Step 0 — Khởi tạo Chế độ Thực thi');
        expect(content).toContain('Worktree Mode');
        expect(content).toContain('Rebase-First Guard');
    });

    it('đáp ứng tiêu chuẩn độ dài câu ASD-STE100 qua lintSkill', () => {
        const content = fs.readFileSync(skillPath, 'utf8');
        const result = lintSkill(content);
        expect(result.valid).toBe(true);
    });
});
