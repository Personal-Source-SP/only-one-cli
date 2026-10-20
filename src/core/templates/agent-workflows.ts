import type { CommandContent } from '@/core/command-generation/types.js';

export enum AgentWorkflowCommandId {
    Ui = 'only-one-ui',
    PrGit = 'only-one-pr-git',
}

export enum PrGitTag {
    Feat = 'feat',
    Fix = 'fix',
    Refactor = 'refactor',
    Style = 'style',
    Chore = 'chore',
    Docs = 'docs',
    Test = 'test',
    Perf = 'perf',
    Ci = 'ci',
    Build = 'build',
}

export const PR_GIT_SKILL_NAME = 'only-one-pr-git';

export const PR_GIT_DEFAULT_BRANCH = 'main';
export const PR_GIT_DEFAULT_TAG = PrGitTag.Feat;

export const AGENT_WORKFLOW_DEPENDENCIES: Record<AgentWorkflowCommandId, { mcps: string[]; skills: string[] }> = {
    [AgentWorkflowCommandId.Ui]: {
        mcps: [],
        skills: ['ux-ui-pro-max'],
    },
    [AgentWorkflowCommandId.PrGit]: {
        mcps: ['github'],
        skills: [PR_GIT_SKILL_NAME],
    },
};

export const SUPPORTED_PR_GIT_TAGS: PrGitTag[] = [
    PrGitTag.Feat,
    PrGitTag.Fix,
    PrGitTag.Refactor,
    PrGitTag.Style,
    PrGitTag.Chore,
    PrGitTag.Docs,
    PrGitTag.Test,
    PrGitTag.Perf,
    PrGitTag.Ci,
    PrGitTag.Build,
];

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

const buildUiCommandBody = (): string => `Use this workflow only for web or mobile UI work.

## Input

\`\`\`text
/only-one-ui <UI task, requirement, or reference>
\`\`\`

## Required behavior

1. Check external skill \`ux-ui-pro-max\`. If unavailable, report blocker and stop.
2. Load and follow \`ux-ui-pro-max\` before proposing or implementing UI work.
3. Collect design references, existing UI patterns, tokens, theme configuration, architecture, i18n, and breakpoints.
4. If no approved reference exists, propose a concrete design direction and wait for explicit approval before implementation.
5. Reuse existing components and tokens. Prefer suitable Ant Design components; use Tailwind CSS for styling and responsive utilities.
6. Cover relevant states, semantic HTML, accessibility, keyboard navigation, contrast, and reduced motion.
7. Implement and test mobile, tablet, and desktop behavior.
8. Collect browser or screenshot evidence. Do not claim visual completion without fresh viewport evidence.
`;

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
    description: 'Create or update a GitHub PR from current branch using only-one-pr-git and GitHub MCP.',
    id: AgentWorkflowCommandId.PrGit,
    name: AgentWorkflowCommandId.PrGit,
    tags: ['only-one', 'github', 'mcp', 'pr'],
});

export const buildAgentWorkflowCommandContents = (): CommandContent[] => [buildPrGitCommandContent(), buildUiCommandContent()];
