import { describe, expect, it } from 'vitest';
import { DEFAULT_GLOBAL_CONFIG } from '../../src/ui/types/config.js';
import { buildHerdrDispatchPlan } from '../../src/ui/services/herdrService.js';
import type { HerdrAgent, TaskModel } from '../../src/ui/types/task.js';

describe('Herdr Settings & Routing', () => {
    const mockTask: TaskModel = {
        slug: 'test-routing-task',
        folderPath: '/mock/path',
        status: 'concept',
        title: 'Test Routing',
        docs: [],
        activeDocIndex: 0,
    };

    it('phải áp dụng chính xác agentRouting khi cấu hình thay đổi', () => {
        const customConfig = {
            ...DEFAULT_GLOBAL_CONFIG,
            agentRouting: {
                ...DEFAULT_GLOBAL_CONFIG.agentRouting,
                concept: 'custom-herdr-agent',
            },
        };

        const plan = buildHerdrDispatchPlan(mockTask, 'concept', customConfig, '/test/cwd');
        expect(plan.targetAgent).toBe('custom-herdr-agent');
        expect(plan.agentStartCommand).toContain('--kind custom-herdr-agent');
    });

    it('phải tạo định danh duy nhất kèm pane_id cho từng Herdr agent', () => {
        const mockAgents: HerdrAgent[] = [
            { pane_id: 'w4:p1', agent: 'agy', agent_status: 'idle' },
            { pane_id: 'w4:p4', agent: 'agy', agent_status: 'idle' },
        ];

        const dynamicOptions = mockAgents.map((a) => (a.pane_id ? `${a.pane_id} (${a.agent})` : a.agent));

        expect(dynamicOptions).toHaveLength(2);
        expect(dynamicOptions[0]).toBe('w4:p1 (agy)');
        expect(dynamicOptions[1]).toBe('w4:p4 (agy)');
        expect(dynamicOptions[0]).not.toBe(dynamicOptions[1]);
    });
});
