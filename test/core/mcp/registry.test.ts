import { describe, expect, it } from 'vitest';
import { MCPS } from '@assets/mcps/index.js';
import { readMcpManifests } from '@/core/mcp/registry.js';

describe('MCP Registry & Predefined Manifests', () => {
    it('registers playwright-browser with required command and user-data-dir argument', async () => {
        const { manifests, warnings } = await readMcpManifests();
        expect(warnings).toHaveLength(0);

        const playwright = manifests.find((m) => m.id === 'playwright-browser');
        expect(playwright).toBeDefined();
        expect(playwright?.server.command).toBe('npx');
        expect(playwright?.server.args).toEqual([
            '-y',
            '@playwright/mcp',
            '--user-data-dir=/Users/Tester/Library/Application Support/Google/Chrome/Default',
        ]);
    });

    it('ensures playwright-browser has a valid decimal version in assets manifest', () => {
        const entry = MCPS.find((m) => m.id === 'playwright-browser');
        expect(entry).toBeDefined();
        expect(entry?.version).toBe('0.0.1');
    });
});
