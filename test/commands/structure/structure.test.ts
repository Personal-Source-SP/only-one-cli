import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProgram } from '@src/index.js';
import { installAgentArtifacts } from '@src/core/agent/install.js';
import { HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE } from '@src/core/prebuilt/index-output.js';
import { readBlueprintStatus, STRUCTURE_SECTION_HEADINGS } from '@src/core/structure/status.js';
import { LEGACY_STRUCTURAL_BLUEPRINT_FILENAME } from '@src/core/structure/paths.js';

vi.mock('@src/utils/git-project-name.js', () => ({
    resolveGitProjectName: vi.fn().mockResolvedValue('acme/payments-api'),
}));

const writeProjectConfig = async (projectDir: string, yaml: string): Promise<void> => {
    await mkdir(join(projectDir, HYBRID_INDEX_DIR), { recursive: true });
    await writeFile(join(projectDir, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE), yaml, 'utf-8');
};

describe('installAgentArtifacts', () => {
    it('writes Cursor skill and command under a custom parent', async () => {
        const projectDir = await mkdtemp(join(tmpdir(), 'hybrid-structural-install-'));

        try {
            const result = await installAgentArtifacts(projectDir, {
                cliVersion: '0.3.1-test',
                force: true,
                tools: ['cursor'],
            });

            expect(result.tools[0]?.skill.installed).toBe(true);
            expect(result.tools[0]?.command?.installed).toBe(true);

            const skill = await readFile(join(projectDir, '.cursor', 'skills', 'only-one-structure-generate', 'SKILL.md'), 'utf-8');
            expect(skill).toContain('Do NOT run `openspec` CLI');
            expect(skill).toContain('structure/');
            expect(skill).toContain('generatedBy: "0.3.1-test"');
        } finally {
            await rm(projectDir, { recursive: true, force: true });
        }
    });
});

describe('structure command', () => {
    it('prints JSON playbook without OpenSpec fields', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-structural-json-'));
        const lines: string[] = [];

        try {
            await writeProjectConfig(cwd, 'organization: acme\nproject: payments-api\n');

            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(),
                stdout: (line) => lines.push(line),
            });

            await program.parseAsync(['--json', 'structure-generate', '--no-install-skill'], { from: 'user' });

            const payload = JSON.parse(lines.join('\n'));
            expect(payload.projectDir).toBe(cwd);
            expect(payload.agentArtifacts).toEqual([]);
            expect(payload.relativeBlueprintPath).toBe('.only-one/structure/acme-payments-api-structural.md');
            expect(payload.blueprintFile).toBe('acme-payments-api-structural.md');
            expect(payload.relativeOutputDir).toBe('.only-one/structure');
            expect(payload.steps?.length).toBeGreaterThan(0);
            expect(JSON.stringify(payload)).not.toMatch(/openspec/i);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('scaffolds structure directory', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-structural-scaffold-'));

        try {
            await writeProjectConfig(cwd, 'organization: acme\nproject: demo\n');

            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(),
                stdout: () => undefined,
            });

            await program.parseAsync(['structure-generate', '--no-install-skill', '--status'], { from: 'user' });

            const structuralsDir = join(cwd, HYBRID_INDEX_DIR, 'structure');
            const { access } = await import('node:fs/promises');
            await expect(access(structuralsDir)).resolves.toBeUndefined();
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});

describe('readBlueprintStatus', () => {
    it('lists missing sections when file absent', () => {
        const status = readBlueprintStatus('/tmp/does-not-exist-blueprint.md');
        expect(status.exists).toBe(false);
        expect(status.missingSections).toEqual([...STRUCTURE_SECTION_HEADINGS]);
    });

    it('reports legacy blueprint at index root', async () => {
        const projectDir = await mkdtemp(join(tmpdir(), 'hybrid-structural-legacy-'));

        try {
            await mkdir(join(projectDir, HYBRID_INDEX_DIR), { recursive: true });
            await writeFile(join(projectDir, HYBRID_INDEX_DIR, LEGACY_STRUCTURAL_BLUEPRINT_FILENAME), '# legacy', 'utf-8');

            const newPath = join(projectDir, HYBRID_INDEX_DIR, 'structure', 'acme-demo-structural.md');
            const status = readBlueprintStatus(newPath, { projectDir });

            expect(status.exists).toBe(false);
            expect(status.legacyExists).toBe(true);
            expect(status.legacyPath).toBe(join(projectDir, HYBRID_INDEX_DIR, LEGACY_STRUCTURAL_BLUEPRINT_FILENAME));
        } finally {
            await rm(projectDir, { recursive: true, force: true });
        }
    });
});
