import { basename, relative } from 'node:path';
import { resolveStructureBlueprintPath, resolveStructureStructuralsDir, type StructurePathIdentity } from './paths.js';

export {
    buildStructureFilename,
    LEGACY_STRUCTURAL_BLUEPRINT_FILENAME,
    resolveLegacyBlueprintPath,
    resolveStructureBlueprintPath,
    resolveStructurePathIdentity,
    STRUCTURAL_FILENAME_SUFFIX,
    STRUCTURALS_DIR,
    StructurePathResolutionError,
} from './paths.js';

export const resolveStructureBlueprintRelative = (projectDir: string, blueprintPath: string): string => relative(projectDir, blueprintPath);

export const resolveStructureOutputDirLabel = (projectDir: string, output?: string): string =>
    relative(projectDir, resolveStructureStructuralsDir(projectDir, output));

export const resolveBlueprintBasename = (blueprintPath: string): string => basename(blueprintPath);

export type ResolveStructureBlueprintOptions = {
    organization?: string;
    output?: string;
    project?: string;
};

export const resolveStructureBlueprintFromIdentity = (projectDir: string, identity: StructurePathIdentity, output?: string): string =>
    resolveStructureBlueprintPath(projectDir, {
        organization: identity.organization,
        output,
        project: identity.source,
    });
