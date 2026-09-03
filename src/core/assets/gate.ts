import { execSync } from 'node:child_process';
import { RULES } from '../../../assets/rules/index.js';
import { WORKFLOWS } from '../../../assets/workflows/index.js';
import { SKILLS } from '../../../assets/skills/index.js';
import { MCPS } from '../../../assets/mcps/index.js';
import { PACKAGES } from '../../../assets/packages/index.js';
import { COMBOS } from '../../../assets/combos/index.js';
import { GIT_MANIFESTS, GIT_SNIPPETS } from '../../../assets/git/index.js';
import { VS_LIBRARY } from '../../../assets/vs/index.js';
import { compareDecimalVersions, isValidDecimalVersion } from './version.js';

export interface AssetChangeViolation {
    assetType: string;
    assetId: string;
    modifiedFile: string;
    error: string;
}

/**
 * Detects changed files inside the assets directory using git diff.
 */
export function detectChangedAssetFiles(baseRef = 'origin/main'): string[] {
    const diffCommands = [
        `git diff --name-only ${baseRef}...HEAD -- assets/`,
        `git diff --name-only HEAD~1 -- assets/`,
        `git diff --name-only HEAD -- assets/`,
        `git status --porcelain assets/`,
    ];

    for (const cmd of diffCommands) {
        try {
            const stdout = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
            const files = stdout
                .split('\n')
                .map((line) => {
                    // handle git status porcelain format
                    const trimmed = line.trim();
                    if (!trimmed) return '';
                    if (cmd.includes('status')) {
                        const parts = trimmed.split(/\s+/);
                        return parts[parts.length - 1];
                    }
                    return trimmed;
                })
                .filter((f) => f && f.startsWith('assets/'));

            if (files.length > 0) {
                return Array.from(new Set(files));
            }
        } catch {
            // continue to next fallback command
        }
    }

    return [];
}

/**
 * Maps a file inside assets/ to its corresponding asset type and id.
 */
export function mapChangedFileToAsset(filePath: string): { type: string; id: string } | null {
    const normalized = filePath.replace(/\\/g, '/');

    // workflows: assets/workflows/foo.md
    const wfMatch = normalized.match(/^assets\/workflows\/([^/]+)\.md$/);
    if (wfMatch) {
        return { type: 'workflows', id: wfMatch[1] };
    }

    // skills: assets/skills/skill-name/...
    const skillMatch = normalized.match(/^assets\/skills\/([^/]+)\//);
    if (skillMatch) {
        return { type: 'skills', id: skillMatch[1] };
    }

    // rules: assets/rules/foo.md
    const ruleMatch = normalized.match(/^assets\/rules\/([^/]+)\.md$/);
    if (ruleMatch) {
        const filename = `${ruleMatch[1]}.md`;
        const matchedRule = RULES.find((r) => r.sourceFile === filename);
        if (matchedRule) {
            return { type: 'rules', id: matchedRule.id };
        }
    }

    return null;
}

/**
 * Verifies that all registered asset manifests have a valid decimal rollover version.
 */
export function verifyAllAssetsHaveValidVersions(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const check = (type: string, id: string, version: string | undefined) => {
        if (!version) {
            errors.push(`[${type}] "${id}" is missing a "version" property.`);
        } else if (!isValidDecimalVersion(version)) {
            errors.push(`[${type}] "${id}" has invalid decimal version "${version}". Must match format X.Y.Z (e.g. 0.0.1).`);
        }
    };

    RULES.forEach((r) => check('rules', r.id, r.version));
    WORKFLOWS.forEach((w) => check('workflows', w.name, w.version));
    SKILLS.forEach((s) => check('skills', s.name, s.version));
    MCPS.forEach((m) => check('mcps', m.id, m.version));
    PACKAGES.forEach((p) => check('packages', p.id, p.version));
    COMBOS.forEach((c) => check('combos', c.id, c.version));
    Object.values(GIT_MANIFESTS).forEach((g) => check('git', g.id, g.version));
    GIT_SNIPPETS.forEach((s) => check('git_snippets', s.id, s.version));
    check('vs', 'vs_library', VS_LIBRARY.version);

    return {
        valid: errors.length === 0,
        errors,
    };
}
