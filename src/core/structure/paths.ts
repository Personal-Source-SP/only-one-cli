import { existsSync, readdirSync } from 'node:fs';
import { basename, join, dirname } from 'node:path';
import { resolveIndexOutputDir } from '@/core/prebuilt/index-output.js';

export const STRUCTURALS_DIR = 'structure';
export const LEGACY_STRUCTURAL_BLUEPRINT_FILENAME = 'structural-blueprint.md';
export const STRUCTURAL_FILENAME_SUFFIX = '-structural.md';

const SEGMENT_MAX_LENGTH = 64;

export class StructurePathResolutionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'StructurePathResolutionError';
    }
}

export const sanitizeStructureSegment = (value: string): string => {
    const normalized = value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    const segment = normalized || 'unknown';
    return segment.length > SEGMENT_MAX_LENGTH ? segment.slice(0, SEGMENT_MAX_LENGTH) : segment;
};

export const buildStructureFilename = (organization: string, source: string): string =>
    `${sanitizeStructureSegment(organization)}-${sanitizeStructureSegment(source)}${STRUCTURAL_FILENAME_SUFFIX}`;

export type StructurePathIdentity = {
    organization: string;
    source: string;
};

export const resolveStructurePathIdentity = (config: { organization?: string; project?: string }): StructurePathIdentity | null => {
    const source = config.project?.trim();
    if (!source) {
        return null;
    }

    const organization = config.organization?.trim() ? config.organization : 'default';
    return { organization, source };
};

export const usesDefaultOrganizationSegment = (config: { organization?: string }): boolean => !config.organization?.trim();

export const isExplicitBlueprintFileOutput = (output: string): boolean => basename(output).endsWith('.md');

export const resolveStructureStructuralsDir = (projectDir: string, output?: string): string => {
    if (output && isExplicitBlueprintFileOutput(output)) {
        return dirname(join(projectDir, output));
    }
    const indexDir = output ? join(projectDir, output) : resolveIndexOutputDir(projectDir);
    return join(indexDir, STRUCTURALS_DIR);
};

export const resolveLegacyBlueprintPath = (projectDir: string, output?: string): string =>
    join(resolveIndexOutputDir(projectDir, output), LEGACY_STRUCTURAL_BLUEPRINT_FILENAME);

export const resolveStructureBlueprintPath = (
    projectDir: string,
    options?: { organization?: string; output?: string; project?: string },
): string => {
    const { output, organization, project } = options ?? {};

    if (output) {
        const resolved = join(projectDir, output);
        if (isExplicitBlueprintFileOutput(output)) {
            return resolved;
        }

        const identity = resolveStructurePathIdentity({ organization, project });
        if (!identity) {
            throw new StructurePathResolutionError(
                'Cannot resolve structural blueprint path: set `project` in .onlyonecli.yml, pass an explicit --output file path ending in .md, or run `only-one init`.',
            );
        }

        return join(resolved, STRUCTURALS_DIR, buildStructureFilename(identity.organization, identity.source));
    }

    const identity = resolveStructurePathIdentity({ organization, project });
    if (!identity) {
        throw new StructurePathResolutionError(
            'Cannot resolve structural blueprint path: set `project` in .onlyonecli.yml (run `only-one init`) or pass --output <path-to-file.md>.',
        );
    }

    return join(resolveIndexOutputDir(projectDir), STRUCTURALS_DIR, buildStructureFilename(identity.organization, identity.source));
};

export const listStructureRelativePaths = (outputDir: string): string[] => {
    const dir = join(outputDir, STRUCTURALS_DIR);
    if (!existsSync(dir)) {
        return [];
    }

    return readdirSync(dir)
        .filter((entry) => entry.endsWith('.md'))
        .map((entry) => `${STRUCTURALS_DIR}/${entry}`)
        .sort();
};
