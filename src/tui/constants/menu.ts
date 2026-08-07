import type { MenuItem } from '../types/navigation.js';

export const MAIN_MENU_ITEMS: MenuItem[] = [
    {
        label: 'Initialize Workspace (init)',
        value: 'init',
        icon: '🚀',
        description: 'Initialize workspace configs, rules, and templates',
    },
    {
        label: 'Apply Predefined Combos (combo)',
        value: 'combo',
        icon: '✨',
        description: 'Initialize project using predefined tool, package & skill combos',
    },
    {
        label: 'Sync Agent Skills (skill)',
        value: 'skill',
        icon: '🧩',
        description: 'Manage & sync custom agent skills for Cursor / VS Code',
    },
    {
        label: 'Sync Agent Workflows (workflow)',
        value: 'workflow',
        icon: '⚡',
        description: 'Manage & sync agent workflow templates',
    },
    {
        label: 'Sync Agent Rules (rule)',
        value: 'rule',
        icon: '📝',
        description: 'Manage & sync workspace agent rules (.agents/AGENTS.md)',
    },
    {
        label: 'Configure MCP Servers (mcp)',
        value: 'mcp',
        icon: '🌐',
        description: 'Configure global Model Context Protocol servers (GitHub, Clockify, etc.)',
    },
    {
        label: 'Sync Editor Settings (setting-vs)',
        value: 'setting-vs',
        icon: '⚙️',
        description: 'Sync & merge settings for Antigravity / Cursor / VS Code',
    },
    {
        label: 'Sync Editor Extensions (extensions-vs)',
        value: 'extensions-vs',
        icon: '📦',
        description: 'Sync & install extensions for Antigravity / Cursor / VS Code',
    },
    {
        label: 'Scaffold Blueprint Structure (structure-generate)',
        value: 'structure-generate',
        icon: '🏗️',
        description: 'Scaffold structural blueprint files for agents',
    },
    {
        label: 'Run Environment Doctor (doctor)',
        value: 'doctor',
        icon: '🩺',
        description: 'Check Git, Node.js, and workspace readiness',
    },
    {
        label: 'Refresh Skills & Templates (update)',
        value: 'update',
        icon: '🔄',
        description: 'Refresh installed agent skills and workspace templates',
    },
    {
        label: 'Exit',
        value: 'exit',
        icon: '❌',
        description: 'Quit Only-One CLI TUI',
    },
];

export const INIT_MENU_ITEMS: MenuItem[] = [
    {
        label: 'Full Workspace Setup',
        value: 'full',
        icon: '🚀',
        description: 'Initialize baseline rules, agents, skills, and settings',
    },
    {
        label: 'Workspace Rules Only',
        value: 'rules',
        icon: '📝',
        description: 'Create/update .agents/AGENTS.md with workspace standards',
    },
    {
        label: 'Workflows Only',
        value: 'workflows',
        icon: '⚡',
        description: 'Initialize predefined agent workflow templates',
    },
];

export const SKILL_MENU_ITEMS: MenuItem[] = [
    {
        label: 'Sync Built-in Agent Skills',
        value: 'sync',
        icon: '🔄',
        description: 'Sync official skills to .agents/skills/',
    },
    {
        label: 'List Available Skills',
        value: 'list',
        icon: '📋',
        description: 'List all custom and workspace agent skills',
    },
];

export const MCP_MENU_ITEMS: MenuItem[] = [
    {
        label: 'View Registered MCP Servers',
        value: 'list',
        icon: '🔍',
        description: 'Check status of GitHub, Clockify, and custom MCP servers',
    },
    {
        label: 'Sync MCP Configurations',
        value: 'sync',
        icon: '⚡',
        description: 'Ensure global MCP settings match local environment',
    },
];

export const SETTINGS_MENU_ITEMS: MenuItem[] = [
    {
        label: 'Sync Cursor Settings & Keybindings',
        value: 'sync-cursor',
        icon: '🖥️',
        description: 'Synchronize settings.json and keybindings for Cursor',
    },
    {
        label: 'Sync VS Code Extensions List',
        value: 'sync-vscode',
        icon: '📦',
        description: 'Merge recommended extensions across workstations',
    },
];
