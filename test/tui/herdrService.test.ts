import { describe, expect, it } from 'vitest';
import { buildHerdrDispatchPlan, isHerdrSessionActive } from '@/tui/services/herdrService.js';
import { DEFAULT_GLOBAL_CONFIG } from '@/tui/types/config.js';
import type { TaskModel } from '@/tui/types/task.js';

describe('Herdr Service', () => {
    it('nhận diện chính xác biến môi trường HERDR_ENV', () => {
        expect(isHerdrSessionActive({ HERDR_ENV: '1' })).toBe(true);
        expect(isHerdrSessionActive({ HERDR_ENV: '0' })).toBe(false);
        expect(isHerdrSessionActive({})).toBe(false);
    });

    it('xây dựng chính xác các câu lệnh split, start và prompt cho agent', () => {
        const mockTask: TaskModel = {
            slug: 'auth-feature',
            folderPath: '/mock/only-one/tasks/auth-feature',
            status: 'plan',
            title: 'Auth Feature',
            docs: [],
            activeDocIndex: 0,
        };

        const plan = buildHerdrDispatchPlan(mockTask, 'plan', DEFAULT_GLOBAL_CONFIG, '/my/workspace');

        expect(plan.splitCommand).toContain('herdr pane split');
        expect(plan.splitCommand).toContain('--direction right');
        expect(plan.splitCommand).toContain('--no-focus');
        expect(plan.splitCommand).toContain('/my/workspace');

        expect(plan.agentStartCommand).toContain('herdr agent start agy-authfeature --kind antigravity');
        expect(plan.agentPromptCommand).toContain('herdr agent prompt agy-authfeature');
        expect(plan.agentPromptCommand).toContain('/only-one-plan only-one/tasks/auth-feature');
    });
});
