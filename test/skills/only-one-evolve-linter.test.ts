import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { generateRuleTemplate, scaffoldLinterRule } from '@assets/skills/only-one-evolve/scripts/scaffold-linter-rule.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('only-one-evolve AST Linter Generator', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'evolve-linter-test-'));
    });

    afterEach(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    it('sinh nội dung template AST rule chính xác với node selector', () => {
        const template = generateRuleTemplate('no-hardcoded-api', 'Chặn hardcode URL API', 'CallExpression');
        expect(template).toContain('export const noHardcodedApiRule');
        expect(template).toContain('CallExpression(node)');
        expect(template).toContain('Chặn hardcode URL API');
    });

    it('tạo file rule trên ổ đĩa thành công', async () => {
        const rulePath = await scaffoldLinterRule({
            ruleSlug: 'no-direct-db',
            description: 'Chặn gọi DB từ client component',
            astNode: 'ImportDeclaration',
            targetDir: tempDir,
        });

        const exists = await fs.stat(rulePath);
        expect(exists.isFile()).toBe(true);
        const content = await fs.readFile(rulePath, 'utf-8');
        expect(content).toContain('noDirectDbRule');
    });
});
