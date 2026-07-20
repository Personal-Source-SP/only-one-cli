export type McpServerConfig = {
    command: string;
    args?: string[];
    env?: Record<string, string>;
};

export type McpManifest = {
    id: string;
    server: McpServerConfig;
};

export type McpManifestWarning = {
    file: string;
    message: string;
};

export type ReadMcpManifestsResponse = {
    manifests: McpManifest[];
    warnings: McpManifestWarning[];
};

export type McpMergeStatus = 'added' | 'skipped' | 'unchanged' | 'overwritten';

export type McpMergeResult = {
    id: string;
    status: McpMergeStatus;
    credentialKeys: string[];
};

export type McpIdeAdapter = {
    id: string;
    name: string;
    getConfigPath: (homeDir: string, platform: NodeJS.Platform) => string;
    getMcpServers: (config: Record<string, unknown>) => Record<string, unknown>;
    setMcpServers: (config: Record<string, unknown>, servers: Record<string, unknown>) => Record<string, unknown>;
};
