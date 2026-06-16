import { confirm as confirmPrompt } from '@inquirer/prompts';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, relative } from 'node:path';
import type { PromptDeps } from '@/cli/deps.js';
import type { BackendProject } from '@/core/client/index.js';
import { HybridApiClient } from '@/core/client/index.js';
import { resolveStructureBlueprintPath, resolveStructurePathIdentity } from './blueprint.js';

export const fetchRemoteStructure = async (client: HybridApiClient, project: BackendProject): Promise<string> => {
    const res = await client.getProjectStructureBlueprint(project.id);
    if (!res?.content?.trim()) throw new Error('No structural blueprint found for this project');
    return res.content;
};

export interface SaveStructureLocallyOptions {
    force?: boolean;
    output?: string;
    prompts?: PromptDeps;
}

export const saveStructureLocally = async (
    content: string,
    projectDir: string,
    project: BackendProject,
    options: SaveStructureLocallyOptions = {},
): Promise<{ filePath: string; bytesWritten: number; overwritten: boolean }> => {
    const identity = resolveStructurePathIdentity({
        project: project.project,
        organization: project.organization,
    });

    if (!identity) {
        throw new Error('Project organization or project slug is missing, cannot resolve local structural path.');
    }

    const filePath = resolveStructureBlueprintPath(projectDir, {
        output: options.output,
        project: identity.source,
        organization: identity.organization,
    });

    let overwritten = false;
    if (existsSync(filePath)) {
        if (!options.force) {
            const confirm = options.prompts?.confirm ?? confirmPrompt;
            const proceed = await confirm({
                default: false,
                message: `File already exists: ${relative(projectDir, filePath)}. Overwrite?`,
            });

            if (!proceed) throw new Error('Aborted by user.');
        }
        overwritten = true;
    }

    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, content, 'utf-8');

    return {
        filePath,
        overwritten,
        bytesWritten: Buffer.byteLength(content, 'utf-8'),
    };
};
