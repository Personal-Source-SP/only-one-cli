/** Aligned with open-spec-source/src/core/config.ts */
export type AgentToolOption = {
    available?: boolean;
    detectionPaths?: string[];
    name: string;
    skillsDir?: string;
    successLabel?: string;
    value: string;
};

export const AI_TOOLS: AgentToolOption[] = [
    { available: true, name: 'Amazon Q Developer', skillsDir: '.amazonq', successLabel: 'Amazon Q Developer', value: 'amazon-q' },
    { available: true, name: 'Antigravity', skillsDir: '.agents', successLabel: 'Antigravity', value: 'antigravity' },
    { available: true, name: 'Auggie (Augment CLI)', skillsDir: '.augment', successLabel: 'Auggie', value: 'auggie' },
    { available: true, name: 'Bob Shell', skillsDir: '.bob', successLabel: 'Bob Shell', value: 'bob' },
    { available: true, name: 'Claude Code', skillsDir: '.claude', successLabel: 'Claude Code', value: 'claude' },
    { available: true, name: 'Cline', skillsDir: '.cline', successLabel: 'Cline', value: 'cline' },
    { available: true, name: 'Codex', skillsDir: '.codex', successLabel: 'Codex', value: 'codex' },
    { available: true, name: 'ForgeCode', skillsDir: '.forge', successLabel: 'ForgeCode', value: 'forgecode' },
    { available: true, name: 'CodeBuddy Code (CLI)', skillsDir: '.codebuddy', successLabel: 'CodeBuddy Code', value: 'codebuddy' },
    {
        available: true,
        name: 'Continue',
        skillsDir: '.continue',
        successLabel: 'Continue (VS Code / JetBrains / Cli)',
        value: 'continue',
    },
    { available: true, name: 'CoStrict', skillsDir: '.cospec', successLabel: 'CoStrict', value: 'costrict' },
    { available: true, name: 'Crush', skillsDir: '.crush', successLabel: 'Crush', value: 'crush' },
    { available: true, name: 'Cursor', skillsDir: '.cursor', successLabel: 'Cursor', value: 'cursor' },
    { available: true, name: 'Factory Droid', skillsDir: '.factory', successLabel: 'Factory Droid', value: 'factory' },
    { available: true, name: 'Gemini CLI', skillsDir: '.gemini', successLabel: 'Gemini CLI', value: 'gemini' },
    {
        available: true,
        detectionPaths: [
            '.github/copilot-instructions.md',
            '.github/instructions',
            '.github/workflows/copilot-setup-steps.yml',
            '.github/prompts',
            '.github/agents',
            '.github/skills',
            '.github/.mcp.json',
        ],
        name: 'GitHub Copilot',
        skillsDir: '.github',
        successLabel: 'GitHub Copilot',
        value: 'github-copilot',
    },
    { available: true, name: 'iFlow', skillsDir: '.iflow', successLabel: 'iFlow', value: 'iflow' },
    { available: true, name: 'Junie', skillsDir: '.junie', successLabel: 'Junie', value: 'junie' },
    { available: true, name: 'Kilo Code', skillsDir: '.kilocode', successLabel: 'Kilo Code', value: 'kilocode' },
    { available: true, name: 'Kimi CLI', skillsDir: '.kimi', successLabel: 'Kimi CLI', value: 'kimi' },
    { available: true, name: 'Kiro', skillsDir: '.kiro', successLabel: 'Kiro', value: 'kiro' },
    { available: true, name: 'Lingma', skillsDir: '.lingma', successLabel: 'Lingma', value: 'lingma' },
    { available: true, name: 'Mistral Vibe', skillsDir: '.vibe', successLabel: 'Mistral Vibe', value: 'vibe' },
    { available: true, name: 'OpenCode', skillsDir: '.opencode', successLabel: 'OpenCode', value: 'opencode' },
    { available: true, name: 'Pi', skillsDir: '.pi', successLabel: 'Pi', value: 'pi' },
    { available: true, name: 'Qoder', skillsDir: '.qoder', successLabel: 'Qoder', value: 'qoder' },
    { available: true, name: 'Qwen Code', skillsDir: '.qwen', successLabel: 'Qwen Code', value: 'qwen' },
    { available: true, name: 'RooCode', skillsDir: '.roo', successLabel: 'RooCode', value: 'roocode' },
    { available: true, name: 'Trae', skillsDir: '.trae', successLabel: 'Trae', value: 'trae' },
    { available: true, name: 'Windsurf', skillsDir: '.windsurf', successLabel: 'Windsurf', value: 'windsurf' },
    {
        available: false,
        name: 'AGENTS.md (works with Amp, VS Code, …)',
        successLabel: 'your AGENTS.md-compatible assistant',
        value: 'agents',
    },
];

export const getToolsWithSkillsDir = (): string[] => AI_TOOLS.filter((t) => t.available !== false && t.skillsDir).map((t) => t.value);

export const getAgentToolById = (toolId: string): AgentToolOption | undefined => AI_TOOLS.find((t) => t.value === toolId);

export const getInstallableAgentTools = (): AgentToolOption[] => AI_TOOLS.filter((t) => t.available !== false && t.skillsDir);

/** @deprecated Use getToolsWithSkillsDir */
export const INSTALLABLE_AGENT_TOOL_IDS = getToolsWithSkillsDir();
