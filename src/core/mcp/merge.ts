import type { McpManifest, McpMergeResult } from './types.js';

export type MergeMcpServersResponse = {
    changed: boolean;
    results: McpMergeResult[];
    servers: Record<string, unknown>;
};

export const getMcpCredentialKeys = (manifest: McpManifest): string[] => Object.keys(manifest.server.env ?? {});

export const mergeMcpServers = (existingServers: Record<string, unknown>, manifests: McpManifest[]): MergeMcpServersResponse => {
    const servers: Record<string, unknown> = { ...existingServers };
    const results: McpMergeResult[] = [];
    let changed = false;

    for (const manifest of manifests) {
        if (Object.prototype.hasOwnProperty.call(servers, manifest.id)) {
            results.push({ credentialKeys: getMcpCredentialKeys(manifest), id: manifest.id, status: 'skipped' });
            continue;
        }

        servers[manifest.id] = manifest.server;
        changed = true;
        results.push({ credentialKeys: getMcpCredentialKeys(manifest), id: manifest.id, status: 'added' });
    }

    if (!changed) {
        return { changed: false, results, servers: existingServers };
    }

    return { changed, results, servers };
};
