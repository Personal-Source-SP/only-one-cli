import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';
import { bumpDecimalVersion, DEFAULT_ASSET_VERSION } from './version.js';

export interface BumpAssetResult {
    assetType: string;
    id: string;
    oldVersion: string;
    newVersion: string;
    filePath: string;
}

export function normalizeAssetType(typeInput: string): string {
    const lower = typeInput.toLowerCase().trim();
    const map: Record<string, string> = {
        workflow: 'workflows',
        workflows: 'workflows',
        skill: 'skills',
        skills: 'skills',
        rule: 'rules',
        rules: 'rules',
        mcp: 'mcps',
        mcps: 'mcps',
        package: 'packages',
        packages: 'packages',
        combo: 'combos',
        combos: 'combos',
        git: 'git',
        vs: 'vs',
        config: 'configs',
        configs: 'configs',
    };

    const matched = map[lower];
    if (!matched) {
        throw new Error(
            `Unknown asset type: "${typeInput}". Supported types: workflows, skills, rules, mcps, packages, combos, git, vs, configs.`,
        );
    }
    return matched;
}

export function resolveAssetManifestFilePath(normalizedType: string, customRoot?: string): string {
    const root = customRoot || resolvePackageRoot(import.meta.url);
    return join(root, 'assets', normalizedType, 'index.ts');
}

/**
 * Finds and increments the decimal version of an asset in its manifest file.
 */
export async function bumpAssetManifestVersion(
    typeInput: string,
    idInput: string,
    options?: { customRoot?: string },
): Promise<BumpAssetResult> {
    const assetType = normalizeAssetType(typeInput);
    const id = idInput.trim();
    const filePath = resolveAssetManifestFilePath(assetType, options?.customRoot);

    const content = await readFile(filePath, 'utf-8');

    // For VS_LIBRARY (singleton manifest)
    if (assetType === 'vs') {
        const vsRegex = /version:\s*'([^']+)'/;
        const match = content.match(vsRegex);
        if (!match) {
            throw new Error(`Could not find version declaration in ${filePath}`);
        }
        const oldVersion = match[1];
        const newVersion = bumpDecimalVersion(oldVersion);
        const updated = content.replace(vsRegex, `version: '${newVersion}'`);
        await writeFile(filePath, updated, 'utf-8');
        return { assetType, id: 'vs_library', oldVersion, newVersion, filePath };
    }

    // Pattern to match asset block:
    // Look for (name: 'id' | id: 'id') followed by other properties within braces
    // Or version before/after name/id
    const blockRegex = new RegExp(`({[^{}]*?(?:name|id):\\s*['"]${escapeRegex(id)}['"][^{}]*?})`, 's');

    const match = content.match(blockRegex);
    if (!match) {
        throw new Error(`Asset "${id}" not found in manifest file: ${filePath}. Please verify the asset name/id.`);
    }

    const matchedBlock = match[1];
    const versionMatch = matchedBlock.match(/version:\s*['"]([^'"]+)['"]/);

    let oldVersion = DEFAULT_ASSET_VERSION;
    let newVersion = bumpDecimalVersion(oldVersion);
    let updatedBlock: string;

    if (versionMatch) {
        oldVersion = versionMatch[1];
        newVersion = bumpDecimalVersion(oldVersion);
        updatedBlock = matchedBlock.replace(/version:\s*['"][^'"]+['"]/, `version: '${newVersion}'`);
    } else {
        // If version property wasn't there yet, insert it right after the identifier
        updatedBlock = matchedBlock.replace(/((?:name|id):\s*['"][^'"]+['"],?)/, `$1\n        version: '${newVersion}',`);
    }

    const updatedContent = content.replace(matchedBlock, updatedBlock);
    await writeFile(filePath, updatedContent, 'utf-8');

    return {
        assetType,
        id,
        oldVersion,
        newVersion,
        filePath,
    };
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
