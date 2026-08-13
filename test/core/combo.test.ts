import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { COMBOS } from '@assets/combos/index.js';
import { CONFIGS } from '@assets/configs/index.js';
import { MCPS } from '@assets/mcps/index.js';
import { PACKAGES } from '@assets/packages/index.js';
import { RULES } from '@assets/rules/index.js';
import { SKILLS } from '@assets/skills/index.js';
import { WORKFLOWS } from '@assets/workflows/index.js';
import { describe, expect, it } from 'vitest';
import { checkExistingSkills } from '@/core/skill/index.js';
import { buildComboDependencyPlan, summarizeComboInstallation, validateComboManifestReferences } from '@/core/combo/index.js';

describe('combo manifest preflight', () => {
    const registries = {
        packages: [{ id: 'direct-package', installer: { kind: 'npm' as const, packageName: 'direct-package' } }],
        rules: [
            {
                id: 'rule-a',
                sourceFile: 'rule-a.md',
                supportedTargets: [],
                requiredPackages: ['direct-package'],
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

describe('prebuilt combo completeness', () => {
    const productionRegistries = {
        packages: PACKAGES,
        rules: RULES,
        skills: SKILLS,
        configs: CONFIGS,
        workflows: WORKFLOWS,
        mcps: MCPS,
    };

    it('passes production registry preflight', () => {
        expect(() => validateComboManifestReferences(COMBOS, productionRegistries)).not.toThrow();
    });

    it.each([
        {
            comboId: 'frontend-flow',
            technologySkill: 'only-one-nextjs-development',
            architectureRule: 'next-architecture-stack',
            stackMcps: [],
            forbiddenSkill: 'only-one-nestjs-development',
        },
        {
            comboId: 'backend-flow',
            technologySkill: 'only-one-nestjs-development',
            architectureRule: 'nest-architecture-stack',
            stackMcps: [],
            forbiddenSkill: undefined,
        },
    ])('$comboId resolves complete stack mapping', ({ comboId, technologySkill, architectureRule, stackMcps, forbiddenSkill }) => {
        const combo = COMBOS.find(({ id }) => id === comboId);
        expect(combo).toBeDefined();
        if (!combo) return;

        const plan = buildComboDependencyPlan(combo, productionRegistries);
        expect(plan.skills).toContain(technologySkill);
        expect(plan.rules).toEqual(expect.arrayContaining([architectureRule, 'context-and-tools']));
        expect(new Set(plan.skills).size).toBe(plan.skills.length);
        expect(new Set(plan.workflows).size).toBe(plan.workflows.length);
        expect(new Set(plan.mcps).size).toBe(plan.mcps.length);
        if (forbiddenSkill) expect(plan.skills).not.toContain(forbiddenSkill);

        for (const ruleId of plan.rules) {
            const rule = RULES.find(({ id }) => id === ruleId);
            expect(plan.skills).toEqual(expect.arrayContaining(rule?.requiredSkills ?? []));
            expect(plan.mcps).toEqual(expect.arrayContaining(rule?.requiredMcps ?? []));
        }
        for (const workflowName of plan.workflows) {
            const workflow = WORKFLOWS.find(({ name }) => name === workflowName);
            expect(plan.mcps).toEqual(expect.arrayContaining(workflow?.requiredMcps ?? []));
        }
    });

    it('mcp-flow resolves defined MCP tools', () => {
        const combo = COMBOS.find(({ id }) => id === 'mcp-flow');
        expect(combo).toBeDefined();
        if (!combo) return;

        const plan = buildComboDependencyPlan(combo, productionRegistries);
        expect(plan.mcps).toEqual(expect.arrayContaining(['fetch', 'tavily', 'github', 'clockify', 'postgres']));
    });

    it('git-clockify-flow resolves skills, workflows and required MCPs', () => {
        const combo = COMBOS.find(({ id }) => id === 'git-clockify-flow');
        expect(combo).toBeDefined();
        if (!combo) return;

        const plan = buildComboDependencyPlan(combo, productionRegistries);
        expect(plan.skills).toEqual(expect.arrayContaining(['only-one-clockify-skill', 'only-one-pr-git-skill']));
        expect(plan.workflows).toEqual(expect.arrayContaining(['only-one-clockify', 'only-one-pr-git']));
        expect(plan.mcps).toEqual(expect.arrayContaining(['clockify', 'github']));
    });

    it('contains no removed generic IDs', () => {
        const referencedIds = COMBOS.flatMap((combo) => [...(combo.skills ?? []), ...(combo.rules ?? [])]);
        expect(referencedIds).not.toContain('nextjs-development');
        expect(referencedIds).not.toContain('nestjs-development');
        expect(referencedIds).not.toContain('architecture-stack');
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
