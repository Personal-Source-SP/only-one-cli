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

    it('includes proposal, spec, design, and task templates', async () => {
        const schema = await readAsset('schemas', schemaName, 'schema.yaml');
        const templates = await Promise.all(
            ['proposal.md', 'spec.md', 'design.md', 'tasks.md'].map((template) => readAsset('schemas', schemaName, 'templates', template)),
        );

        for (const template of templates) expect(template.length).toBeGreaterThan(0);
        expect(schema).toContain('Follow the template below exactly');
        expect(schema).toContain('Read context files, work through pending tasks');
    });
});
