import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MCPS } from '@assets/mcps/index.js';
import type { McpManifest, McpManifestWarning, McpServerConfig, ReadMcpManifestsResponse } from './types.js';
import { isRecord } from '@/utils/index.js';

const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((entry) => typeof entry === 'string');

const isStringRecord = (value: unknown): value is Record<string, string> =>
    isRecord(value) && Object.values(value).every((entry) => typeof entry === 'string');

const getCredentialKeys = (config: McpServerConfig): string[] => Object.keys(config.env ?? {});

export const validateMcpServerConfig = (id: string, value: unknown): McpServerConfig => {
    if (!isRecord(value)) {
        throw new Error(`MCP '${id}' must be a JSON object`);
    }

    if (typeof value.command !== 'string' || !value.command.trim()) {
        throw new Error(`MCP '${id}' must define a non-empty command`);
    }

    if (value.args !== undefined && !isStringArray(value.args)) {
        throw new Error(`MCP '${id}' args must be an array of strings`);
    }

    if (value.env !== undefined && !isStringRecord(value.env)) {
        throw new Error(`MCP '${id}' env must be an object of string values`);
    }

    const server: McpServerConfig = {
        command: value.command,
        ...(value.args === undefined ? {} : { args: value.args }),
        ...(value.env === undefined ? {} : { env: value.env }),
    };

    const nonEmptySecrets = getCredentialKeys(server).filter((key) => server.env?.[key]);
    if (nonEmptySecrets.length) {
        throw new Error(`MCP '${id}' env placeholders must be empty: ${nonEmptySecrets.join(', ')}`);
    }

    return server;
};

export const readMcpManifests = async (directory?: string): Promise<ReadMcpManifestsResponse> => {
    if (directory && existsSync(directory)) {
        try {
            const files = (await readdir(directory)).filter((file) => file.endsWith('.json')).sort((a, b) => a.localeCompare(b));
            const manifests: McpManifest[] = [];
            const warnings: McpManifestWarning[] = [];
            const seen = new Set<string>();

            for (const file of files) {
                const id = file.replace(/\.json$/, '');
                const path = join(directory, file);

                try {
                    if (seen.has(id)) {
                        throw new Error(`Duplicate MCP id '${id}'`);
                    }
                    const parsed = JSON.parse(await readFile(path, 'utf-8')) as unknown;
                    const server = validateMcpServerConfig(id, parsed);
                    manifests.push({ id, server });
                    seen.add(id);
                } catch (error) {
                    warnings.push({ file, message: error instanceof Error ? error.message : String(error) });
                }
            }

            return { manifests, warnings };
        } catch {
            // fall back
        }
    }

    return { manifests: MCPS, warnings: [] };
};
