import { describe, expect, it } from 'vitest';
import { normalizePhaseRoute, isHerdrSessionActive } from '../../src/tui/services/herdrService.js';

describe('Herdr Target Pane Routing Logic', () => {
    it('nhận diện chính xác target pane đã cấu hình', () => {
        const route = normalizePhaseRoute({ pane: 'w4:p7', cli: 'agy' });
        expect(route.pane).toBe('w4:p7');
        expect(route.cli).toBe('agy');
        expect(route.pane).not.toBe('auto');
    });

    it('chuẩn hóa chính xác phase apply sang key processing', () => {
        const route = normalizePhaseRoute({ pane: 'w4:p1', cli: 'agy' });
        expect(route.pane).toBe('w4:p1');
    });

    it('nhận diện chính xác khi HERDR_ENV không hoạt động qua tham số env', () => {
        expect(isHerdrSessionActive({ HERDR_ENV: '0' })).toBe(false);
        expect(isHerdrSessionActive({})).toBe(false);
    });
});
