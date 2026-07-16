import { describe, expect, it } from 'vitest';
import { antigravityCommandAdapter } from '@src/core/command-generation/adapters/antigravity.js';
import { cursorCommandAdapter } from '@src/core/command-generation/adapters/cursor.js';
import { generateCommand } from '@src/core/command-generation/generator.js';
import {
    AgentWorkflowCommandId,
    CLOCKIFY_DEFAULT_TASKS_PER_DAY,
    PR_GIT_DEFAULT_BRANCH,
    PR_GIT_DEFAULT_TAG,
    SUPPORTED_PR_GIT_TAGS,
    buildAgentWorkflowCommandContents,
    buildClockifyCommandContent,
    buildPrGitCommandContent,
} from '@src/core/templates/agent-workflows.js';
import { normalizeStructureCommandPath } from '@src/core/agent/command-path.js';

describe('agent workflow command sources', () => {
    it('defines pr-git option contract', () => {
        const command = buildPrGitCommandContent();

        expect(command.id).toBe(AgentWorkflowCommandId.PrGit);
        expect(command.body).toContain(`--branch`);
        expect(command.body).toContain(PR_GIT_DEFAULT_BRANCH);
        expect(command.body).toContain(`--tag`);
        expect(command.body).toContain(PR_GIT_DEFAULT_TAG);
        expect(SUPPORTED_PR_GIT_TAGS).toEqual(['feat', 'fix', 'refactor', 'style']);
        expect(command.body).toContain('Reject bracketed or uppercase tags');
        expect(command.body).toContain('ak-pr-git');
        expect(command.body).toContain('github');
    });

    it('defines clockify required option contract', () => {
        const command = buildClockifyCommandContent();

        expect(command.id).toBe(AgentWorkflowCommandId.Clockify);
        expect(command.body).toContain('--date <DD/MM/YYYY>');
        expect(command.body).toContain('--project <project-name>');
        expect(command.body).toContain(`Default: \`${CLOCKIFY_DEFAULT_TASKS_PER_DAY}\``);
        expect(command.body).toContain('--validate');
        expect(command.body).toContain('ak-clockify');
        expect(command.body).toContain('clockify');
    });

    it('exports both workflow commands in deterministic order', () => {
        expect(buildAgentWorkflowCommandContents().map((command) => command.id)).toEqual(['pr-git', 'clockify']);
    });
});

describe('agent workflow command adapter naming', () => {
    it('uses direct cursor slash command names', () => {
        const generated = generateCommand(buildPrGitCommandContent(), cursorCommandAdapter);

        expect(generated.path).toBe('.cursor/commands/pr-git.md');
        expect(generated.content).toContain('name: /pr-git');
    });

    it('normalizes antigravity opsx prefix for non-openspec workflow commands', () => {
        const raw = antigravityCommandAdapter.getFilePath(AgentWorkflowCommandId.PrGit);
        const normalized = normalizeStructureCommandPath(raw, AgentWorkflowCommandId.PrGit);

        expect(raw).toBe('.agent/workflows/opsx-pr-git.md');
        expect(normalized).toBe('.agent/workflows/pr-git.md');
    });
});
