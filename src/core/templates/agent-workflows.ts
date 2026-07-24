import type { CommandContent } from '@/core/command-generation/types.js';

export enum AgentWorkflowCommandId {
    Bug = 'only-one-bug',
    Ui = 'only-one-ui',
    Clockify = 'only-one-clockify',
    PrGit = 'only-one-pr-git',
}

export enum PrGitTag {
    Feat = 'feat',
    Fix = 'fix',
    Refactor = 'refactor',
    Style = 'style',
}

export const PR_GIT_SKILL_NAME = 'only-one-pr-git-skill';
export const CLOCKIFY_SKILL_NAME = 'only-one-clockify-skill';

export const PR_GIT_DEFAULT_BRANCH = 'main';
export const PR_GIT_DEFAULT_TAG = PrGitTag.Feat;
export const CLOCKIFY_DEFAULT_TASKS_PER_DAY = 2;

export const AGENT_WORKFLOW_DEPENDENCIES: Record<AgentWorkflowCommandId, { mcps: string[]; skills: string[] }> = {
    [AgentWorkflowCommandId.Bug]: {
        mcps: ['gitnexus'],
        skills: ['systematic-debugging', 'test-driven-development', 'verification-before-completion'],
    },
    [AgentWorkflowCommandId.Ui]: {
        mcps: [],
        skills: ['ux-ui-max'],
    },
    [AgentWorkflowCommandId.PrGit]: {
        mcps: ['github'],
        skills: [PR_GIT_SKILL_NAME],
    },
    [AgentWorkflowCommandId.Clockify]: {
        mcps: ['clockify'],
        skills: [CLOCKIFY_SKILL_NAME],
    },
};

export const SUPPORTED_PR_GIT_TAGS: PrGitTag[] = [PrGitTag.Feat, PrGitTag.Fix, PrGitTag.Refactor, PrGitTag.Style];

const buildPrGitCommandBody =
    (): string => `Use skill \`${PR_GIT_SKILL_NAME}\` to create or update a GitHub Pull Request through the configured \`github\` MCP server.

## Input

\`\`\`text
/only-one-pr-git --branch <base-branch> --tag <conventional-type>
\`\`\`

- \`--branch\` is optional. Default: \`${PR_GIT_DEFAULT_BRANCH}\`.
- \`--tag\` is optional. Default: \`${PR_GIT_DEFAULT_TAG}\`.
- \`--tag\` MUST be one of: \`${SUPPORTED_PR_GIT_TAGS.join('`, `')}\`.
- Reject bracketed or uppercase tags such as \`[FEAT]\` or \`FEAT\`.

## Required behavior

1. Load and follow skill \`${PR_GIT_SKILL_NAME}\`.
2. Validate options before any GitHub MCP mutation.
3. Use the current Git branch as source branch.
4. Use \`--branch\` as base branch.
5. Use \`--tag\` as Conventional Commit type for the PR title.
6. Show PR preview and wait for explicit user confirmation before create/update.

If skill \`${PR_GIT_SKILL_NAME}\` or MCP \`github\` is unavailable, stop and tell the user to run \`only-one init\` or \`only-one init mcp github\`.
`;

const buildClockifyCommandBody =
    (): string => `Use skill \`${CLOCKIFY_SKILL_NAME}\` to validate or log Clockify time entries through the configured \`clockify\` MCP server.

## Input

\`\`\`text
/only-one-clockify --date <DD/MM/YYYY> --project <project-name> [--tasks-per-day <number>] [--validate]

[Carwash API] Implement task description | 9-13h
[Carwash Portal] Implement task description | 13-17h
\`\`\`

- \`--date\` is required and MUST use \`DD/MM/YYYY\`.
- \`--project\` is required and MUST match a Clockify project name exactly.
- \`--tasks-per-day\` is optional. Default: \`${CLOCKIFY_DEFAULT_TASKS_PER_DAY}\`.
- \`--validate\` is optional and MUST prevent every mutation.
- Remaining non-empty lines after options are the task list.

## Required behavior

1. Load and follow skill \`${CLOCKIFY_SKILL_NAME}\`.
2. Validate required options and task format before Clockify mutations.
3. Preview project, workspace, adjusted dates, slots, descriptions, replacements, skipped tasks, and total hours.
4. In \`--validate\` mode, stop after preview and validation result.
5. In log mode, wait for explicit user confirmation before deleting or creating entries.

If skill \`${CLOCKIFY_SKILL_NAME}\` or MCP \`clockify\` is unavailable, stop and tell the user to run \`only-one init\` or \`only-one init mcp clockify\`.
`;

const buildBugCommandBody = (): string => `Use this workflow to reproduce, diagnose, approve, fix, and verify a reported bug.

## Input

\`\`\`text
/only-one-bug <bug report, symptom, or failing case>
\`\`\`

## Required behavior

1. Check external dependencies \`superpowers\` and \`gitnexus\`. If either is unavailable, report blocker and stop.
2. Invoke \`superpowers:systematic-debugging\` before diagnosis.
3. Reproduce the bug, separate facts from hypotheses, and confirm root cause.
4. Use GitNexus for dependency and impact discovery.
5. Present evidence, minimal fix, affected files, risks, and test plan. Wait for explicit approval before changes.
6. After approval, use test-driven development when applicable and make the smallest root-cause fix.
7. Invoke \`superpowers:verification-before-completion\` and report fresh validation evidence.
8. Never expose secrets, credentials, tokens, or PII during diagnosis.
`;

const buildUiCommandBody = (): string => `Use this workflow only for web or mobile UI work.

## Input

\`\`\`text
/only-one-ui <UI task, requirement, or reference>
\`\`\`

## Required behavior

1. Check external skill \`ux-ui-max\`. If unavailable, report blocker and stop.
2. Load and follow \`ux-ui-max\` before proposing or implementing UI work.
3. Collect design references, existing UI patterns, tokens, theme configuration, architecture, i18n, and breakpoints.
4. If no approved reference exists, propose a concrete design direction and wait for explicit approval before implementation.
5. Reuse existing components and tokens. Prefer suitable Ant Design components; use Tailwind CSS for styling and responsive utilities.
6. Cover relevant states, semantic HTML, accessibility, keyboard navigation, contrast, and reduced motion.
7. Implement and test mobile, tablet, and desktop behavior.
8. Collect browser or screenshot evidence. Do not claim visual completion without fresh viewport evidence.
`;

export const buildBugCommandContent = (): CommandContent => ({
    body: buildBugCommandBody(),
    category: 'Workflow',
    description: 'Reproduce, diagnose, approve, fix, and verify a bug using evidence-driven debugging.',
    id: AgentWorkflowCommandId.Bug,
    name: AgentWorkflowCommandId.Bug,
    tags: ['only-one', 'bug', 'debugging', 'verification'],
});

export const buildUiCommandContent = (): CommandContent => ({
    body: buildUiCommandBody(),
    category: 'Workflow',
    description: 'Design and implement approved, responsive, accessible UI using existing project patterns.',
    id: AgentWorkflowCommandId.Ui,
    name: AgentWorkflowCommandId.Ui,
    tags: ['only-one', 'ui', 'ux', 'responsive'],
});

export const buildPrGitCommandContent = (): CommandContent => ({
    body: buildPrGitCommandBody(),
    category: 'Workflow',
    description: 'Create or update a GitHub PR from current branch using only-one-pr-git-skill and GitHub MCP.',
    id: AgentWorkflowCommandId.PrGit,
    name: AgentWorkflowCommandId.PrGit,
    tags: ['only-one', 'github', 'mcp', 'pr'],
});

export const buildClockifyCommandContent = (): CommandContent => ({
    body: buildClockifyCommandBody(),
    category: 'Workflow',
    description: 'Validate and log Clockify tasks using only-one-clockify-skill and Clockify MCP.',
    id: AgentWorkflowCommandId.Clockify,
    name: AgentWorkflowCommandId.Clockify,
    tags: ['only-one', 'clockify', 'mcp', 'time-tracking'],
});

export const buildAgentWorkflowCommandContents = (): CommandContent[] => [
    buildPrGitCommandContent(),
    buildClockifyCommandContent(),
    buildBugCommandContent(),
    buildUiCommandContent(),
];
