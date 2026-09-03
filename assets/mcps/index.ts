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
        id: 'memory',
        version: '0.0.1',
        server: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-memory'],
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

