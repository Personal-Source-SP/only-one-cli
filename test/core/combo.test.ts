import { describe, expect, it } from 'vitest';
import { buildComboDependencyPlan, validateComboManifestReferences } from '@/core/combo/index.js';

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
            { name: 'workflow-skill', description: '' },
        ],
        configs: { 'config-a': { name: 'config-a', files: [] } },
        workflows: [{ name: 'workflow-a', description: '', requiredSkills: ['workflow-skill'], requiredMcps: ['workflow-mcp'] }],
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
            skills: ['direct-skill', 'rule-skill', 'workflow-skill'],
            configs: ['config-a'],
            workflows: ['workflow-a'],
            mcps: ['direct-mcp', 'rule-mcp', 'workflow-mcp'],
        });
    });
});
