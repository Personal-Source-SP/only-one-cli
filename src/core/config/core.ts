import { access, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { HYBRID_API_KEY_ENV, formatApiKeyConfigHint, resolveApiKey } from '@/core/runtime/credentials.js';
import { isUuidV4 } from '@/utils/uuid.js';
import {
    HYBRID_INDEX_CONFIG_FILE,
    HYBRID_INDEX_DIR,
    ensureIndexOutputDir,
    resolveLocalConfigPath,
    resolveLocalConfigPathForProject,
} from '@/core/prebuilt/index-output.js';
import type {
    BulkConfig,
    GlobalOptions,
    HybridIndexConfig,
    IndexMode,
    ResolvedBulkConfig,
    ResolvedGlobals,
    ResolvedIndexMode,
    ResolvedSearchConfig,
    SearchCliOptions,
    SearchConfig,
    SearchScope,
} from './types.js';

export { HYBRID_API_KEY_ENV, formatApiKeyConfigHint, resolveApiKey } from '@/core/runtime/credentials.js';
export { isUuidV4 } from '@/utils/uuid.js';

let legacyCredentialWarningShown = false;

const LEGACY_CREDENTIAL_DEPRECATION = `only-one-cli: api_key and api_key_env in YAML are ignored; use ${formatApiKeyConfigHint()}.`;

/** @internal Resets one-time deprecation warning state (tests only). */
export const resetLegacyCredentialWarningForTests = (): void => {
    legacyCredentialWarningShown = false;
};

export const warnLegacyYamlCredentials = (warn: (message: string) => void = (message) => console.warn(message)): void => {
    if (legacyCredentialWarningShown) {
        return;
    }
    legacyCredentialWarningShown = true;
    warn(LEGACY_CREDENTIAL_DEPRECATION);
};

export const stripLegacyCredentials = (
    config: HybridIndexConfig & { api_key?: string; api_key_env?: string },
): {
    config: HybridIndexConfig;
    hadLegacy: boolean;
} => {
    const hadLegacy = Boolean(config.api_key) || Boolean(config.api_key_env);
    if (!hadLegacy) {
        return { config, hadLegacy: false };
    }
    const { api_key: _apiKey, api_key_env: _apiKeyEnv, ...rest } = config;
    return { config: rest, hadLegacy: true };
};

const parseConfigYaml = (raw: string): HybridIndexConfig => {
    const parsed = (yaml.load(raw) as (HybridIndexConfig & { api_key?: string; api_key_env?: string }) | null) ?? {};
    const { config, hadLegacy } = stripLegacyCredentials(parsed);
    if (hadLegacy) {
        warnLegacyYamlCredentials();
    }
    return config;
};

export const loadGlobalConfig = async (): Promise<HybridIndexConfig> => {
    try {
        const raw = await readFile(join(homedir(), '.onlyonecli', 'config.yaml'), 'utf-8');
        return parseConfigYaml(raw);
    } catch {
        return {};
    }
};

export const loadConfig = async (cwd = process.cwd()): Promise<HybridIndexConfig> => {
    const globalConfig = await loadGlobalConfig();
    let localConfig: HybridIndexConfig = {};
    const localConfigPath = resolveLocalConfigPathForProject(cwd);
    if (localConfigPath) {
        try {
            const raw = await readFile(localConfigPath, 'utf-8');
            localConfig = parseConfigYaml(raw);
        } catch {
            // unreadable local config
        }
    }

    const merged = { ...globalConfig, ...localConfig };
    if (globalConfig.bulk || localConfig.bulk) {
        merged.bulk = {
            ...globalConfig.bulk,
            ...localConfig.bulk,
            repos: {
                ...(globalConfig.bulk?.repos ?? {}),
                ...(localConfig.bulk?.repos ?? {}),
            },
            exclude: [...(globalConfig.bulk?.exclude ?? []), ...(localConfig.bulk?.exclude ?? [])],
            tags: [...(globalConfig.bulk?.tags ?? []), ...(localConfig.bulk?.tags ?? [])],
        };
    }

    if (merged.project_name && (!merged.organization || !merged.project)) {
        const parts = merged.project_name.split('/');
        const org = parts.length > 1 ? parts[0] : 'default';
        const proj = parts.length > 1 ? parts[1] : parts[0];
        if (!merged.organization && org) merged.organization = org;
        if (!merged.project && proj) merged.project = proj;
    }

    if (globalConfig.search || localConfig.search) {
        merged.search = {
            ...globalConfig.search,
            ...localConfig.search,
            tags: [...(globalConfig.search?.tags ?? []), ...(localConfig.search?.tags ?? [])],
        };
    }
    return merged;
};

export const defaultSearchConfig = (): SearchConfig => {
    return {
        interactive: true,
        scope: 'per-project',
        snippet_lines: 8,
        structural: false,
        tags: [],
        top_k: 10,
    };
};

export const resolveSearchConfig = (
    command: { getOptionValueSource: (name: string) => string | undefined },
    cliOptions: SearchCliOptions,
    config?: SearchConfig,
): ResolvedSearchConfig => {
    const defaults = defaultSearchConfig();
    const merged = { ...defaults, ...config };

    const topK = command.getOptionValueSource('topK') === 'cli' ? Number(cliOptions.topK) : (merged.top_k ?? defaults.top_k!);
    const snippetLines =
        command.getOptionValueSource('snippetLines') === 'cli'
            ? Number(cliOptions.snippetLines)
            : (merged.snippet_lines ?? defaults.snippet_lines!);
    const structural = command.getOptionValueSource('structural') === 'cli' ? Boolean(cliOptions.structural) : Boolean(merged.structural);
    const crossProjectCli = command.getOptionValueSource('crossProject') === 'cli';
    const scopeCli = command.getOptionValueSource('scope') === 'cli';

    let scope: SearchScope = 'per-project';
    if (crossProjectCli || Boolean(cliOptions.crossProject)) {
        scope = 'cross-project';
    } else if (scopeCli) {
        scope = cliOptions.scope === 'cross-project' ? 'cross-project' : 'per-project';
    } else if (merged.scope === 'cross-project') {
        scope = 'cross-project';
    }

    const tags =
        command.getOptionValueSource('tag') === 'cli' || cliOptions.tag?.length
            ? [...(cliOptions.tag ?? [])]
            : [...(merged.tags ?? defaults.tags ?? [])];

    let interactive = merged.interactive ?? defaults.interactive ?? true;
    if (command.getOptionValueSource('once') === 'cli' || cliOptions.once) {
        interactive = false;
    }
    if (command.getOptionValueSource('interactive') === 'cli' || cliOptions.interactive) {
        interactive = true;
    }

    return {
        interactive,
        scope,
        snippetLines,
        structural,
        tags,
        topK,
    };
};

export const validateSearchConfig = (config: ResolvedSearchConfig): string[] => {
    const errors: string[] = [];
    if (!Number.isFinite(config.topK) || config.topK <= 0 || !Number.isInteger(config.topK)) {
        errors.push('search.top_k must be a positive integer');
    }
    if (!Number.isFinite(config.snippetLines) || config.snippetLines < 0 || !Number.isInteger(config.snippetLines)) {
        errors.push('search.snippet_lines must be a non-negative integer');
    }
    if (config.scope !== 'per-project' && config.scope !== 'cross-project') {
        errors.push('search.scope must be per-project or cross-project');
    }
    return errors;
};

export const resolveBulkConfig = (
    cliOptions: {
        depth?: string;
        exclude?: string[];
        tag?: string[];
        concurrency?: string;
    },
    config?: BulkConfig,
): ResolvedBulkConfig => {
    return {
        depth: parseInt(cliOptions.depth ?? String(config?.depth ?? 3), 10),
        concurrency: parseInt(cliOptions.concurrency ?? String(config?.concurrency ?? 1), 10),
        exclude: [...(config?.exclude ?? []), ...(cliOptions.exclude ?? [])],
        tags: [...(config?.tags ?? []), ...(cliOptions.tag ?? [])],
        repos: config?.repos ?? {},
    };
};

export const validateBulkConfig = (config: ResolvedBulkConfig): string[] => {
    const errors: string[] = [];
    if (config.depth < 1 || config.depth > 10) errors.push('depth must be 1-10');
    if (config.concurrency < 1 || config.concurrency > 10) errors.push('concurrency must be 1-10');
    return errors;
};

export const writeConfig = async (config: HybridIndexConfig, cwd = process.cwd(), options: { force?: boolean } = {}): Promise<void> => {
    const outputDir = join(cwd, HYBRID_INDEX_DIR);
    await ensureIndexOutputDir(outputDir);
    const target = resolveLocalConfigPath(cwd);
    if (!options.force && (await exists(target))) {
        throw new Error(`${HYBRID_INDEX_DIR}/${HYBRID_INDEX_CONFIG_FILE} already exists; pass --force to overwrite`);
    }

    await writeFile(target, dumpHybridIndexConfig(config));
};

export const persistConfigAgentTools = async (cwd: string, agentTools: string[]): Promise<void> => {
    const configPath = resolveLocalConfigPathForProject(cwd);
    if (!configPath) {
        throw new Error(`${HYBRID_INDEX_DIR}/${HYBRID_INDEX_CONFIG_FILE} not found`);
    }

    const config = parseConfigYaml(await readFile(configPath, 'utf-8'));
    config.agent_tools = agentTools;
    await writeFile(configPath, dumpHybridIndexConfig(config));
};

export const persistConfigProjectId = async (cwd: string, projectId: string): Promise<boolean> => {
    const configPath = resolveLocalConfigPathForProject(cwd);
    if (!configPath) {
        return false;
    }

    const normalizedProjectId = projectId.trim();
    if (!normalizedProjectId) {
        return false;
    }

    const config = parseConfigYaml(await readFile(configPath, 'utf-8'));
    if (config.project_id === normalizedProjectId) {
        return false;
    }

    config.project_id = normalizedProjectId;
    await writeFile(configPath, dumpHybridIndexConfig(config));
    return true;
};

/** YAML for `search:` defaults with inline comments (used when writing `.onlyonecli.yml`). */
export const formatSearchSectionYaml = (search?: SearchConfig): string => {
    const resolved = { ...defaultSearchConfig(), ...search };
    const lines = [
        'search:',
        '  # Defaults for only-one-cli search; CLI flags override these values when passed on the command line.',
        `  top_k: ${resolved.top_k}  # Maximum number of results (-k, --top-k)`,
        `  snippet_lines: ${resolved.snippet_lines}  # Max snippet lines per hit; 0 = show full excerpt (--snippet-lines)`,
        `  structural: ${resolved.structural}  # Add GitNexus execution-flow context (--structural; per-project only)`,
        `  scope: ${resolved.scope}  # per-project (default) or cross-project (--scope or --cross-project)`,
    ];

    if (!resolved.tags?.length) {
        lines.push('  tags: []  # Tag filters when scope is cross-project (--tag, repeatable)');
    } else {
        lines.push('  tags:  # Tag filters when scope is cross-project (--tag, repeatable)');
        for (const tag of resolved.tags) {
            lines.push(`    - ${tag}`);
        }
    }

    lines.push(`  interactive: ${resolved.interactive}  # On a TTY, prompt to search again after results; false or --once disables`);
    return lines.join('\n');
};

const dumpHybridIndexConfig = (config: HybridIndexConfig): string => {
    const serialized = serializeConfig(config);
    const { search, ...rest } = serialized;
    const body = yaml.dump(rest, { lineWidth: -1, noRefs: true }).trimEnd();
    return `${body}\n${formatSearchSectionYaml(search as SearchConfig)}\n`;
};

const serializeConfig = (config: HybridIndexConfig): Record<string, unknown> => ({
    ...(config.agent_tools !== undefined ? { agent_tools: config.agent_tools } : {}),
    server: config.server ?? 'http://localhost:3000',
    ...(config.project_name ? { project_name: config.project_name } : {}),
    ...(config.organization ? { organization: config.organization } : {}),
    ...(config.project ? { project: config.project } : {}),
    ...(config.project_id ? { project_id: config.project_id } : {}),
    ...(config.git_access_token !== undefined ? { git_access_token: config.git_access_token } : {}),
    include: config.include ?? ['**/*.ts', '**/*.tsx', '**/*.py', '**/*.go', 'docs/**/*.md'],
    exclude: config.exclude ?? ['node_modules/**', 'dist/**', '.git/**', '**/*.test.ts', '**/*.spec.*'],
    incremental: config.incremental ?? true,
    index_mode: config.index_mode ?? 'local',
    search: {
        ...defaultSearchConfig(),
        ...config.search,
    },
});

export const parseIndexMode = (value?: string): IndexMode => {
    if (!value) {
        return 'local';
    }
    if (value !== 'docker' && value !== 'local') {
        throw new Error(`Invalid index mode "${value}". Expected "docker" or "local".`);
    }
    return value;
};

export const resolveIndexMode = (config: HybridIndexConfig, cliOverride?: string): ResolvedIndexMode => {
    if (cliOverride) {
        return { mode: parseIndexMode(cliOverride), source: 'cli' };
    }

    if (config.index_mode === 'docker' || config.index_mode === 'local') {
        return { mode: config.index_mode, source: 'config' };
    }

    return { mode: 'local', source: 'default' };
};

export const hasLocalConfig = async (cwd = process.cwd()): Promise<boolean> => {
    return resolveLocalConfigPathForProject(cwd) !== null;
};

export const localConfigDisplayPath = (): string => {
    return `${HYBRID_INDEX_DIR}/${HYBRID_INDEX_CONFIG_FILE}`;
};

export const resolveGlobals = async (
    options: GlobalOptions,
    config: HybridIndexConfig,
    env: Record<string, string | undefined>,
): Promise<ResolvedGlobals> => {
    const legacyProjectId = config.project && isUuidV4(config.project) ? config.project : undefined;

    return {
        server: options.server ?? config.server ?? env.HYBRID_SERVER ?? 'http://localhost:3000',
        key: resolveApiKey(),
        project: options.project ?? config.project_id ?? legacyProjectId ?? env.HYBRID_PROJECT,
        json: Boolean(options.json),
    };
};

const exists = async (path: string): Promise<boolean> => {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
};
