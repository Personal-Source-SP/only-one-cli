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
    buildBugCommandContent,
    buildUiCommandContent,
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
        expect(command.body).toContain('only-one-pr-git-skill');
        expect(command.body).toContain('github');
    });

    it('defines clockify required option contract', () => {
        const command = buildClockifyCommandContent();

        expect(command.id).toBe(AgentWorkflowCommandId.Clockify);
        expect(command.body).toContain('--date <DD/MM/YYYY>');
        expect(command.body).toContain('--project <project-name>');
        expect(command.body).toContain(`Default: \`${CLOCKIFY_DEFAULT_TASKS_PER_DAY}\``);
        expect(command.body).toContain('--validate');
        expect(command.body).toContain('only-one-clockify-skill');
        expect(command.body).toContain('clockify');
    });

    it('defines bug workflow approval and dependency blockers', () => {
        const command = buildBugCommandContent();

        expect(command.id).toBe(AgentWorkflowCommandId.Bug);
        expect(command.body).toContain('superpowers');
        expect(command.body).toContain('gitnexus');
        expect(command.body).toContain('report blocker and stop');
        expect(command.body).toContain('Wait for explicit approval before changes');
        expect(command.body).toContain('verification-before-completion');
    });

    it('defines UI workflow approval and viewport validation', () => {
        const command = buildUiCommandContent();

        expect(command.id).toBe(AgentWorkflowCommandId.Ui);
        expect(command.body).toContain('ux-ui-max');
        expect(command.body).toContain('report blocker and stop');
        expect(command.body).toContain('wait for explicit approval before implementation');
        expect(command.body).toContain('mobile, tablet, and desktop');
        expect(command.body).toContain('viewport evidence');
    });

    it('exports all workflow commands in deterministic order', () => {
        expect(buildAgentWorkflowCommandContents().map((command) => command.id)).toEqual([
            'only-one-pr-git',
            'only-one-clockify',
            'only-one-bug',
            'only-one-ui',
        ]);
    });
});

describe('agent workflow command adapter naming', () => {
    it('uses direct cursor slash command names', () => {
        const generated = generateCommand(buildPrGitCommandContent(), cursorCommandAdapter);

        expect(generated.path.replace(/\\/g, '/')).toBe('.cursor/commands/only-one-pr-git.md');
        expect(generated.content).toContain('name: /only-one-pr-git');
    });

    it('normalizes antigravity opsx prefix for non-openspec workflow commands', () => {
        const raw = antigravityCommandAdapter.getFilePath(AgentWorkflowCommandId.PrGit);
        const normalized = normalizeStructureCommandPath(raw, AgentWorkflowCommandId.PrGit);

        expect(raw.replace(/\\/g, '/')).toBe('.agents/workflows/opsx-only-one-pr-git.md');
        expect(normalized.replace(/\\/g, '/')).toBe('.agents/workflows/only-one-pr-git.md');
    });
});
