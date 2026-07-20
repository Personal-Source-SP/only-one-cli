import { describe, expect, it } from 'vitest';
import { normalizeStructureCommandPath } from '@src/core/agent/command-path.js';
import { windsurfCommandAdapter } from '@src/core/command-generation/adapters/windsurf.js';
import { codexCommandAdapter } from '@src/core/command-generation/adapters/codex.js';
import { STRUCTURE_COMMAND_ID } from '@src/core/templates/structure.js';

describe('normalizeStructureCommandPath', () => {
    it('strips opsx prefix from windsurf workflow path', () => {
        const raw = windsurfCommandAdapter.getFilePath(STRUCTURE_COMMAND_ID);
        expect(raw).toContain('opsx-');
        const normalized = normalizeStructureCommandPath(raw, STRUCTURE_COMMAND_ID);
        expect(normalized.replace(/\\/g, '/')).toBe('.windsurf/workflows/only-one-structure-generate.md');
    });

    it('strips opsx folder from claude-style paths', () => {
        expect(normalizeStructureCommandPath('.claude/commands/opsx/only-one-structure-generate.md', STRUCTURE_COMMAND_ID)).toBe(
            '.claude/commands/only-one-structure-generate.md',
        );
    });
});

describe('codex adapter', () => {
    it('uses absolute prompt path', () => {
        const path = codexCommandAdapter.getFilePath(STRUCTURE_COMMAND_ID);
        expect(path.includes('prompts')).toBe(true);
        expect(path.includes('only-one-structure-generate') || path.includes('opsx-')).toBe(true);
    });
});
