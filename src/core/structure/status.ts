import { existsSync, readFileSync } from 'node:fs';
import { resolveLegacyBlueprintPath } from './paths.js';

export const STRUCTURE_SECTION_HEADINGS = [
    'Tech Stack & Core Tooling',
    'Structural Skeleton (Directory Tree)',
    'Architectural Paradigms & Module Boundaries',
    'Structural Coding Conventions',
    'Cross-Cutting Concerns Infrastructure',
] as const;

export type StructureBlueprintStatus = {
    exists: boolean;
    legacyExists: boolean;
    legacyPath?: string;
    missingSections: string[];
    path: string;
};

export type ReadBlueprintStatusOptions = {
    output?: string;
    projectDir?: string;
};

export const readBlueprintStatus = (blueprintPath: string, options?: ReadBlueprintStatusOptions): StructureBlueprintStatus => {
    if (!existsSync(blueprintPath)) {
        const legacyPath = options?.projectDir ? resolveLegacyBlueprintPath(options.projectDir, options.output) : undefined;
        const legacyExists = Boolean(legacyPath && existsSync(legacyPath));

        return {
            exists: false,
            legacyExists,
            legacyPath: legacyExists ? legacyPath : undefined,
            missingSections: [...STRUCTURE_SECTION_HEADINGS],
            path: blueprintPath,
        };
    }

    const content = readFileSync(blueprintPath, 'utf-8');
    const missingSections = STRUCTURE_SECTION_HEADINGS.filter((heading) => !content.includes(heading));

    return {
        exists: true,
        legacyExists: false,
        missingSections,
        path: blueprintPath,
    };
};

export const extractGeneratedByVersion = (skillPath: string): string | null => {
    if (!existsSync(skillPath)) {
        return null;
    }

    const content = readFileSync(skillPath, 'utf-8');
    const match = content.match(/generatedBy:\s*"([^"]+)"/);
    return match?.[1] ?? null;
};
