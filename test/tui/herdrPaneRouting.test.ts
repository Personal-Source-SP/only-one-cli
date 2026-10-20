import { describe, expect, it } from 'vitest';
import { normalizePhaseRoute, toCanonicalHerdrKind } from '../../src/tui/services/herdrService.js';

describe('Herdr Pane Routing & PhaseAgentRoute', () => {
    it('chuẩn hóa chính xác canonical kinds cho Herdr CLI', () => {
        expect(toCanonicalHerdrKind('antigravity')).toBe('agy');
        expect(toCanonicalHerdrKind('agy')).toBe('agy');
        expect(toCanonicalHerdrKind('claudecode')).toBe('claude');
        expect(toCanonicalHerdrKind('claude')).toBe('claude');
        expect(toCanonicalHerdrKind('codex')).toBe('codex');
    });

    it('chuẩn hóa định dạng string cũ sang PhaseAgentRoute object', () => {
        const fromString = normalizePhaseRoute('antigravity');
        expect(fromString).toEqual({ pane: 'auto', cli: 'agy' });

        const fromCodexString = normalizePhaseRoute('codex');
        expect(fromCodexString).toEqual({ pane: 'auto', cli: 'codex' });
    });

    it('giữ nguyên và chuẩn hóa PhaseAgentRoute object', () => {
        const validRoute = normalizePhaseRoute({ pane: 'w4:p4', cli: 'antigravity' });
        expect(validRoute).toEqual({ pane: 'w4:p4', cli: 'agy' });
    });
});
