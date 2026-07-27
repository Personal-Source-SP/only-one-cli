import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkExistingSkills } from '@/core/skill/index.js';
import { buildComboDependencyPlan, summarizeComboInstallation, validateComboManifestReferences } from '@/core/combo/index.js';

describe('combo manifest preflight', () => {
    const registries = {
        packages: [{ id: 'direct-package', installer: { kind: 'npm' as const, packageName: 'direct-package' } }],
        plugins: [{ id: 'direct-plugin', supportedTargets: [], actions: {} }],
        rules: [
            {
                id: 'rule-a',
                sourceFile: 'rule-a.md',
                supportedTargets: [],
                requiredPackages: ['direct-package'],
                requiredPlugins: ['direct-plugin'],
                requiredSkills: ['rule-skill'],
                requiredMcps: ['rule-mcp'],
            },
        ],
        skills: [
            { name: 'direct-skill', description: '' },
            { name: 'rule-skill', description: '' },
        ],
        configs: { 'config-a': { name: 'config-a', files: [] } },
        workflows: [{ name: 'workflow-a', description: '', requiredMcps: ['workflow-mcp'] }],
        mcps: [
            { id: 'direct-mcp', server: { command: 'echo' } },
            { id: 'rule-mcp', server: { command: 'echo' } },
            { id: 'workflow-mcp', server: { command: 'echo' } },
        ],
    };

    it('rejects unknown component IDs with combo and field context', () => {
        expect(() =>
            validateComboManifestReferences([{ id: 'bad-flow', name: 'Bad flow', packages: ['missing-package'] }], registries),
        ).toThrow("Combo 'bad-flow' references unknown packages ID 'missing-package'");
    });

    it('does not infer skills from workflow metadata', () => {
        const plan = buildComboDependencyPlan({ id: 'flow', name: 'Flow', workflows: ['workflow-a'] }, registries);

        expect(plan.skills).toEqual([]);
    });

    it('deduplicates direct and transitive dependencies in declaration order', () => {
        expect(
            buildComboDependencyPlan(
                {
                    id: 'flow',
                    name: 'Flow',
                    packages: ['direct-package'],
                    plugins: ['direct-plugin'],
                    rules: ['rule-a'],
                    skills: ['direct-skill'],
                    configs: ['config-a'],
                    workflows: ['workflow-a'],
                    mcps: ['direct-mcp'],
                },
                registries,
            ),
        ).toEqual({
            packages: ['direct-package'],
            plugins: ['direct-plugin'],
            rules: ['rule-a'],
            skills: ['direct-skill', 'rule-skill'],
            configs: ['config-a'],
            workflows: ['workflow-a'],
            mcps: ['direct-mcp', 'rule-mcp', 'workflow-mcp'],
        });
    });

    it('reports partial unless every applicable component exists', () => {
        expect(
            summarizeComboInstallation([
                { type: 'config', id: 'config:a', name: 'a', label: 'Config a', exists: true, status: 'installed', meta: {} },
                { type: 'skill', id: 'skill:cursor:b', name: 'b', label: 'Skill b', exists: false, status: 'missing', meta: {} },
            ]),
        ).toBe('partial');
    });

    it('reports installed only when every applicable component exists', () => {
        expect(
            summarizeComboInstallation([
                { type: 'config', id: 'config:a', name: 'a', label: 'Config a', exists: true, status: 'installed', meta: {} },
                { type: 'mcp', id: 'mcp:qoder:b', name: 'b', label: 'MCP b', exists: false, status: 'not-applicable', meta: {} },
            ]),
        ).toBe('installed');
    });
});

describe('combo component existence', () => {
    it('requires SKILL.md instead of treating an empty skill directory as installed', async () => {
        const projectDir = await mkdtemp(join(tmpdir(), 'combo-skill-exists-'));
        const tool = { value: 'cursor', name: 'Cursor', skillsDir: '.cursor' };
        const skillDir = join(projectDir, '.cursor', 'skills', 'grill-me');

        try {
            await mkdir(skillDir, { recursive: true });
            expect((await checkExistingSkills(projectDir, [tool], ['grill-me']))[0]?.exists).toBe(false);

            await writeFile(join(skillDir, 'SKILL.md'), '# Grill me\n');
            expect((await checkExistingSkills(projectDir, [tool], ['grill-me']))[0]?.exists).toBe(true);
        } finally {
            await rm(projectDir, { recursive: true, force: true });
        }
    });
});
