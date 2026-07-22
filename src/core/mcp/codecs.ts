import * as toml from '@iarna/toml';

export type McpConfigCodec = {
    extension: string;
    parse: (content: string, path: string) => Record<string, unknown>;
    stringify: (config: Record<string, unknown>) => string;
};

const parseObject = (value: unknown, path: string, format: string): Record<string, unknown> => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`Malformed ${format} MCP configuration at '${path}': root must be an object`);
    }
    return value as Record<string, unknown>;
};

const jsonCodec: McpConfigCodec = {
    extension: 'json',
    parse: (content, path) => {
        try {
            return parseObject(JSON.parse(content), path, 'JSON');
        } catch (error) {
            if (error instanceof Error && error.message.startsWith('Malformed JSON')) throw error;
            throw new Error(`Malformed JSON MCP configuration at '${path}': ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    stringify: (config) => `${JSON.stringify(config, null, 4)}\n`,
};

const tomlCodec: McpConfigCodec = {
    extension: 'toml',
    parse: (content, path) => {
        try {
            return parseObject(toml.parse(content), path, 'TOML');
        } catch (error) {
            if (error instanceof Error && error.message.startsWith('Malformed TOML')) throw error;
            throw new Error(`Malformed TOML MCP configuration at '${path}': ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    stringify: (config) => toml.stringify(config as toml.JsonMap),
};

export { jsonCodec, tomlCodec };
