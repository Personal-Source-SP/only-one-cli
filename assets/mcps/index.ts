import type { McpManifest } from '../types.js';

export const MCPS: McpManifest[] = [
    {
        id: 'clockify',
        server: {
            command: 'npx',
            args: ['-y', '@yikizi/clockify-mcp'],
            env: {
                CLOCKIFY_API_KEY: '',
            },
        },
    },
    {
        id: 'fetch',
        server: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-fetch'],
        },
    },
    {
        id: 'github',
        server: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-github'],
            env: {
                GITHUB_PERSONAL_ACCESS_TOKEN: '',
            },
        },
    },
    {
        id: 'memory',
        server: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-memory'],
        },
    },
    {
        id: 'notion',
        server: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-notion'],
            env: {
                NOTION_API_KEY: '',
            },
        },
    },
    {
        id: 'postgres',
        server: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-postgres'],
            env: {
                PG_CONNECTION_STRING: '',
            },
        },
    },
    {
        id: 'tavily',
        server: {
            command: 'npx',
            args: ['-y', '@yikizi/tavily-mcp'],
            env: {
                TAVILY_API_KEY: '',
            },
        },
    },
];
