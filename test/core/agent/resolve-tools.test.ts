import { describe, expect, it } from 'vitest';
import { getToolsWithSkillsDir } from '@src/core/agent/tools.js';
import { resolveToolsArg, ResolveToolsArgError } from '@src/core/agent/resolve-tools.js';

describe('resolveToolsArg', () => {
    it('parses none', () => {
        expect(resolveToolsArg('none')).toEqual({ kind: 'none' });
    });

    it('parses all', () => {
        const result = resolveToolsArg('all');
        expect(result.kind).toBe('list');
        if (result.kind === 'list') {
            expect(result.toolIds).toEqual(getToolsWithSkillsDir());
            expect(result.toolIds.length).toBe(30);
        }
    });

    it('parses comma list', () => {
        const result = resolveToolsArg('cursor,claude');
        expect(result).toEqual({ kind: 'list', toolIds: ['cursor', 'claude'] });
    });

    it('rejects unknown tool', () => {
        expect(() => resolveToolsArg('unknown')).toThrow(ResolveToolsArgError);
    });
});
