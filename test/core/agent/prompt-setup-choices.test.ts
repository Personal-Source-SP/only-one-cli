import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { promptAgentSkillSetup } from '@src/core/agent/prompt-setup.js';
import type { ProgramDeps } from '@src/cli/deps.js';

const searchableMultiSelectMock = vi.hoisted(() => vi.fn());

vi.mock('@src/prompts/searchable-multi-select.js', () => ({
    searchableMultiSelect: searchableMultiSelectMock,
}));

vi.mock('@src/core/agent/install.js', () => ({
    installAgentArtifacts: vi.fn().mockResolvedValue({ installed: [] }),
}));

describe('promptAgentSkillSetup tool choices', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        searchableMultiSelectMock.mockReset();
    });

    it('pre-selects only the active session agent on first-time setup', async () => {
        vi.stubEnv('CURSOR_AGENT', '1');

        const projectDir = await mkdtemp(join(tmpdir(), 'hybrid-agent-'));
        await mkdir(join(projectDir, '.claude'), { recursive: true });
        await mkdir(join(projectDir, '.github'), { recursive: true });

        searchableMultiSelectMock.mockResolvedValue(['cursor']);

        const stdout = vi.fn();
        const deps: ProgramDeps = {
            isInteractive: true,
            prompts: {
                confirm: vi.fn().mockResolvedValue(true),
            },
            stdout,
        };

        await promptAgentSkillSetup(deps, {
            projectDir,
            skipOptInConfirm: true,
        });

        const [{ choices }] = searchableMultiSelectMock.mock.calls[0] as [{ choices: Array<{ preSelected?: boolean; value: string }> }];

        expect(choices.find((c) => c.value === 'cursor')?.preSelected).toBe(true);
        expect(choices.find((c) => c.value === 'claude')?.preSelected).toBe(false);
        expect(stdout).toHaveBeenCalledWith('Active agent detected: Cursor (pre-selected).');
    });
});
