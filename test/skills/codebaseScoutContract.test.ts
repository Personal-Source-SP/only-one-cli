import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
    buildAstGrepCommand,
    shouldDelegateToScout,
    validateTechnicalDigest,
} from '../../assets/agents/skills/codebase-scout/scripts/scout-contract';

describe('Codebase Scout Contract & Heuristics', () => {
    describe('shouldDelegateToScout', () => {
        it('should use fast-path for <= 2 files with known paths', () => {
            expect(shouldDelegateToScout({ fileCount: 1, isKnownPath: true })).toBe(false);
            expect(shouldDelegateToScout({ fileCount: 2, isKnownPath: true })).toBe(false);
        });

        it('should delegate to scout when fileCount > 2', () => {
            expect(shouldDelegateToScout({ fileCount: 3, isKnownPath: true })).toBe(true);
            expect(shouldDelegateToScout({ fileCount: 10, isKnownPath: true })).toBe(true);
        });

        it('should delegate to scout for unknown paths or deep queries', () => {
            expect(shouldDelegateToScout({ fileCount: 1, isKnownPath: false })).toBe(true);
            expect(shouldDelegateToScout({ fileCount: 2, isKnownPath: true, queryDepth: 'deep' })).toBe(true);
        });
    });

    describe('validateTechnicalDigest', () => {
        it('should validate complete technical digest format', () => {
            const validDigest = `
### Technical Digest
- Seam Anchors: auth.service.ts#L12-L35
- Exported Signatures: login(dto: LoginDto): Promise<Token>
- Dependencies: JwtService, UserRepository
- Invariants: Password must be hashed before comparison
`;
            const result = validateTechnicalDigest(validDigest);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject digest missing required fields', () => {
            const invalidDigest = `
### Technical Digest
Just some random summary text without proper metadata.
`;
            const result = validateTechnicalDigest(invalidDigest);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should reject digest with excessive code echo (> 20 lines)', () => {
            const codeEcho = Array.from({ length: 25 }, (_, i) => `const line${i} = ${i};`).join('\n');
            const digestWithEcho = `
### Technical Digest
- Seam Anchors: auth.ts#L1-L50
- Exported Signatures: test()
- Invariants: none
\`\`\`ts
${codeEcho}
\`\`\`
`;
            const result = validateTechnicalDigest(digestWithEcho);
            expect(result.valid).toBe(false);
            expect(result.errors.some((err) => err.includes('Excessive'))).toBe(true);
        });
    });

    describe('buildAstGrepCommand', () => {
        it('should build correct ast-grep command with pattern and path', () => {
            const cmd = buildAstGrepCommand({ pattern: 'useAuth()', targetPath: 'src/' });
            expect(cmd).toBe("ast-grep scan -p 'useAuth()' src/");
        });

        it('should include language flag when specified', () => {
            const cmd = buildAstGrepCommand({ pattern: 'class $NAME', targetPath: 'src/', lang: 'typescript' });
            expect(cmd).toBe("ast-grep scan -p 'class $NAME' --lang typescript src/");
        });
    });

    describe('Scout Specification Files Integrity', () => {
        it('should verify codebase-scout.md exists and enforces read-only', () => {
            const subagentPath = resolve(process.cwd(), 'assets/agents/subagents/codebase-scout.md');
            expect(existsSync(subagentPath)).toBe(true);
            const content = readFileSync(subagentPath, 'utf8');
            expect(content).toMatch(/read-only|strictly read-only/i);
            expect(content).toMatch(/ast-grep/i);
        });
    });
});
