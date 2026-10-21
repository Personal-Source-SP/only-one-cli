import { describe, expect, it } from 'vitest';
import {
    buildHerdrCleanDispatchPlan,
    buildHerdrDispatchPlan,
    isHerdrSessionActive,
    listHerdrAgents,
    listHerdrPanes,
    waitHerdrAgent,
} from '@/tui/services/herdrService.js';
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

        expect(plan.agentStartCommand).toContain('herdr agent start agy-authfeature --kind agy');
        expect(plan.agentPromptCommand).toContain('herdr agent prompt agy-authfeature');
        expect(plan.agentPromptCommand).toContain('/only-one-plan only-one/tasks/auth-feature');
    });

    it('xây dựng chính xác kế hoạch điều phối clean toàn hệ thống', () => {
        const plan = buildHerdrCleanDispatchPlan(DEFAULT_GLOBAL_CONFIG, '/my/workspace');
        expect(plan.splitCommand).toContain('herdr pane split');
        expect(plan.agentStartCommand).toContain('herdr agent start agy-archivist --kind agy');
        expect(plan.agentPromptCommand).toContain('herdr agent prompt agy-archivist "/only-one-clean"');
    });

    it('trả về mảng rỗng cho listHerdrAgents khi không trong Herdr session', async () => {
        const agents = await listHerdrAgents();
        expect(Array.isArray(agents)).toBe(true);
    });

    it('trả về mảng rỗng cho listHerdrPanes khi không trong Herdr session', async () => {
        const panes = await listHerdrPanes();
        expect(Array.isArray(panes)).toBe(true);
    });

    it('trả về false cho waitHerdrAgent khi không trong Herdr session', async () => {
        const res = await waitHerdrAgent('mock-target', 100);
        expect(typeof res).toBe('boolean');
    });
});
