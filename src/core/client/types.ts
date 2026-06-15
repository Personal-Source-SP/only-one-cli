export interface CreateProjectResponse {
    id: string;
}

export interface BackendProject {
    id: string;
    organization?: string;
    project?: string;
    name?: string;
    status?: string;
    existed?: boolean;
}

export interface CreateProjectInput {
    defaultBranch?: string | null;
    name: string;
    organization?: string;
    project?: string;
    sourceType: 'git' | 'prebuilt' | 'zip';
    sourceUri?: string | null;
    tags?: string[];
}

export type Fetcher = typeof fetch;

export type SearchScope = 'cross-project' | 'per-project';

export interface SearchResult {
    content: string;
    endLine: number;
    filePath: string;
    language: string;
    projectId: string;
    projectName: string;
    score: number;
    startLine: number;
}

export interface SearchStructuralProcess {
    id?: string;
    name?: string;
    summary?: string;
}

export interface SearchStructural {
    error?: { code: string; message: string };
    processes?: SearchStructuralProcess[];
}

export interface SearchResponse {
    results: SearchResult[];
    structural?: SearchStructural;
    total: number;
}

export interface ImpactSummary {
    direct?: number;
    modules_affected?: number;
    processes_affected?: number;
}

export interface ImpactResponse {
    error?: { code: string; message: string };
    impactedCount?: number;
    risk?: string;
    summary?: ImpactSummary;
    target?: { filePath?: string; name?: string };
}

export interface CallGraphResponse {
    edges?: unknown[];
    error?: { code: string; message: string };
    nodes?: unknown[];
    root?: { name?: string };
}

export interface SearchOptions {
    includeStructural?: boolean;
    projectId?: string;
    scope?: SearchScope;
    tags?: string[];
    topK?: number;
}

export interface ImpactOptions {
    projectId?: string;
    depth?: number;
}

export interface CallGraphOptions {
    projectId?: string;
    direction?: 'callers' | 'callees' | 'both';
}

export interface ListJobsOptions {
    projectId?: string;
}

export interface TriggerJobInput {
    projectId: string;
    incremental: boolean;
}

export interface RemoteIndexInput {
    name: string;
    repoUrl: string;
    branch?: string;
    pat?: string;
    tags?: string[];
}

export interface UploadZipInput {
    name: string;
    zipPath: string;
    tags?: string[];
}

export interface UploadPrebuiltIndexInput {
    name: string;
    bundlePath: string;
    tags?: string[];
    fileCount?: number;
    organization?: string;
    projectSlug?: string;
    projectId?: string;
}

export interface UploadPrebuiltIndexResponse {
    id: string;
    organization?: string;
    project?: string;
    existed?: boolean;
    indexVersionId?: string;
    name?: string;
    status?: string;
    projectId?: string;
}

export interface IndexVersionMetadata {
    artifactChecksum?: string;
    cocoindexVersion?: string;
    commitSha?: string;
    createdAt?: string;
    createdBy?: string;
    fileCount?: number;
    gitnexusVersion?: string;
    indexVersionId?: string;
    isLatest?: boolean;
    projectId?: string;
    projectName?: string;
    tags?: string[];
}

export interface ListIndexesOptions {
    limit?: number;
    projectId?: string;
    tag?: string;
}

export interface LatestIndexMetadata {
    artifactChecksum?: string;
    cocoindexVersion?: string;
    commitSha?: string;
    createdAt?: string;
    gitnexusVersion?: string;
    indexVersionId?: string;
}

export interface FileContentResponse {
    content: string;
    filePath: string;
    projectId: string;
}

export interface ProjectStructureInfo {
    projectId: string;
    organization?: string;
    project?: string;
    name?: string;
    structuralFilename: string;
    structuralFileSize: number;
}

export interface SourceFileListResponse {
    files: string[];
    indexedAt: string;
    projectId: string;
}

export interface SourceFileContentResponse {
    content: string;
    filePath: string;
    projectId: string;
}
