import { existsSync } from 'node:fs';
import { cp, mkdtemp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const skillsDir = join(repoRoot, 'assets', 'skills');

describe('agent workflow skills', () => {
    it('ships only-one-pr-git-skill with referenced PR template', async () => {
        const skillDir = join(skillsDir, 'only-one-pr-git-skill');
        const skill = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');
        const template = await readFile(join(skillDir, 'references', 'pr-template.md'), 'utf-8');

        expect(skill).toContain('name: only-one-pr-git-skill');
        expect(skill).toContain('GitHub MCP');
        expect(skill).toContain('references/pr-template.md');
        expect(template).toContain('## 🎯 Objective');
        expect(template).toContain('Vietnamese Summary Rule');
    });

    it('ships only-one-clockify-skill with task format and validation references', async () => {
        const skillDir = join(skillsDir, 'only-one-clockify-skill');
        const skill = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');
        const format = await readFile(join(skillDir, 'references', 'task-format.md'), 'utf-8');
        const rules = await readFile(join(skillDir, 'references', 'validation-rules.md'), 'utf-8');

        expect(skill).toContain('name: only-one-clockify-skill');
        expect(skill).toContain('Clockify MCP');
        expect(skill).toContain('references/task-format.md');
        expect(skill).toContain('references/validation-rules.md');
        expect(format).toContain('[Label] Description | start-endh');
        expect(rules).toContain('DD/MM/YYYY');
    });

    it('can be copied recursively with references intact', async () => {
        const target = await mkdtemp(join(tmpdir(), 'only-one-skills-'));
        const source = join(skillsDir, 'only-one-clockify-skill');
        const destination = join(target, 'only-one-clockify-skill');

        await cp(source, destination, { recursive: true, force: true });

        expect(existsSync(join(destination, 'SKILL.md'))).toBe(true);
        expect(existsSync(join(destination, 'references', 'task-format.md'))).toBe(true);
        expect(existsSync(join(destination, 'references', 'validation-rules.md'))).toBe(true);
    });
});

describe('only-one-pr-git-skill static validations', () => {
    it('verifies Conventional Commit tag requirements, English PR body, Vietnamese summary, Git preflights, and confirmation rules', async () => {
        const skillDir = join(skillsDir, 'only-one-pr-git-skill');
        const skillContent = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');

        // Conventional Commit types
        expect(skillContent).toContain('feat');
        expect(skillContent).toContain('fix');
        expect(skillContent).toContain('refactor');
        expect(skillContent).toContain('style');
        expect(skillContent).toContain('Reject `[FEAT]`');
        expect(skillContent).toContain('lowercase');

        // Required confirmation
        expect(skillContent).toContain('explicit user confirmation');
        expect(skillContent).toContain('confirmation before any GitHub mutation');

        // English-only body & Vietnamese summary
        expect(skillContent).toContain('Draft PR title in English');
        expect(skillContent).toContain('Draft PR body in English');
        expect(skillContent).toContain('Vietnamese summary for quick review');
        expect(skillContent).toContain('Do not put Vietnamese content into the GitHub PR body');

        // Git preflight
        expect(skillContent).toContain('Check Git preflight');
        expect(skillContent).toContain('working tree has no uncommitted changes');
        expect(skillContent).toContain('source branch has no unpushed commits');
        expect(skillContent).toContain('source branch differs from base branch');

        // Existing PR update flow
        expect(skillContent).toContain('find an existing open PR');
        expect(skillContent).toContain('ask whether to update');
        expect(skillContent).toContain('keep it unchanged');
    });
});

describe('only-one-clockify-skill static validations', () => {
    it('verifies required options, weekday allocation, weekend shifting, and timezone rules', async () => {
        const skillDir = join(skillsDir, 'only-one-clockify-skill');
        const skillContent = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');
        const rulesContent = await readFile(join(skillDir, 'references', 'validation-rules.md'), 'utf-8');
        const formatContent = await readFile(join(skillDir, 'references', 'task-format.md'), 'utf-8');

        // Required options
        expect(skillContent).toContain('date');
        expect(skillContent).toContain('project');
        expect(rulesContent).toContain('--date');
        expect(rulesContent).toContain('--project');
        expect(rulesContent).toContain('DD/MM/YYYY');
        expect(rulesContent).toContain('--tasks-per-day');

        // Weekday allocation & weekend shifting
        expect(skillContent).toContain('allocate them to weekdays');
        expect(skillContent).toContain('shift start date to the next Monday');
        expect(rulesContent).toContain('move to next Monday');
        expect(rulesContent).toContain('Skip Saturday and Sunday');
        expect(skillContent).toContain('Do not log weekends');

        // Task grammar & timezone
        expect(formatContent).toContain('[Label] Description | start-endh');
        expect(formatContent).toContain('GMT+7');
        expect(formatContent).toContain('Asia/Ho_Chi_Minh');
    });

    it('verifies dry run, confirmation, replacement matching, billable status, and batch recovery rules', async () => {
        const skillDir = join(skillsDir, 'only-one-clockify-skill');
        const skillContent = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');
        const rulesContent = await readFile(join(skillDir, 'references', 'validation-rules.md'), 'utf-8');

        // Dry run (--validate) never mutates
        expect(skillContent).toContain('Never mutate Clockify in `--validate` mode');
        expect(skillContent).toContain('In `--validate` mode, stop after preview');
        expect(rulesContent).toContain('only validates and previews');

        // Preview & confirmation
        expect(skillContent).toContain('Show preview');
        expect(skillContent).toContain('ask for explicit confirmation once');

        // Replacement matching
        expect(skillContent).toContain('Find existing entries matching');
        expect(rulesContent).toContain('Match existing entries by');
        expect(rulesContent).toContain('Keep unrelated entries unchanged');
        expect(rulesContent).toContain('Delete matching old entries before creating');

        // Billable status
        expect(skillContent).toContain('new billable entry');
        expect(rulesContent).toContain('Create every new entry as billable');

        // Batch recovery
        expect(skillContent).toContain('immediately restore old entries from snapshots');
        expect(rulesContent).toContain('restore old entries immediately');
        expect(rulesContent).toContain('Stop the batch after restore attempt');
    });

    it('verifies exact project matching, suggestions, and workspace ambiguity resolution rules', async () => {
        const skillDir = join(skillsDir, 'only-one-clockify-skill');
        const skillContent = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');
        const rulesContent = await readFile(join(skillDir, 'references', 'validation-rules.md'), 'utf-8');

        // Exact matching & similar names
        expect(skillContent).toContain('Resolve Clockify project by exact name');
        expect(skillContent).toContain('Do not guess project');
        expect(rulesContent).toContain('Search projects by exact name');
        expect(rulesContent).toContain('show similar names');

        // Workspace ambiguity resolution
        expect(skillContent).toContain('ask the user to select one');
        expect(skillContent).toContain('stop and list candidates');
        expect(rulesContent).toContain('ask user to choose');
        expect(rulesContent).toContain('stop and list candidates');
    });
});

describe('only-one-plan-skill static validations', () => {
    it('verifies read-only boundary, GitNexus-first discovery, decision gates, minimum impact, and required output sections', async () => {
        const skillDir = join(skillsDir, 'only-one-plan-skill');
        const skillContent = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');

        // Read-only boundary
        expect(skillContent).toContain('Planning-Only Execution Boundary');
        expect(skillContent).toContain('NEVER modify application code');
        expect(skillContent).toContain('untrusted data');

        // GitNexus-first & source verification
        expect(skillContent).toContain('GitNexus-First Grounded Discovery');
        expect(skillContent).toContain('gitnexus');
        expect(skillContent).toContain('ask explicit consent before falling back');

        // User-controlled decision gates & grill-me integration
        expect(skillContent).toContain('User-Controlled Decision Gates & Relentless Interview (grill-me integration)');
        expect(skillContent).toContain('one question at a time');
        expect(skillContent).toContain('decision tree');
        expect(skillContent).toContain('explore first before asking');
        expect(skillContent).toContain('2–4 distinct options');
        expect(skillContent).toContain('(Recommended)');

        // Minimum impact
        expect(skillContent).toContain('Minimum-Impact Architecture');
        expect(skillContent).toContain('reusing existing logic');
        expect(skillContent).toContain('smallest safe scope');

        // Output contract & mandatory sections
        expect(skillContent).toContain('Performance Analysis & Evidence');
        expect(skillContent).toContain('Security Analysis & Evidence');
        expect(skillContent).toContain('docs/plans/<slug>.md');
    });
});
