import React from 'react';
import { Box, Text } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { SelectMenu, MenuItem } from '../components/SelectMenu.js';

interface HomeViewProps {
    onSelectOption: (value: string) => void;
}

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

export const HomeView: React.FC<HomeViewProps> = ({ onSelectOption }) => {
    return (
        <Box flexDirection="column">
            <Header />
            <Text bold color="yellow">
                Main Dashboard:
            </Text>
            <SelectMenu items={MAIN_MENU_ITEMS} onSelect={(item) => onSelectOption(item.value)} />
            <Footer />
        </Box>
    );
};
