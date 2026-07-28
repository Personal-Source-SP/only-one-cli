import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONFIGS } from '@assets/configs/index.js';

const configsDir = join(process.cwd(), 'assets/configs');
const configName = 'openspec';
const schemaName = 'intent-driven';
const readAsset = (...parts: string[]) => readFile(join(configsDir, configName, ...parts), 'utf8');

describe('OpenSpec config', () => {
    it('ships one default intent-driven schema', async () => {
        expect(CONFIGS).toEqual({
            openspec: {
                name: configName,
                description: 'OpenSpec default rules configuration',
                files: [{ src: configName, dest: 'openspec' }],
            },
        });
        expect(await readAsset('config.yaml')).toContain(`schema: ${schemaName}`);
        expect(existsSync(join(configsDir, configName, 'schemas', schemaName, 'schema.yaml'))).toBe(true);
    });

    it('ships Epic planning templates and guards', async () => {
        const schema = await readAsset('schemas', schemaName, 'schema.yaml');
        const config = await readAsset('config.yaml');
        const templates = await Promise.all(
            ['proposal.md', 'spec.md', 'architecture.md', 'context.md', 'design.md', 'scaffold.md', 'tasks.md'].map((template) =>
                readAsset('schemas', schemaName, 'templates', template),
            ),
        );

        for (const template of templates) expect(template.length).toBeGreaterThan(0);
        expect(schema).toContain('id: architecture');
        expect(schema).toContain('id: context');
        expect(schema).toContain('id: scaffold');
        expect(schema).toContain('      - scaffold');
        expect(schema).toContain('Running /opsx-apply confirms user review');
        expect(schema).toContain('Do not use placeholders, wildcards, globs');
        expect(schema).toContain('do not create implementation files');
        expect(config).toContain('Running /opsx-apply confirms the user reviewed current planning artifacts');
        expect(config).toContain('Do not patch code to bypass an architecture or specification contract');
        expect(templates[3]).toContain('explicit repository-relative paths only');
        expect(templates[5]).toContain('Review complete before `/opsx-apply`');
    });
});
