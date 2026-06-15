import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectActiveAgentToolId } from '@src/core/agent/detect-active-agent.js';

describe('detectActiveAgentToolId', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('returns null when no agent signals are set', () => {
        expect(detectActiveAgentToolId({})).toBeNull();
    });

    it('detects cursor from CURSOR_AGENT', () => {
        expect(detectActiveAgentToolId({ CURSOR_AGENT: '1' })).toBe('cursor');
    });

    it('detects cursor from CURSOR_EXTENSION_HOST_ROLE', () => {
        expect(detectActiveAgentToolId({ CURSOR_EXTENSION_HOST_ROLE: 'agent-exec' })).toBe('cursor');
    });

    it('detects claude from CLAUDECODE', () => {
        expect(detectActiveAgentToolId({ CLAUDECODE: '1' })).toBe('claude');
    });

    it('prefers cursor over claude when both signals are present', () => {
        expect(
            detectActiveAgentToolId({
                CLAUDECODE: '1',
                CURSOR_AGENT: '1',
            }),
        ).toBe('cursor');
    });

    it('maps AI_AGENT aliases to catalog ids', () => {
        expect(detectActiveAgentToolId({ AI_AGENT: 'claude-code' })).toBe('claude');
        expect(detectActiveAgentToolId({ AI_AGENT: 'cursor-cli' })).toBe('cursor');
    });

    it('honors AI_AGENT when it is a direct catalog id', () => {
        expect(detectActiveAgentToolId({ AI_AGENT: 'windsurf' })).toBe('windsurf');
    });
});
