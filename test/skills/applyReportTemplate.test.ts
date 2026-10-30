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

        // Khối tổng quan và chi tiết thu gọn
        expect(content).toContain('<summary>📂 Chi tiết tệp tin thay đổi (Click để mở rộng)</summary>');
        expect(content).toContain('<summary>🧪 Chi tiết kiểm thử (Click để mở rộng)</summary>');
        expect(content).toContain('💬 **Cổng cải tiến (only-one-evolve)**:');

        // Loại bỏ hoàn toàn các mục dài dòng cũ và Bước tiếp theo
        expect(content).not.toContain('### 1. Cấu trúc source thay đổi');
        expect(content).not.toContain('### 2. Các công việc đã xử lý');
        expect(content).not.toContain('### 4. Bước tiếp theo');

        // Đường dẫn script chính xác
        expect(content).toContain('assets/agents/skills/only-one-apply/scripts/record-improvement.ts');
        expect(content).toContain('assets/agents/skills/only-one-apply/scripts/plan-status.ts');
    });

    it('đáp ứng tiêu chuẩn độ dài câu ASD-STE100 qua lintSkill', () => {
        const content = fs.readFileSync(skillPath, 'utf8');
        const result = lintSkill(content);
        expect(result.valid).toBe(true);
    });
});
