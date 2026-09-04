import type { McpManifest } from '../types.js';

export const MCPS: McpManifest[] = [
    {
        id: 'clockify',
        version: '0.0.1',
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
        version: '0.0.1',
        server: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-fetch'],
        },
    },
    {
        id: 'github',
        version: '0.0.1',
        server: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-github'],
            env: {
                GITHUB_PERSONAL_ACCESS_TOKEN: '',
            },
        },
    },
    {
        id: 'playwright-browser',
        version: '0.0.1',
        server: {
            command: 'npx',
            args: [
                '-y',
                '@playwright/mcp',
                '--user-data-dir=/Users/Tester/Library/Application Support/Google/Chrome/Default',
            ],
        },
    },
    {
        id: 'postgres',
        version: '0.0.1',
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
        version: '0.0.1',
        server: {
            command: 'npx',
            args: ['-y', '@yikizi/tavily-mcp'],
            env: {
                TAVILY_API_KEY: '',
            },
        },
    },
    {
        id: 'zodinet-timesheet',
        version: '0.0.1',
        server: {
            command: 'npx',
            args: [
                '-y',
                'mcp-remote',
                'https://intranet-api.vn02.zodinet.tech/api/mcp',
                '--header',
                'Authorization:Bearer ${TIMESHEET_PAT}',
            ],
            env: {
                TIMESHEET_PAT: '',
            },
        },
    },
];

