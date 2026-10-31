import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { COMBOS } from '../../assets/agents/combos/index.js';
import { PACKAGES } from '../../assets/agents/packages/index.js';

describe('Doubt-Driven Development External Package Contract', () => {
    it('should declare doubt-driven-development package from addyosmani/agent-skills', () => {
        const pkg = PACKAGES.find((p) => p.id === 'doubt-driven-development');

        expect(pkg).toBeDefined();
        expect(pkg?.installer.kind).toBe('skills');

        if (pkg?.installer.kind === 'skills') {
            expect(pkg.installer.source).toBe('addyosmani/agent-skills');
            expect(pkg.installer.skillName).toBe('doubt-driven-development');
        }
    });

    it('should include doubt-driven-development in only-one-flow combo packages', () => {
        const combo = COMBOS.find((c) => c.id === 'only-one-flow');

        expect(combo).toBeDefined();
        expect(combo?.version).toBe('0.0.19');
        expect(combo?.packages).toContain('doubt-driven-development');
    });

    it('should integrate doubt-driven-development into only-one-idea SKILL.md protocol', () => {
        const skillPath = resolve(process.cwd(), 'assets/agents/skills/only-one-idea/SKILL.md');
        const content = readFileSync(skillPath, 'utf8');

        expect(content).toContain('doubt-driven-development');
        expect(content).toContain('Doubt Cycle');
    });

    it('should bump CLI package.json version to 1.0.5', () => {
        const pkgPath = resolve(process.cwd(), 'package.json');
        const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf8'));

        expect(pkgJson.version).toBe('1.0.5');
    });
});
