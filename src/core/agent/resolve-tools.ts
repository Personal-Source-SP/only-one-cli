import { getAgentToolById, getToolsWithSkillsDir } from './tools.js';

export type ResolveToolsArgResult = { kind: 'list'; toolIds: string[] } | { kind: 'none' } | { kind: 'unset' };

export class ResolveToolsArgError extends Error {}

export const resolveToolsArg = (raw: string | undefined): ResolveToolsArgResult => {
    if (raw === undefined) {
        return { kind: 'unset' };
    }

    const trimmed = raw.trim();
    if (!trimmed.length) {
        throw new ResolveToolsArgError('The --tools option requires a value. Use "all", "none", or a comma-separated list of tool IDs.');
    }

    const lower = trimmed.toLowerCase();
    if (lower === 'none') {
        return { kind: 'none' };
    }

    const installable = getToolsWithSkillsDir();
    if (lower === 'all') {
        return { kind: 'list', toolIds: [...installable] };
    }

    const ids = trimmed
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

    if (!ids.length) {
        throw new ResolveToolsArgError('The --tools option requires at least one tool ID when not using "all" or "none".');
    }

    const supported = new Set(installable);
    for (const id of ids) {
        if (!supported.has(id)) {
            throw new ResolveToolsArgError(
                `Unknown tool '${id}'. Valid tool ids include: ${installable.slice(0, 5).join(', ')}… (${installable.length} total).`,
            );
        }
    }

    return { kind: 'list', toolIds: ids };
};

export const validateToolIds = (toolIds: string[]): void => {
    for (const id of toolIds) {
        if (!getAgentToolById(id)?.skillsDir) {
            throw new ResolveToolsArgError(`Unknown tool '${id}'.`);
        }
    }
};
