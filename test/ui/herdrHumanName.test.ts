import { describe, expect, it } from 'vitest';
import { enrichAgentsWithTabLabels } from '../../src/ui/services/herdrService.js';
import type { HerdrAgent } from '../../src/ui/types/task.js';

describe('Herdr Human-Readable Agent Names', () => {
    it('gắn chính xác name từ tab label vào agent', () => {
        const mockAgents: HerdrAgent[] = [
            { pane_id: 'w4:p1', tab_id: 'w4:t1', agent: 'agy', agent_status: 'idle' },
            { pane_id: 'w4:p4', tab_id: 'w4:t3', agent: 'agy', agent_status: 'idle' },
            { pane_id: 'w3:p1', tab_id: 'w3:t1', agent: 'agy', agent_status: 'idle' },
        ];

        const mockTabs = [
            { tab_id: 'w4:t1', label: 'dev-implement' },
            { tab_id: 'w4:t3', label: 'dev-bug' },
        ];

        const enriched = enrichAgentsWithTabLabels(mockAgents, mockTabs);
        expect(enriched[0].name).toBe('dev-implement');
        expect(enriched[1].name).toBe('dev-bug');
        expect(enriched[2].name).toBe('w3:p1'); // Fallback về pane_id khi không có tab label
    });
});
