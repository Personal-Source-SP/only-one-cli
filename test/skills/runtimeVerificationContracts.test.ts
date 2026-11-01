import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { buildConcurrencyScript, saveApiEvidence, validateApiDigest } from '../../assets/agents/skills/api-tester/scripts/api-contract';
import { formatScreenshotPath, validateBrowserDigest } from '../../assets/agents/skills/browser-tester/scripts/browser-contract';
import {
    isolateFailureStackTrace,
    parseTestStats,
    saveTerminalLog,
    stripAnsiColors,
} from '../../assets/agents/skills/terminal-runner/scripts/terminal-contract';

describe('Runtime Verification Contracts', () => {
    describe('Terminal Runner Contract', () => {
        it('should strip ANSI escape sequences cleanly', () => {
            const rawAnsi = '\u001b[32mPASS\u001b[39m \u001b[1mtest/service.test.ts\u001b[22m';
            expect(stripAnsiColors(rawAnsi)).toBe('PASS test/service.test.ts');
        });

        it('should isolate failure stack trace to <= 20 lines', () => {
            const longTrace = Array.from({ length: 45 }, (_, i) => `    at function${i} (file.ts:${i})`).join('\n');
            const fullLog = `Error: Something failed\n${longTrace}`;
            const isolated = isolateFailureStackTrace(fullLog);
            const lineCount = isolated.split('\n').length;
            expect(lineCount).toBeLessThanOrEqual(20);
        });

        it('should parse test statistics from vitest output', () => {
            const output = 'Tests  24 passed (24)\nDuration  1.25s';
            const stats = parseTestStats(output);
            expect(stats.passed).toBe(24);
            expect(stats.failed).toBe(0);
            expect(stats.total).toBe(24);
        });

        it('should format and save terminal log path', () => {
            const logLink = saveTerminalLog('dummy-slug', 'npm-test', 'PASS all', process.cwd());
            expect(logLink).toMatch(/^file:\/\/\/.*dummy-slug\/evidence\/terminal\/npm-test\.log$/);
        });
    });

    describe('Browser Tester Contract', () => {
        it('should validate complete browser digest format', () => {
            const validDigest = `
### Browser Digest: [Login Flow]
- Status: PASS
- Visual Evidence: file:///artifacts/login_success.png
- DevTools Console: 0 Errors
- Network Requests: 0 Failed (4xx/5xx: None)
`;
            const result = validateBrowserDigest(validDigest);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject browser digest containing raw DOM tree dump', () => {
            const rawDomDigest = `
### Browser Digest
- Status: PASS
<div class="header"><button id="submit">Login</button></div>
`;
            const result = validateBrowserDigest(rawDomDigest);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes('DOM'))).toBe(true);
        });

        it('should format screenshot path with file URI scheme', () => {
            const formatted = formatScreenshotPath('artifacts/shot.png');
            expect(formatted).toMatch(/^file:\/\/\//);
        });
    });

    describe('API Tester Contract', () => {
        it('should build concurrency burst command structure', () => {
            const script = buildConcurrencyScript({
                url: 'http://localhost:3000/api/orders',
                concurrency: 10,
                method: 'POST',
            });
            expect(script).toContain('http://localhost:3000/api/orders');
            expect(script).toContain('10');
        });

        it('should validate complete API digest format', () => {
            const validDigest = `
### API Digest: [Race Condition]
- Status: PASS
- Concurrency Outcome: 1 Succeeded, 9 Blocked
- Performance Metrics: P95: 25ms
- Data Integrity: PASS
`;
            const result = validateApiDigest(validDigest);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject API digest with excessive JSON echo (> 20 lines)', () => {
            const jsonEcho = JSON.stringify(
                Array.from({ length: 30 }, (_, i) => ({ id: i })),
                null,
                2,
            );
            const digestWithEcho = `
### API Digest
- Status: PASS
\`\`\`json
${jsonEcho}
\`\`\`
`;
            const result = validateApiDigest(digestWithEcho);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes('Excessive'))).toBe(true);
        });
    });

    describe('API Tester Persistence', () => {
        it('should save API payload evidence to json file', () => {
            const payloadLink = saveApiEvidence('dummy-slug', 'get-order', { status: 200 }, process.cwd());
            expect(payloadLink).toMatch(/^file:\/\/\/.*dummy-slug\/evidence\/api\/get-order\.json$/);
        });
    });

    afterAll(() => {
        const dummyDir = join(process.cwd(), 'only-one/tasks/dummy-slug');

        if (existsSync(dummyDir)) {
            rmSync(dummyDir, { recursive: true, force: true });
        }
    });

    describe('Subagent Definition Files Integrity', () => {
        it('should verify all 3 subagent definitions exist and have correct tool scopes', () => {
            const terminalPath = resolve(process.cwd(), 'assets/agents/subagents/terminal-runner.md');
            const browserPath = resolve(process.cwd(), 'assets/agents/subagents/browser-tester.md');
            const apiPath = resolve(process.cwd(), 'assets/agents/subagents/api-tester.md');

            expect(existsSync(terminalPath)).toBe(true);
            expect(existsSync(browserPath)).toBe(true);
            expect(existsSync(apiPath)).toBe(true);

            expect(readFileSync(terminalPath, 'utf8')).toMatch(/run_command/);
            expect(readFileSync(browserPath, 'utf8')).toMatch(/playwright-browser|browser_/);
        });
    });
});
