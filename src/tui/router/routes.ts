import type { MenuCategory, RouteItem } from './types.js';

export interface CategoryGroup {
    id: MenuCategory;
    name: string;
    icon: string;
    items: RouteItem[];
}

export const ROUTE_CATEGORIES: CategoryGroup[] = [
    {
        id: 'setup',
        name: 'Workspace Setup',
        icon: '⚡',
        items: [
            {
                id: 'init',
                label: 'Initialize Workspace',
                category: 'setup',
                icon: '🚀',
                description: 'Full workspace initialization: configs, agents, skills & rules',
                tags: ['init', 'workspace', 'rules', 'templates'],
                quickSummary: ['Creates .agents workspace structure', 'Syncs baseline AGENTS.md rules', 'Configures active AI IDE targets'],
            },
            {
                id: 'combo',
                label: 'Apply Combos',
                category: 'setup',
                icon: '✨',
                description: 'Predefined stacks (NestJS backend, Next.js frontend, AI Agents)',
                tags: ['combo', 'stack', 'nestjs', 'nextjs'],
                quickSummary: ['Bundled skills, rules, and workflows', 'Automated overwrite protection', 'One-click fullstack boost'],
            },
            {
                id: 'structure-generate',
                label: 'Scaffold Blueprints',
                category: 'setup',
                icon: '🏗️',
                description: 'Generate structural architectural blueprints for agents',
                tags: ['structure', 'blueprint', 'scaffold'],
                quickSummary: ['Scaffolds clean architecture folders', 'Emits context-aware guidelines'],
            },
        ],
    },
    {
        id: 'sync',
        name: 'Agent & Rules Sync',
        icon: '🔄',
        items: [
            {
                id: 'skill',
                label: 'Agent Skills',
                category: 'sync',
                icon: '🧩',
                description: 'Install and synchronize custom agent skills from catalog or Git',
                tags: ['skills', 'agent', 'c4', 'gherkin'],
                quickSummary: ['Interactive remote & local skill browser', 'Automatic lockfile sync'],
            },
            {
                id: 'workflow',
                label: 'Workflows',
                category: 'sync',
                icon: '⚡',
                description: 'Sync and update workflow markdown templates',
                tags: ['workflow', 'idea', 'plan', 'apply', 'review'],
                quickSummary: ['Syncs /only-one-idea, /plan, /apply', 'Enforces strict negative rules'],
            },
            {
                id: 'rule',
                label: 'Agent Rules',
                category: 'sync',
                icon: '📝',
                description: 'Sync workspace agent rules and conventions (.agents/AGENTS.md)',
                tags: ['rules', 'standards', 'guidelines'],
                quickSummary: ['Synchronizes repo-level AI constraints', 'Merges stack-specific rules'],
            },
            {
                id: 'mcp',
                label: 'MCP Servers',
                category: 'sync',
                icon: '🌐',
                description: 'Configure Model Context Protocol servers (GitHub, Clockify, etc.)',
                tags: ['mcp', 'tools', 'github', 'clockify'],
                quickSummary: ['Global & project-level MCP setup', 'JSON config validation'],
            },
        ],
    },
    {
        id: 'system',
        name: 'Editor & Shell',
        icon: '⚙️',
        items: [
            {
                id: 'setting-vs',
                label: 'Editor Settings',
                category: 'system',
                icon: '⚙️',
                description: 'Sync & merge settings for Antigravity, Cursor, and VS Code',
                tags: ['settings', 'vscode', 'cursor', 'antigravity'],
                quickSummary: ['Format on save & linter settings', 'Non-destructive JSON merge'],
            },
            {
                id: 'extensions-vs',
                label: 'Editor Extensions',
                category: 'system',
                icon: '📦',
                description: 'Sync & install recommended extensions across editors',
                tags: ['extensions', 'plugins'],
                quickSummary: ['Automated extension installation', 'Editor-specific recommendations'],
            },
            {
                id: 'git',
                label: 'Git & Shell Profiles',
                category: 'system',
                icon: '⚡',
                description: 'Sync Git Bash, Zsh profiles, and shell alias modules',
                tags: ['git', 'shell', 'zsh', 'profile'],
                quickSummary: ['Shell aliases & helper functions', 'Git commit template sync'],
            },
        ],
    },
    {
        id: 'diagnostics',
        name: 'Diagnostics & Tools',
        icon: '🩺',
        items: [
            {
                id: 'doctor',
                label: 'Environment Doctor',
                category: 'diagnostics',
                icon: '🩺',
                description: 'Verify Git, Node.js, CLI versions, and workspace readiness',
                tags: ['doctor', 'diagnostics', 'health', 'check'],
                quickSummary: ['Interactive IDE health checks', 'Actionable remediation tips'],
            },
            {
                id: 'update',
                label: 'Update Resources',
                category: 'diagnostics',
                icon: '🔄',
                description: 'Refresh installed agent skills and workspace templates',
                tags: ['update', 'refresh', 'upgrade'],
                quickSummary: ['Fetches latest upstream assets', 'Preserves user customizations'],
            },
        ],
    },
];

export const ALL_ROUTE_ITEMS: RouteItem[] = ROUTE_CATEGORIES.flatMap((c) => c.items);
