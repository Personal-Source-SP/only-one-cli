import type { McpManifest, McpMergeResult, McpMergeStatus } from './types.js';

export type MergeMcpServersResponse = {
    changed: boolean;
    results: McpMergeResult[];
    servers: Record<string, unknown>;
};

export const getMcpCredentialKeys = (manifest: McpManifest): string[] => Object.keys(manifest.server.env ?? {});

export const mergeMcpServers = (
    existingServers: Record<string, unknown>,
    manifests: McpManifest[],
    ideId?: string,
    overwriteList?: string[],
): MergeMcpServersResponse => {
    const servers: Record<string, unknown> = { ...existingServers };
    const results: McpMergeResult[] = [];
    let changed = false;

    for (const manifest of manifests) {
        const hasExisting = Object.prototype.hasOwnProperty.call(servers, manifest.id);

        if (hasExisting) {
            const isConfirmed = ideId && overwriteList && overwriteList.includes(`${ideId}:${manifest.id}`);
            if (!isConfirmed) {
                results.push({ credentialKeys: getMcpCredentialKeys(manifest), id: manifest.id, status: 'skipped' });
                continue;
            }
        }

        servers[manifest.id] = manifest.server;
        changed = true;
        const status: McpMergeStatus = hasExisting ? ('overwritten' as any) : 'added';
        results.push({ credentialKeys: getMcpCredentialKeys(manifest), id: manifest.id, status });
    }

    if (!changed) {
        return { changed: false, results, servers: existingServers };
    }

    return { changed, results, servers };
};
