import { describe, it, expect } from 'vitest';
import net from 'node:net';
import { findAvailablePort, createUiCommand } from '../../src/commands/ui/command.js';

describe('uiCommand & port resolution', () => {
    it('should create command with ui and dashboard alias', () => {
        const dummyDeps: any = { stdout: () => {} };
        const cmd = createUiCommand(dummyDeps);
        expect(cmd.name()).toBe('ui');
        expect(cmd.aliases()).toContain('dashboard');
    });

    it('should return available port when requested port is free', async () => {
        const port = await findAvailablePort(49152);
        expect(port).toBeGreaterThanOrEqual(49152);
    });

    it('should find next available port when current is in use', async () => {
        const server = net.createServer();
        await new Promise<void>((resolve) => server.listen(49200, () => resolve()));

        const nextPort = await findAvailablePort(49200);
        expect(nextPort).toBeGreaterThan(49200);

        server.close();
    });
});
