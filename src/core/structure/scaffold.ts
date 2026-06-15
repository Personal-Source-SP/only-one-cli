import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { loadConfig } from '../config/index.js';
import { ensureIndexOutputDir, resolveIndexOutputDir } from '../prebuilt/index-output.js';
import { resolveStructureBlueprintPath, resolveStructureBlueprintRelative, resolveStructureOutputDirLabel } from './blueprint.js';
import { isExplicitBlueprintFileOutput } from './paths.js';

export type StructureScaffoldResult = {
    blueprintPath: string;
    created: boolean;
    outputDir: string;
    relativeBlueprintPath: string;
    relativeOutputDir: string;
    usesDefaultOrganization: boolean;
};

export const scaffoldStructureOutput = async (projectDir: string, output?: string): Promise<StructureScaffoldResult> => {
    const config = await loadConfig(projectDir);
    const outputDir =
        output && isExplicitBlueprintFileOutput(output)
            ? resolveIndexOutputDir(projectDir, dirname(output))
            : resolveIndexOutputDir(projectDir, output);
    const blueprintPath = resolveStructureBlueprintPath(projectDir, {
        organization: config.organization,
        output,
        project: config.project,
    });
    const existed = existsSync(outputDir);

    await ensureIndexOutputDir(outputDir);
    await mkdir(dirname(blueprintPath), { recursive: true });

    return {
        blueprintPath,
        created: !existed,
        outputDir,
        relativeBlueprintPath: resolveStructureBlueprintRelative(projectDir, blueprintPath),
        relativeOutputDir: resolveStructureOutputDirLabel(projectDir, output),
        usesDefaultOrganization: !config.organization?.trim(),
    };
};
