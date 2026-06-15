import type { HybridIndexConfig } from '../config/index.js';
import { persistConfigProjectId } from '../config/index.js';
import type { HybridApiClient } from '../client/index.js';
import type { BackendProject, CreateProjectInput } from '../client/types.js';
import { isUuidV4 } from '../../utils/uuid.js';

export interface FindProjectByIdentityRequest {
    client: HybridApiClient;
    organization: string;
    project: string;
}

export interface ResolveBackendProjectIdRequest {
    client: HybridApiClient;
    config: HybridIndexConfig;
    cwd?: string;
    override?: string;
    persistLookup?: boolean;
}

export interface ResolveBackendProjectIdResponse {
    failure?: { summary: string; cause: string; fixes: string[] };
    projectId?: string;
}

export interface SyncBackendProjectOnInitRequest {
    client: HybridApiClient;
    cwd: string;
    hasApiKey: boolean;
    organization: string;
    project: string;
    projectName: string;
    sourceUri?: string;
    defaultBranch?: string;
    stdout: (line: string) => void;
}

const normalizeIdentityPart = (value: string): string => value.trim().toLowerCase();

export const findProjectByIdentity = async (request: FindProjectByIdentityRequest): Promise<BackendProject | null> => {
    const organization = request.organization.trim();
    const project = request.project.trim();
    if (!organization || !project) {
        return null;
    }

    const projects = (await request.client.listProjects()) as BackendProject[];
    if (!Array.isArray(projects)) {
        return null;
    }

    const normalizedOrg = normalizeIdentityPart(organization);
    const normalizedProject = normalizeIdentityPart(project);

    return (
        projects.find(
            (entry) =>
                normalizeIdentityPart(entry.organization ?? '') === normalizedOrg &&
                normalizeIdentityPart(entry.project ?? '') === normalizedProject,
        ) ?? null
    );
};

export const resolveBackendProjectId = async (request: ResolveBackendProjectIdRequest): Promise<ResolveBackendProjectIdResponse> => {
    const { client, config, cwd, override, persistLookup = true } = request;

    const explicitOverride = override?.trim();
    if (explicitOverride) {
        return { projectId: explicitOverride };
    }

    const cachedProjectId = config.project_id?.trim();
    if (cachedProjectId) {
        return { projectId: cachedProjectId };
    }

    const organization = config.organization?.trim();
    const projectSlug = config.project?.trim();
    if (organization && projectSlug && !isUuidV4(projectSlug)) {
        const found = await findProjectByIdentity({ client, organization, project: projectSlug });
        if (found?.id) {
            if (persistLookup && cwd) {
                await persistConfigProjectId(cwd, found.id);
            }
            return { projectId: found.id };
        }

        return {
            failure: {
                summary: 'Backend project not found for Git identity',
                cause: `No backend project exists for ${organization}/${projectSlug}`,
                fixes: [
                    'Run only-one-cli init to register the project on the backend',
                    'Run only-one-cli push-index to create and upload indexes',
                    'Pass --project <id> to target a specific backend project',
                    'Run only-one-cli list to discover project ids',
                ],
            },
        };
    }

    if (projectSlug && isUuidV4(projectSlug)) {
        return { projectId: projectSlug };
    }

    return {
        failure: {
            summary: 'Project id is required',
            cause: 'No backend project id was resolved',
            fixes: ['Pass --project <id>', 'Set HYBRID_PROJECT', 'Run only-one-cli init'],
        },
    };
};

export const syncBackendProjectOnInit = async (request: SyncBackendProjectOnInitRequest): Promise<void> => {
    const { client, cwd, hasApiKey, organization, project, projectName, sourceUri, defaultBranch, stdout } = request;

    if (!hasApiKey) {
        stdout('Warning: API credentials not configured; skipped backend project registration.');
        stdout('  Query commands require a backend project. Configure credentials and run init again.');
        return;
    }

    const input: CreateProjectInput = {
        defaultBranch: defaultBranch || undefined,
        name: projectName,
        organization,
        project,
        sourceType: 'prebuilt',
        sourceUri: sourceUri || undefined,
    };
    const response = await client.createProject(input);
    await persistConfigProjectId(cwd, response.id);
    stdout(`Linked backend project: ${organization}/${project} (${response.id})`);
};
