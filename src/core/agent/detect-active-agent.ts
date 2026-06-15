import { getToolsWithSkillsDir } from './tools.js';

const AI_AGENT_ALIASES: Record<string, string> = {
    'claude-code': 'claude',
    'codex-cli': 'codex',
    'cursor-cli': 'cursor',
    'gemini-cli': 'gemini',
    'github-copilot-cli': 'github-copilot',
};

const ACTIVE_AGENT_RULES: Array<{ isActive: (env: NodeJS.ProcessEnv) => boolean; toolId: string }> = [
    {
        isActive: (env) => Boolean(env.CURSOR_AGENT || env.CURSOR_EXTENSION_HOST_ROLE || env.CURSOR_TRACE_ID),
        toolId: 'cursor',
    },
    {
        isActive: (env) => Boolean(env.CLAUDECODE || env.CLAUDE_CODE),
        toolId: 'claude',
    },
    {
        isActive: (env) => env.CODEX_SANDBOX === '1',
        toolId: 'codex',
    },
    {
        isActive: (env) => Boolean(env.GEMINI_CLI),
        toolId: 'gemini',
    },
    {
        isActive: (env) => Boolean(env.GITHUB_COPILOT || env.COPILOT_AGENT_ID),
        toolId: 'github-copilot',
    },
    {
        isActive: (env) => Boolean(env.WINDSURF_SESSION_ID || env.WINDSURF_AGENT),
        toolId: 'windsurf',
    },
    {
        isActive: (env) => Boolean(env.OPENCODE_SESSION || env.OPENCODE),
        toolId: 'opencode',
    },
    {
        isActive: (env) => env.CONTINUE_DEVELOPMENT === 'true',
        toolId: 'continue',
    },
];

const normalizeAiAgentValue = (raw: string): string => {
    const base = raw.trim().toLowerCase().split('@')[0] ?? '';
    return AI_AGENT_ALIASES[base] ?? base;
};

const isInstallableToolId = (toolId: string, installable: Set<string>): boolean => installable.has(toolId);

/**
 * Detects the AI agent hosting this CLI process (terminal session), when known env signals are set.
 */
export const detectActiveAgentToolId = (env: NodeJS.ProcessEnv = process.env): string | null => {
    const installable = new Set(getToolsWithSkillsDir());

    const aiAgent = env.AI_AGENT?.trim();
    if (aiAgent) {
        const normalized = normalizeAiAgentValue(aiAgent);
        if (isInstallableToolId(normalized, installable)) {
            return normalized;
        }
    }

    for (const rule of ACTIVE_AGENT_RULES) {
        if (rule.isActive(env) && isInstallableToolId(rule.toolId, installable)) {
            return rule.toolId;
        }
    }

    return null;
};
