import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONFIGS } from '@assets/configs/index.js';

const configsDir = join(process.cwd(), 'assets/configs');

const readAsset = (config: string, ...parts: string[]) => readFile(join(configsDir, config, ...parts), 'utf8');

describe('OpenSpec profile configs', () => {
    it.each([
        ['openspec-fe', 'intent-driven-fe'],
        ['openspec-be', 'intent-driven-be'],
    ])('ships %s with %s schema', async (configName, schemaName) => {
        expect(CONFIGS[configName]).toMatchObject({
            name: configName,
            files: [{ src: configName, dest: 'openspec' }],
        });
        expect(await readAsset(configName, 'config.yaml')).toContain(`schema: ${schemaName}`);
        expect(existsSync(join(configsDir, configName, 'schemas', schemaName, 'schema.yaml'))).toBe(true);
    });

    it('requires FE planning data in design and task artifacts', async () => {
        const [schema, design, tasks] = await Promise.all([
            readAsset('openspec-fe', 'schemas', 'intent-driven-fe', 'schema.yaml'),
            readAsset('openspec-fe', 'schemas', 'intent-driven-fe', 'templates', 'design.md'),
            readAsset('openspec-fe', 'schemas', 'intent-driven-fe', 'templates', 'tasks.md'),
        ]);

        expect(schema).toContain('Canonical Reference and Allowlist');
        expect(schema).toContain('intent-driven-fe');
        expect(design).toContain('## Evidence Matrix');
        expect(tasks).toContain('[EXISTING]');
        expect(tasks).toContain('- [ ]');
    });

    it('requires BE planning data and safe migration tasks', async () => {
        const [schema, design, tasks] = await Promise.all([
            readAsset('openspec-be', 'schemas', 'intent-driven-be', 'schema.yaml'),
            readAsset('openspec-be', 'schemas', 'intent-driven-be', 'templates', 'design.md'),
            readAsset('openspec-be', 'schemas', 'intent-driven-be', 'templates', 'tasks.md'),
        ]);

        expect(schema).toContain('API and Shared Contract');
        expect(schema).toContain('intent-driven-be');
        expect(design).toContain('## Migration and Compatibility');
        expect(tasks).toContain('[MIGRATE]');
        expect(tasks).toContain('do not execute');
        expect(tasks).toContain('- [ ]');
    });
});

describe('OpenSpec profile propose and apply contracts', () => {
    it.each([
        [
            'openspec-fe',
            'intent-driven-fe',
            ['Canonical Reference and Allowlist', 'Component Inventory and Reuse', 'Evidence Matrix', '[EXISTING]'],
        ],
        [
            'openspec-be',
            'intent-driven-be',
            ['API and Shared Contract', 'Migration and Compatibility', 'Evidence and Verification', '[MIGRATE]'],
        ],
    ])('makes propose preserve complete %s profile template and task metadata', async (configName, schemaName, requiredFields) => {
        const schema = await readAsset(configName, 'schemas', schemaName, 'schema.yaml');

        const [design, tasks] = await Promise.all([
            readAsset(configName, 'schemas', schemaName, 'templates', 'design.md'),
            readAsset(configName, 'schemas', schemaName, 'templates', 'tasks.md'),
        ]);

        for (const field of requiredFields) expect(`${schema}\n${design}\n${tasks}`).toContain(field);
        expect(schema).toContain('Follow the template below exactly');
        expect(tasks).toContain('Phase goal');
        expect(tasks).toContain('Allowed scope');
        expect(tasks).toContain('Dependencies and constraints');
        expect(tasks).toContain('Acceptance requirements');
        expect(tasks).toContain('Verification');
    });

    it.each([
        ['openspec-fe', 'intent-driven-fe'],
        ['openspec-be', 'intent-driven-be'],
    ])('makes apply execute %s task phases as an acceptance-gated loop', async (configName, schemaName) => {
        const schema = await readAsset(configName, 'schemas', schemaName, 'schema.yaml');

        expect(schema).toContain('Process phases in dependency order');
        expect(schema).toContain('Do not start next phase before explicit acceptance');
        expect(schema).toContain('mark complete');
        expect(schema).toContain('checkbox');
        expect(schema).toContain('blockers, or clarification');
    });
});

describe('OpenSpec-only orchestration', () => {
    it.each([
        [
            'openspec-fe',
            'intent-driven-fe',
            [
                'only-one-canonical-ref-gate',
                'only-one-ui-design-direction',
                'only-one-component-inventory',
                'only-one-openspec-apply-gate',
                'only-one-phase-implementation-loop',
            ],
        ],
        [
            'openspec-be',
            'intent-driven-be',
            ['brainstorming', 'only-one-bounded-discovery', 'only-one-openspec-apply-gate', 'only-one-phase-implementation-loop'],
        ],
    ])('uses %s schema as planning and apply entrypoint', async (configName, schemaName, dependencies) => {
        const schema = await readAsset(configName, 'schemas', schemaName, 'schema.yaml');

        for (const dependency of dependencies) expect(schema).toContain(dependency);
        expect(schema).toContain('openspec instructions');
    });
});

describe('profile stage rules', () => {
    const ruleFiles = ['01-global-safety.md', '02-file-tags.md', '03-planning-contract.md', '04-apply-loop.md'];

    it.each([
        ['openspec-fe', 'intent-driven-fe'],
        ['openspec-be', 'intent-driven-be'],
    ])('%s ships ordered rules and requires them during design, tasks, and apply', async (configName, schemaName) => {
        const schema = await readAsset(configName, 'schemas', schemaName, 'schema.yaml');

        for (const ruleFile of ruleFiles) {
            expect(existsSync(join(configsDir, configName, 'schemas', schemaName, 'rules', ruleFile))).toBe(true);
            expect(schema).toContain(`rules/${ruleFile}`);
        }

        expect(schema).toContain('Before writing design.md, read');
        expect(schema).toContain('Before writing tasks.md, read');
        expect(schema).toContain('Before modifying source, read');
    });
});
