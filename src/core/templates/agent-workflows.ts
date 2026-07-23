import type { CommandContent } from '@/core/command-generation/types.js';

export enum AgentWorkflowCommandId {
    Clockify = 'only-one-clockify',
    PrGit = 'only-one-pr-git',
    Plan = 'only-one-plan',
}

export enum PrGitTag {
    Feat = 'feat',
    Fix = 'fix',
    Refactor = 'refactor',
    Style = 'style',
}

export const PR_GIT_SKILL_NAME = 'only-one-pr-git-skill';
export const CLOCKIFY_SKILL_NAME = 'only-one-clockify-skill';
export const PLAN_SKILL_NAME = 'only-one-plan-skill';

export const PR_GIT_DEFAULT_BRANCH = 'main';
export const PR_GIT_DEFAULT_TAG = PrGitTag.Feat;
export const CLOCKIFY_DEFAULT_TASKS_PER_DAY = 2;

export const AGENT_WORKFLOW_DEPENDENCIES: Record<AgentWorkflowCommandId, { mcps: string[]; skills: string[] }> = {
    [AgentWorkflowCommandId.PrGit]: {
        mcps: ['github'],
        skills: [PR_GIT_SKILL_NAME],
    },
    [AgentWorkflowCommandId.Clockify]: {
        mcps: ['clockify'],
        skills: [CLOCKIFY_SKILL_NAME],
    },
    [AgentWorkflowCommandId.Plan]: {
        mcps: ['gitnexus'],
        skills: [PLAN_SKILL_NAME],
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

const buildPlanCommandBody =
    (): string => `Use skill \`${PLAN_SKILL_NAME}\` to investigate the codebase, resolve decision gates with the user, and write a durable plan using \`gitnexus\` MCP and source file verification.

## Input

\`\`\`text
/only-one-plan <planning-goal-or-problem-description>
\`\`\`

The prompt or message following \`/only-one-plan\` describes the goal, feature request, or problem to plan.

## Required behavior

1. Load and follow skill \`${PLAN_SKILL_NAME}\`.
2. Enforce planning-only execution boundary: inspect the project and write only the confirmed OpenSpec artifact or plan document (\`docs/plans/<slug>.md\`).
3. Never modify application code, Git state, configuration, indexes, or external systems.
4. Perform GitNexus-first code intelligence query for symbols, dependencies, call paths, and blast radius.
5. Verify all planning conclusions against actual source code files before documenting.
6. Ask the user when evidence is missing or a choice materially affects scope, behavior, architecture, API, dependencies, data, performance, security, or reversibility (provide 2–4 options with recommendation and trade-offs).
7. Justify minimum-impact changes by documenting expected files to modify, reused logic, and preserved areas.
8. Require explicit performance and security evidence/conclusions in the final output.
9. Output durable plan to OpenSpec change artifacts (if available) or \`docs/plans/<slug>.md\`.

If skill \`${PLAN_SKILL_NAME}\` or MCP \`gitnexus\` is unavailable, stop and tell the user to run \`only-one init\` or \`only-one init mcp gitnexus\`.
`;

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

export const buildPlanCommandContent = (): CommandContent => ({
    body: buildPlanCommandBody(),
    category: 'Workflow',
    description: 'Perform grounded code discovery and draft an approved planning artifact using only-one-plan-skill and GitNexus MCP.',
    id: AgentWorkflowCommandId.Plan,
    name: AgentWorkflowCommandId.Plan,
    tags: ['only-one', 'gitnexus', 'mcp', 'planning', 'openspec'],
});

export const buildAgentWorkflowCommandContents = (): CommandContent[] => [
    buildPrGitCommandContent(),
    buildClockifyCommandContent(),
    buildPlanCommandContent(),
];
