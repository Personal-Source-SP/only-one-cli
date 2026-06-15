import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolveCocoindexScript } from '@src/core/indexing/tools.js';

describe('indexing-tools', () => {
    it('resolveCocoindexScript finds packaged cocoindex_documents.py', () => {
        const script = resolveCocoindexScript();
        expect(existsSync(script)).toBe(true);
        expect(script).toMatch(/scripts[/\\]cocoindex_documents\.py$/);
        expect(script).toMatch(/[/\\]scripts[/\\]cocoindex_documents\.py$/);
    });
});
