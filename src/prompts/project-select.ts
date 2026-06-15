import { select as selectPrompt } from '@inquirer/prompts';
import { HybridApiClient } from '../core/client/index.js';
import type { BackendProject, ProjectStructureInfo } from '../core/client/index.js';
import type { ProgramDeps } from '../cli/deps.js';

export const selectBackendProject = async (client: HybridApiClient, deps: ProgramDeps): Promise<BackendProject> => {
    const projects = await client.listProjects('ready');
    const readyProjects = projects.filter((p: BackendProject) => p.status === 'ready');

    if (!readyProjects?.length) {
        throw new Error('No projects found on backend');
    }

    const select = deps.prompts?.select ?? selectPrompt;

    const choices = readyProjects.map((p) => {
        const org = p.organization || 'default';
        const projectSlug = p.project || 'unknown';
        const displayName = p.name ? ` (${p.name})` : '';
        return {
            name: `${org}/${projectSlug}${displayName}`,
            value: p.id,
        };
    });

    const selectedId = await select({
        message: 'Select a project:',
        choices,
    });

    const selectedProject = readyProjects.find((p) => p.id === selectedId);
    if (!selectedProject) {
        throw new Error('Selected project not found');
    }

    return selectedProject;
};

export const selectStructuralProject = async (
    client: HybridApiClient,
    deps: ProgramDeps,
    preFetchedStructure?: ProjectStructureInfo[],
): Promise<BackendProject> => {
    const structureProjects = preFetchedStructure ?? (await client.listProjectsWithStructure());

    if (!structureProjects?.length) {
        throw new Error('No projects with structural blueprints found');
    }

    const select = deps.prompts?.select ?? selectPrompt;

    const choices = structureProjects.map((s) => {
        const org = s.organization || 'default';
        const projectSlug = s.project || 'unknown';
        const displayName = s.name ? ` (${s.name})` : '';
        const sizeStr = `${(s.structuralFileSize / 1024).toFixed(1)} KB`;
        return {
            name: `${org}/${projectSlug}${displayName} [${sizeStr}]`,
            value: s.projectId,
        };
    });

    const selectedId = await select({
        message: 'Select a project with structural blueprint:',
        choices,
    });

    const selected = structureProjects.find((s) => s.projectId === selectedId);
    if (!selected) {
        throw new Error('Selected project not found');
    }

    return {
        id: selected.projectId,
        organization: selected.organization,
        project: selected.project,
        name: selected.name,
        status: 'ready',
    };
};
