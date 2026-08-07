import type { MenuItem } from '../types/navigation.js';

export const MAIN_MENU_ITEMS: MenuItem[] = [
    {
        label: 'Initialize Workspace',
        value: 'init',
        icon: '🚀',
        description: 'Initialize workspace configs, rules, and templates',
    },
    {
        label: 'Sync Agent Skills',
        value: 'skill',
        icon: '🧩',
        description: 'Manage & sync custom agent skills for Cursor / VS Code',
    },
    {
        label: 'Configure MCP Servers',
        value: 'mcp',
        icon: '🔌',
        description: 'Configure global Model Context Protocol servers (GitHub, Clockify, etc.)',
    },
    {
        label: 'Sync Editor Settings & Extensions',
        value: 'setting-vs',
        icon: '⚙️',
        description: 'Sync & merge settings for Cursor / VS Code',
    },
    {
        label: 'Run Environment Doctor',
        value: 'doctor',
        icon: '🩺',
        description: 'Check Git, Node.js, and workspace readiness',
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
