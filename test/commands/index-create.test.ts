import { describe, expect, it, vi } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ONLY_ONE_CONFIG_FILE, ONLY_ONE_DIR } from '@src/core/prebuilt/index-output.js';
import { createProgram } from '@src/index.js';
import { assertIndexingReadiness } from '@src/core/doctor/checks.js';

vi.mock('@src/core/doctor/checks.js', () => ({
    assertIndexingReadiness: vi.fn().mockResolvedValue({
        status: 'READY',
        mode: 'local',
        modeSource: 'config',
        checks: [],
        remediation: [],
    }),
}));

vi.mock('@src/core/prebuilt/indexers.js', () => ({
    runGitnexus: vi.fn().mockResolvedValue(undefined),
    runCocoindex: vi.fn().mockResolvedValue(undefined),
    createManifest: vi.fn().mockResolvedValue(undefined),
}));

describe('index:create command', () => {
    it('checks readiness and config under the target repo path, not shell cwd', async () => {
        const root = await mkdtemp(join(tmpdir(), 'only-one-create-root-'));
        const repo = join(root, 'orien-trade-backend');
        const writes: string[] = [];

        try {
            await mkdir(join(repo, ONLY_ONE_DIR), { recursive: true });
            await writeFile(
                join(repo, ONLY_ONE_DIR, ONLY_ONE_CONFIG_FILE),
                ['server: http://api', 'project: backend-proj-99', 'index_mode: local'].join('\n'),
                'utf-8',
            );

            const program = createProgram({
                cwd: root,
                env: { HYBRID_PROJECT: 'wrong-env-id' },
                fetcher: vi.fn(),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['index:create', 'orien-trade-backend', '--skip-gitnexus', '--skip-cocoindex'], {
                from: 'user',
            });

            expect(assertIndexingReadiness).toHaveBeenCalledWith(repo, undefined);
            expect(writes.some((line) => line.includes(join('orien-trade-backend', ONLY_ONE_DIR, ONLY_ONE_CONFIG_FILE)))).toBe(true);

            const { runGitnexus, runCocoindex, createManifest } = await import('@src/core/prebuilt/indexers.js');
            expect(runGitnexus).not.toHaveBeenCalled();
            expect(runCocoindex).not.toHaveBeenCalled();
            expect(createManifest).toHaveBeenCalledWith(repo, join(repo, ONLY_ONE_DIR), 'orien-trade-backend', undefined);
        } finally {
            await rm(root, { recursive: true, force: true });
        }
    });

    it('runs indexers when artifact directories already exist (only --skip-* opts out)', async () => {
        const root = await mkdtemp(join(tmpdir(), 'only-one-create-existing-'));
        const repo = join(root, 'demo-repo');

        try {
            await mkdir(join(repo, ONLY_ONE_DIR, '.gitnexus'), { recursive: true });
            await mkdir(join(repo, ONLY_ONE_DIR, '.cocoindex'), { recursive: true });
            await writeFile(
                join(repo, ONLY_ONE_DIR, ONLY_ONE_CONFIG_FILE),
                ['server: http://api', 'index_mode: local'].join('\n'),
                'utf-8',
            );

            const program = createProgram({
                cwd: root,
                fetcher: vi.fn(),
                stdout: () => undefined,
            });

            await program.parseAsync(['index:create', 'demo-repo'], { from: 'user' });

            const { runGitnexus, runCocoindex } = await import('@src/core/prebuilt/indexers.js');
            expect(runGitnexus).toHaveBeenCalled();
            expect(runCocoindex).toHaveBeenCalled();
        } finally {
            await rm(root, { recursive: true, force: true });
        }
    });
});
