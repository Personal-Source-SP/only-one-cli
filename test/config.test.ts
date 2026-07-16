import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ONLY_ONE_DIR, ONLY_ONE_CONFIG_FILE } from '@src/core/prebuilt/index-output.js';
import {
    loadConfig,
    resolveGlobals,
    resolveApiKey,
    HYBRID_API_KEY_ENV,
    writeConfig,
    resolveBulkConfig,
    validateBulkConfig,
    resolveIndexMode,
    parseIndexMode,
    resolveSearchConfig,
    validateSearchConfig,
    persistConfigProjectId,
    formatSearchSectionYaml,
    stripLegacyCredentials,
    warnLegacyYamlCredentials,
    resetLegacyCredentialWarningForTests,
} from '@src/core/config/index.js';

const writeProjectConfig = async (cwd: string, content: string, legacy = false): Promise<void> => {
    if (legacy) {
        await writeFile(join(cwd, ONLY_ONE_CONFIG_FILE), content, 'utf-8');
        return;
    }
    await mkdir(join(cwd, ONLY_ONE_DIR), { recursive: true });
    await writeFile(join(cwd, ONLY_ONE_DIR, ONLY_ONE_CONFIG_FILE), content, 'utf-8');
};

describe('CLI config', () => {
    it('loads .only-one/.onlyonecli.yml when present', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-'));
        await writeProjectConfig(cwd, ['server: http://configured', 'project: proj-1'].join('\n'));

        await expect(loadConfig(cwd)).resolves.toMatchObject({
            server: 'http://configured',
            project: 'proj-1',
        });

        await rm(cwd, { recursive: true, force: true });
    });

    it('strips legacy api_key fields from yaml on load', async () => {
        resetLegacyCredentialWarningForTests();
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-legacy-'));
        const warnings: string[] = [];
        const warn = (message: string) => warnings.push(message);

        await writeProjectConfig(
            cwd,
            ['server: http://configured', 'project: proj-1', 'api_key: yaml-secret', 'api_key_env: CUSTOM_KEY'].join('\n'),
        );

        const loaded = await loadConfig(cwd);
        expect(loaded).toMatchObject({ server: 'http://configured', project: 'proj-1' });
        expect(loaded).not.toHaveProperty('api_key');
        expect(loaded).not.toHaveProperty('api_key_env');

        resetLegacyCredentialWarningForTests();
        stripLegacyCredentials({ api_key: 'x' });
        warnLegacyYamlCredentials(warn);
        warnLegacyYamlCredentials(warn);
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain('credentials.ts');

        await rm(cwd, { recursive: true, force: true });
    });

    it('uses built-in api key constant regardless of yaml', async () => {
        const globals = await resolveGlobals({ json: false }, stripLegacyCredentials({ api_key: 'yaml-key' }).config, {});

        expect(globals.key).toBe('dev-api-key');
    });

    it('loads legacy project-root .onlyonecli.yml as fallback', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-'));
        await writeProjectConfig(cwd, ['server: http://legacy', 'project: legacy-proj'].join('\n'), true);

        await expect(loadConfig(cwd)).resolves.toMatchObject({
            server: 'http://legacy',
            project: 'legacy-proj',
        });

        await rm(cwd, { recursive: true, force: true });
    });

    it('uses flags before yaml before env', async () => {
        const globals = await resolveGlobals(
            {
                server: 'http://flag',
                project: undefined,
                json: true,
            },
            {
                server: 'http://configured',
                project_id: 'config-project',
            },
            {
                HYBRID_SERVER: 'http://env',
                HYBRID_PROJECT: 'env-project',
            },
        );

        expect(globals).toEqual({
            server: 'http://flag',
            key: 'dev-api-key',
            project: 'config-project',
            json: true,
        });
    });

    it('always resolves api key from HYBRID_API_KEY_ENV constant', async () => {
        const globals = await resolveGlobals(
            { json: false },
            {},
            {
                HYBRID_SERVER: 'http://env',
                HYBRID_PROJECT: 'env-project',
            },
        );

        expect(globals).toEqual({
            server: 'http://env',
            key: 'dev-api-key',
            project: 'env-project',
            json: false,
        });
    });

    it('resolveApiKey returns HYBRID_API_KEY_ENV constant', () => {
        expect(HYBRID_API_KEY_ENV).toBe('dev-api-key');
        expect(resolveApiKey()).toBe('dev-api-key');
    });

    it('stripLegacyCredentials removes credential keys', () => {
        const { config, hadLegacy } = stripLegacyCredentials({
            server: 'http://api',
            api_key: 'x',
            api_key_env: 'HYBRID_API_KEY',
        });
        expect(hadLegacy).toBe(true);
        expect(config).toEqual({ server: 'http://api' });
    });

    it('writes .only-one/.onlyonecli.yml with default include and exclude patterns', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-'));

        try {
            await writeConfig(
                {
                    server: 'http://api',
                    project: 'demo',
                },
                cwd,
            );

            await expect(loadConfig(cwd)).resolves.toMatchObject({
                server: 'http://api',
                project: 'demo',
                include: ['**/*.ts', '**/*.tsx', '**/*.py', '**/*.go', 'docs/**/*.md'],
                exclude: ['node_modules/**', 'dist/**', '.git/**', '**/*.test.ts', '**/*.spec.*'],
                incremental: true,
                index_mode: 'local',
                search: {
                    top_k: 10,
                    snippet_lines: 8,
                    structural: false,
                    scope: 'per-project',
                    tags: [],
                    interactive: true,
                },
            });

            const raw = await readFile(join(cwd, ONLY_ONE_DIR, ONLY_ONE_CONFIG_FILE), 'utf-8');
            expect(raw).not.toContain('api_key:');
            expect(raw).not.toContain('api_key_env:');
            expect(raw).toContain('# Maximum number of results (-k, --top-k)');
            expect(raw).toContain('# Defaults for only-one search');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('formatSearchSectionYaml documents each search default', () => {
        const section = formatSearchSectionYaml();
        expect(section).toContain('top_k: 10  # Maximum number of results');
        expect(section).toContain('snippet_lines: 8  # Max snippet lines');
        expect(section).toContain('structural: false  # Add GitNexus');
        expect(section).toContain('scope: per-project  # per-project');
        expect(section).toContain('tags: []  # Tag filters');
        expect(section).toContain('interactive: true  # On a TTY');
    });

    it('resolves and validates bulk config options', () => {
        const config = {
            depth: 4,
            concurrency: 2,
            exclude: ['glob1'],
            tags: ['tag1'],
            repos: {
                'org/repo': { skip: true },
            },
        };

        const resolved = resolveBulkConfig(
            {
                depth: '5',
                concurrency: '3',
                exclude: ['glob2'],
                tag: ['tag2'],
            },
            config,
        );

        expect(resolved).toEqual({
            depth: 5,
            concurrency: 3,
            exclude: ['glob1', 'glob2'],
            tags: ['tag1', 'tag2'],
            repos: {
                'org/repo': { skip: true },
            },
        });

        const invalid = resolveBulkConfig({ depth: '11', concurrency: '0' }, config);
        const errors = validateBulkConfig(invalid);
        expect(errors).toContain('depth must be 1-10');
        expect(errors).toContain('concurrency must be 1-10');

        const validErrors = validateBulkConfig(resolved);
        expect(validErrors.length).toBe(0);
    });

    it('resolves index mode from cli override, config, then default', () => {
        expect(resolveIndexMode({ index_mode: 'local' }, 'docker')).toEqual({
            mode: 'docker',
            source: 'cli',
        });
        expect(resolveIndexMode({ index_mode: 'docker' })).toEqual({
            mode: 'docker',
            source: 'config',
        });
        expect(resolveIndexMode({})).toEqual({
            mode: 'local',
            source: 'default',
        });
    });

    it('parses index mode for init and rejects invalid values', () => {
        expect(parseIndexMode()).toBe('local');
        expect(parseIndexMode('docker')).toBe('docker');
        expect(() => parseIndexMode('invalid')).toThrow('Invalid index mode');
    });

    it('loads index_mode from .only-one/.onlyonecli.yml', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-mode-'));
        await writeProjectConfig(cwd, ['server: http://configured', 'project: proj-1', 'index_mode: docker'].join('\n'));

        await expect(loadConfig(cwd)).resolves.toMatchObject({
            index_mode: 'docker',
        });

        await rm(cwd, { recursive: true, force: true });
    });

    it('resolves search config with cli override precedence', () => {
        const command = {
            getOptionValueSource: (name: string) => {
                if (name === 'topK') return 'cli';
                if (name === 'crossProject') return 'cli';
                if (name === 'tag') return 'cli';
                return 'default';
            },
        };

        const resolved = resolveSearchConfig(
            command,
            { topK: '20', crossProject: true, tag: ['group:platform'] },
            { top_k: 5, scope: 'per-project', snippet_lines: 4 },
        );

        expect(resolved).toMatchObject({
            topK: 20,
            scope: 'cross-project',
            snippetLines: 4,
            tags: ['group:platform'],
        });
        expect(validateSearchConfig(resolved)).toEqual([]);
    });

    it('loads search defaults from config file', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-search-'));
        await writeProjectConfig(cwd, ['server: http://configured', 'project: proj-1', 'search:', '  top_k: 3'].join('\n'));

        await expect(loadConfig(cwd)).resolves.toMatchObject({
            search: { top_k: 3 },
        });

        await rm(cwd, { recursive: true, force: true });
    });

    it('persists project_id without overwriting git project slug', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-project-id-'));
        await writeProjectConfig(
            cwd,
            ['server: http://configured', 'organization: acme', 'project: payments-api', 'project_name: acme/payments-api'].join('\n'),
        );

        const changed = await persistConfigProjectId(cwd, '550e8400-e29b-41d4-a716-446655440000');
        expect(changed).toBe(true);

        const raw = await readFile(join(cwd, ONLY_ONE_DIR, ONLY_ONE_CONFIG_FILE), 'utf-8');
        expect(raw).toContain('project: payments-api');
        expect(raw).toContain('project_id: 550e8400-e29b-41d4-a716-446655440000');

        await rm(cwd, { recursive: true, force: true });
    });

    it('resolveGlobals prefers project_id over git project slug', async () => {
        const globals = await resolveGlobals(
            {},
            {
                organization: 'acme',
                project: 'payments-api',
                project_id: '550e8400-e29b-41d4-a716-446655440000',
            },
            {},
        );

        expect(globals.project).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
});
