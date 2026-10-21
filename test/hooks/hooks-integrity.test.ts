import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Hooks Architecture Integrity', () => {
    const hooksDir = join(process.cwd(), 'assets', 'agents', 'hooks');

    it('should contain block-heavy-scripts hook with correct blocking patterns', () => {
        const scriptPath = join(hooksDir, 'block-heavy-scripts.sh');
        expect(existsSync(scriptPath)).toBe(true);
        const content = readFileSync(scriptPath, 'utf8');
        expect(content).toContain('npm run build');
        expect(content).toContain('npm run lint');
        expect(content).toContain('exit 1');
    });

    it('should contain no-secrets hook detecting hardcoded tokens', () => {
        const scriptPath = join(hooksDir, 'no-secrets.sh');
        expect(existsSync(scriptPath)).toBe(true);
        const content = readFileSync(scriptPath, 'utf8');
        expect(content).toContain('SECRET_REGEX');
        expect(content).toContain('exit 2');
    });

    it('should contain format-on-edit hook triggering prettier', () => {
        const scriptPath = join(hooksDir, 'format-on-edit.sh');
        expect(existsSync(scriptPath)).toBe(true);
        const content = readFileSync(scriptPath, 'utf8');
        expect(content).toContain('prettier');
    });

    it('should contain test-gate hook enforcing exit 2 on failure', () => {
        const scriptPath = join(hooksDir, 'test-gate.sh');
        expect(existsSync(scriptPath)).toBe(true);
        const content = readFileSync(scriptPath, 'utf8');
        expect(content).toContain('npm test');
        expect(content).toContain('exit 2');
        expect(content).toContain('stop_hook_active');
    });

    it('should contain protect-configs hook guarding critical configuration files', () => {
        const scriptPath = join(hooksDir, 'protect-configs.sh');
        expect(existsSync(scriptPath)).toBe(true);
        const content = readFileSync(scriptPath, 'utf8');
        expect(content).toContain('.agents/hooks');
        expect(content).toContain('exit 1');
    });
});
