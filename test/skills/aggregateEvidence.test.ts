import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

import {
    ensureEvidenceDirs,
    extractPlannedTestsFromPlan,
    generateEvidenceReport,
} from '../../assets/agents/skills/only-one-apply/scripts/aggregate-evidence';

describe('Aggregate Evidence Module', () => {
    const testSlug = 'test-aggr-slug';
    const testDir = join(process.cwd(), 'only-one/tasks', testSlug);

    afterAll(() => {
        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true, force: true });
        }
    });

    it('should NOT create evidence directory if there are no images', () => {
        const dirs = ensureEvidenceDirs(testSlug, false, process.cwd());
        expect(dirs.evidenceDir).toBeNull();
        expect(existsSync(join(testDir, 'evidence'))).toBe(false);
    });

    it('should create evidence directory ONLY when hasImages is true', () => {
        const dirs = ensureEvidenceDirs(testSlug, true, process.cwd());
        expect(dirs.evidenceDir).not.toBeNull();
        expect(existsSync(join(testDir, 'evidence'))).toBe(true);
    });

    it('should extract planned tests from plan.md markdown table', () => {
        const dummyPlan = `
### 3.2. Test Case Specification Matrix

| Test ID | Module Mục tiêu | Loại Kịch bản | Điều kiện Đầu vào / Thao tác | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-TERM-01** | \`terminal-contract\` | Happy Path | Chuỗi log chứa ANSI | Khử sạch ANSI |
| **TC-API-01** | \`api-contract\` | Happy Path | Bắn burst request | P95 latency chuẩn |
`;
        const planPath = join(testDir, 'plan.md');
        ensureEvidenceDirs(testSlug, true, process.cwd());
        writeFileSync(planPath, dummyPlan, 'utf8');

        const tests = extractPlannedTestsFromPlan(planPath);
        expect(tests).toHaveLength(2);
        expect(tests[0].id).toBe('TC-TERM-01');
        expect(tests[0].module).toBe('terminal-contract');
        expect(tests[1].id).toBe('TC-API-01');
    });

    it('should generate well-structured evidence.md with planned tests and runtime sanity output', () => {
        const report = generateEvidenceReport({
            taskSlug: testSlug,
            title: 'Test Verification Task',
            testSuite: {
                command: 'npm test',
                status: 'PASS',
                passed: 10,
                failed: 0,
                total: 10,
                duration: '1.2s',
            },
            plannedTestCases: [{ id: 'TC-01', module: 'core', description: 'Check login', status: 'PASS' }],
            runtimeSanityChecks: [
                {
                    command: 'only-one --help',
                    exitCode: 0,
                    outputSnippet: 'Usage: only-one [options]',
                    status: 'PASS',
                },
            ],
        });

        expect(report).toContain('# Runtime Verification Report: Test Verification Task');
        expect(report).toContain('TC-01');
        expect(report).toContain('only-one --help');
        expect(report).toContain('Usage: only-one [options]');
    });
});
