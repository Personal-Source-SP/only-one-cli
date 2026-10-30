import fs from 'node:fs';
import path from 'node:path';

import { lintSkill } from '@assets/skills/only-one-evolve/scripts/lint-skill.js';
import { describe, expect, it } from 'vitest';

describe('only-one-apply Concise Report Template Invariants', () => {
    const skillPath = path.resolve(process.cwd(), 'assets/agents/skills/only-one-apply/SKILL.md');

    it('tồn tại file assets/agents/skills/only-one-apply/SKILL.md', () => {
        expect(fs.existsSync(skillPath)).toBe(true);
    });

    it('chứa mẫu báo cáo tinh gọn bằng tiếng Việt', () => {
        const content = fs.readFileSync(skillPath, 'utf8');

        // 1. Cấu trúc source thay đổi
        expect(content).toContain('1. Cấu trúc source thay đổi');

        // 2. Các công việc đã xử lý
        expect(content).toContain('2. Các công việc đã xử lý');

        // 3. Nghiệm thu & Kiểm thử
        expect(content).toContain('3. Nghiệm thu & Kiểm thử');

        // 4. Bước tiếp theo
        expect(content).toContain('4. Bước tiếp theo');
    });

    it('đáp ứng tiêu chuẩn độ dài câu ASD-STE100 qua lintSkill', () => {
        const content = fs.readFileSync(skillPath, 'utf8');
        const result = lintSkill(content);
        expect(result.valid).toBe(true);
    });
});
