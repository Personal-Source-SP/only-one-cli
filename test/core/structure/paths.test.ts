import { describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
    buildStructureFilename,
    isExplicitBlueprintFileOutput,
    listStructureRelativePaths,
    resolveStructureBlueprintPath,
    sanitizeStructureSegment,
    StructurePathResolutionError,
} from '@src/core/structure/paths.js';
import { ONLY_ONE_DIR } from '@src/core/prebuilt/index-output.js';

describe('structure paths', () => {
    it('sanitizes filename segments', () => {
        expect(sanitizeStructureSegment('Acme Corp')).toBe('acme-corp');
        expect(sanitizeStructureSegment('Payments.API')).toBe('payments-api');
    });

    it('builds structural filename from org and source', () => {
        expect(buildStructureFilename('Acme Corp', 'Payments.API')).toBe('acme-corp-payments-api-structural.md');
    });

    it('detects explicit blueprint file output', () => {
        expect(isExplicitBlueprintFileOutput('docs/my-structural.md')).toBe(true);
        expect(isExplicitBlueprintFileOutput('.only-one/custom')).toBe(false);
    });

    it('resolves default path under structure', async () => {
        const projectDir = await mkdtemp(join(tmpdir(), 'hybrid-structural-path-'));

        const path = resolveStructureBlueprintPath(projectDir, {
            organization: 'acme',
            project: 'payments-api',
        });

        expect(path).toBe(join(projectDir, ONLY_ONE_DIR, 'structure', 'acme-payments-api-structural.md'));
    });

    it('uses default organization segment when missing', () => {
        const projectDir = '/tmp/proj';
        const path = resolveStructureBlueprintPath(projectDir, { project: 'my-app' });
        expect(path).toContain('default-my-app-structural.md');
    });

    it('throws when project is missing for default layout', () => {
        expect(() => resolveStructureBlueprintPath('/tmp/proj', {})).toThrow(StructurePathResolutionError);
    });

    it('lists structural files for bundle', async () => {
        const outputDir = await mkdtemp(join(tmpdir(), 'hybrid-structural-list-'));
        await mkdir(join(outputDir, 'structure'), { recursive: true });
        await writeFile(join(outputDir, 'structure', 'acme-app-structural.md'), '# blueprint', 'utf-8');

        expect(listStructureRelativePaths(outputDir)).toEqual(['structure/acme-app-structural.md']);
    });
});
