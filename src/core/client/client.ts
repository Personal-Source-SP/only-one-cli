import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { BaseApiClient } from './baseApi.js';
import type {
    BackendProject,
    CallGraphOptions,
    CallGraphResponse,
    CreateProjectInput,
    CreateProjectResponse,
    Fetcher,
    FileContentResponse,
    ImpactOptions,
    ImpactResponse,
    LatestIndexMetadata,
    ListIndexesOptions,
    ListJobsOptions,
    RemoteIndexInput,
    SearchOptions,
    SearchResponse,
    TriggerJobInput,
    UploadPrebuiltIndexInput,
    UploadZipInput,
    ProjectStructureInfo,
    SourceFileContentResponse,
    SourceFileListResponse,
} from './types.js';

export class HybridApiClient extends BaseApiClient {
    constructor(baseUrl: string, apiKey?: string, fetcher: Fetcher = fetch) {
        super(baseUrl, apiKey, fetcher);
    }

    async listProjects(status = 'all') {
        const params = new URLSearchParams();
        if (status !== 'all') {
            params.set('status', status);
        }
        const query = params.toString();

        const payload = await this.requestJson(`/api/v1/projects${query ? `?${query}` : ''}`, {
            method: 'GET',
            headers: this.formatHeaders(),
        });

        if (Array.isArray(payload)) {
            return payload;
        }

        if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown[] }).data)) {
            return (payload as { data: unknown[] }).data;
        }

        return [];
    }

    async listProjectsWithStructure(): Promise<ProjectStructureInfo[]> {
        const payload = await this.requestJson('/api/v1/projects/structure', {
            method: 'GET',
            headers: this.formatHeaders(),
        });

        if (Array.isArray(payload)) {
            return payload as ProjectStructureInfo[];
        }

        return [];
    }

    async createProject(input: CreateProjectInput): Promise<CreateProjectResponse> {
        return this.requestJson('/api/v1/projects', {
            method: 'POST',
            headers: this.formatHeaders({ json: true }),
            body: JSON.stringify({
                defaultBranch: input.defaultBranch,
                name: input.name,
                organization: input.organization,
                projectSlug: input.project,
                sourceType: input.sourceType,
                sourceUri: input.sourceUri,
                tags: input.tags,
            }),
        });
    }

    async getProject(projectId: string): Promise<BackendProject> {
        return this.requestJson<BackendProject>(`/api/v1/projects/${encodeURIComponent(projectId)}`, {
            method: 'GET',
            headers: this.formatHeaders(),
        });
    }

    async getProjectStructureBlueprint(projectId: string): Promise<FileContentResponse> {
        return this.requestJson<FileContentResponse>(`/api/v1/projects/${encodeURIComponent(projectId)}/structure`, {
            method: 'GET',
            headers: this.formatHeaders(),
        });
    }

    async listSourceFiles(projectId: string, token?: string): Promise<SourceFileListResponse> {
        const headers = this.formatHeaders();
        if (token) {
            headers['X-Git-Token'] = token;
        }
        return this.requestJson<SourceFileListResponse>(`/api/v1/projects/${encodeURIComponent(projectId)}/source/files`, {
            method: 'GET',
            headers,
        });
    }

    async getSourceFileContent(
        projectId: string,
        path: string,
        opts: { ref?: string } = {},
        token?: string,
    ): Promise<SourceFileContentResponse> {
        const headers = this.formatHeaders();
        if (token) {
            headers['X-Git-Token'] = token;
        }
        const queryParams = new URLSearchParams({ path });
        if (opts.ref) {
            queryParams.set('ref', opts.ref);
        }
        return this.requestJson<SourceFileContentResponse>(
            `/api/v1/projects/${encodeURIComponent(projectId)}/source/file-content?${queryParams.toString()}`,
            {
                method: 'GET',
                headers,
            },
        );
    }

    async listJobs(options: ListJobsOptions = {}) {
        const query = options.projectId ? `?projectId=${encodeURIComponent(options.projectId)}` : '';
        return this.requestJson(`/api/v1/jobs${query}`, {
            method: 'GET',
            headers: this.formatHeaders(),
        });
    }

    async getJob(jobId: string) {
        return this.requestJson(`/api/v1/jobs/${encodeURIComponent(jobId)}`, {
            method: 'GET',
            headers: this.formatHeaders(),
        });
    }

    async getJobLogs(jobId: string): Promise<string[]> {
        const raw = await this.requestText(`/api/v1/jobs/${encodeURIComponent(jobId)}/logs`, {
            method: 'GET',
            headers: this.formatHeaders(),
        });
        return this.parseSseLines(raw);
    }

    async triggerJob(input: TriggerJobInput) {
        return this.requestJson('/api/v1/jobs', {
            method: 'POST',
            headers: this.formatHeaders({ json: true }),
            body: JSON.stringify({
                projectId: input.projectId,
                incremental: input.incremental,
            }),
        });
    }

    async remoteIndex(input: RemoteIndexInput) {
        return this.requestJson('/api/v1/projects/git', {
            method: 'POST',
            headers: this.formatHeaders({ json: true }),
            body: JSON.stringify({
                name: input.name,
                repoUrl: input.repoUrl,
                branch: input.branch || undefined,
                pat: input.pat || undefined,
                tags: input.tags?.length ? input.tags : undefined,
            }),
        });
    }

    async uploadZip(input: UploadZipInput) {
        const body = new FormData();
        body.set('name', input.name);
        if (input.tags?.length) body.set('tags', input.tags.join(','));

        const archive = await readFile(input.zipPath);
        body.set('file', new Blob([archive], { type: 'application/zip' }), basename(input.zipPath));

        return this.requestJson('/api/v1/projects/upload', {
            method: 'POST',
            headers: this.formatHeaders(),
            body,
        });
    }

    async uploadPrebuiltIndex(input: UploadPrebuiltIndexInput) {
        const body = new FormData();
        body.set('name', input.name);
        if (input.tags?.length) body.set('tags', input.tags.join(','));
        if (input.fileCount !== undefined) body.set('fileCount', String(input.fileCount));
        if (input.organization) body.set('organization', input.organization);
        if (input.projectSlug) body.set('projectSlug', input.projectSlug);
        if (input.projectId) body.set('projectId', input.projectId);

        const bundle = await readFile(input.bundlePath);
        body.set('file', new Blob([bundle], { type: 'application/gzip' }), basename(input.bundlePath));

        return this.requestJson('/api/v1/projects/prebuilt', {
            method: 'POST',
            headers: this.formatHeaders(),
            body,
        });
    }

    async getLatestIndex(projectId: string): Promise<LatestIndexMetadata | null> {
        return this.requestJson(`/api/v1/projects/${encodeURIComponent(projectId)}/indexes/latest`, {
            method: 'GET',
            headers: this.formatHeaders(),
        });
    }

    async listProjectIndexes(projectId: string, options: Pick<ListIndexesOptions, 'limit' | 'tag'> = {}) {
        const params = new URLSearchParams();
        if (options.tag) params.set('tag', options.tag);
        if (options.limit !== undefined) params.set('limit', String(options.limit));
        const query = params.toString();

        const payload = await this.requestJson(`/api/v1/projects/${encodeURIComponent(projectId)}/indexes${query ? `?${query}` : ''}`, {
            method: 'GET',
            headers: this.formatHeaders(),
        });

        if (Array.isArray(payload)) {
            return payload;
        }

        if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown[] }).data)) {
            return (payload as { data: unknown[] }).data;
        }

        return [];
    }

    async listIndexes(options: ListIndexesOptions = {}) {
        const params = new URLSearchParams();
        if (options.projectId) params.set('project', options.projectId);
        if (options.tag) params.set('tag', options.tag);
        if (options.limit !== undefined) params.set('limit', String(options.limit));
        const query = params.toString();

        const payload = await this.requestJson(`/api/v1/indexes${query ? `?${query}` : ''}`, {
            method: 'GET',
            headers: this.formatHeaders(),
        });

        if (Array.isArray(payload)) {
            return payload;
        }

        if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown[] }).data)) {
            return (payload as { data: unknown[] }).data;
        }

        return [];
    }

    async search(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
        const scope = options.scope ?? 'per-project';
        const payload: Record<string, unknown> = {
            query,
            projectId: options.projectId || undefined,
            scope,
            topK: options.topK ?? 10,
        };

        if (options.tags?.length) {
            payload.tags = options.tags;
        }
        if (options.includeStructural) {
            payload.includeStructural = true;
        }

        return this.requestJson('/api/v1/query/search', {
            method: 'POST',
            headers: this.formatHeaders({ json: true }),
            body: JSON.stringify(payload),
        });
    }

    async impact(symbol: string, options: ImpactOptions = {}): Promise<ImpactResponse> {
        return this.requestJson('/api/v1/query/impact', {
            method: 'POST',
            headers: this.formatHeaders({ json: true }),
            body: JSON.stringify({
                symbol,
                projectId: options.projectId,
                depth: options.depth ?? 3,
            }),
        });
    }

    async callGraph(symbol: string, options: CallGraphOptions = {}): Promise<CallGraphResponse> {
        return this.requestJson('/api/v1/query/call-graph', {
            method: 'POST',
            headers: this.formatHeaders({ json: true }),
            body: JSON.stringify({
                symbol,
                projectId: options.projectId,
                direction: options.direction ?? 'both',
            }),
        });
    }
}
