export interface BulkRepoConfig {
    name?: string;
    skip?: boolean;
    tags?: string[];
}

export interface BulkConfig {
    depth?: number;
    concurrency?: number;
    exclude?: string[];
    tags?: string[];
    repos?: Record<string, BulkRepoConfig>;
}

export type SearchScope = 'cross-project' | 'per-project';

export interface SearchConfig {
    interactive?: boolean;
    scope?: SearchScope;
    snippet_lines?: number;
    structural?: boolean;
    tags?: string[];
    top_k?: number;
}

export interface OnlyOneConfig {
    agent_tools?: string[];
    server?: string;
    project?: string;
    project_id?: string;
    project_name?: string;
    include?: string[];
    exclude?: string[];
    incremental?: boolean;
    index_mode?: IndexMode;
    bulk?: BulkConfig;
    organization?: string;
    search?: SearchConfig;
    git_access_token?: string;
}

export type IndexMode = 'local' | 'docker';

export type IndexModeSource = 'cli' | 'config' | 'default';

export interface ResolvedIndexMode {
    mode: IndexMode;
    source: IndexModeSource;
}

export interface GlobalOptions {
    server?: string;
    project?: string;
    json?: boolean;
}

export interface ResolvedGlobals {
    server: string;
    key?: string;
    project?: string;
    json: boolean;
}

export interface ResolvedBulkConfig {
    depth: number;
    concurrency: number;
    exclude: string[];
    tags: string[];
    repos: Record<string, BulkRepoConfig>;
}

export interface ResolvedSearchConfig {
    interactive: boolean;
    scope: SearchScope;
    snippetLines: number;
    structural: boolean;
    tags: string[];
    topK: number;
}

export interface SearchCliOptions {
    crossProject?: boolean;
    interactive?: boolean;
    once?: boolean;
    scope?: string;
    snippetLines?: string;
    structural?: boolean;
    tag?: string[];
    topK?: string;
}
