import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SKILLS } from '@assets/skills/index.js';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';

const packageRoot = resolvePackageRoot(import.meta.url);

const nextSkillNames = [
    'next-dev-loop',
    'next-cache-components-adoption',
    'next-cache-components-optimizer',
    'next-partial-prefetching-adoption',
];

describe('Next.js skill registry', () => {
    it('registers skill directories with matching SKILL.md frontmatter', () => {
        for (const skillName of nextSkillNames) {
            const manifest = SKILLS.find((skill) => skill.name === skillName);
            const skillPath = join(packageRoot, 'assets/skills', skillName, 'SKILL.md');

            expect(manifest).toBeDefined();
            expect(existsSync(skillPath)).toBe(true);
            expect(readFileSync(skillPath, 'utf-8')).toContain(`name: ${skillName}`);
        }
    });
});
