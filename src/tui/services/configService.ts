import fs from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { normalizePhaseRoute } from './herdrService.js';
import { DEFAULT_GLOBAL_CONFIG, type OnlyOneGlobalConfig } from '../types/config.js';

export function getGlobalConfigPath(customHome?: string): string {
    const baseHome = customHome || homedir();
    return path.join(baseHome, '.only-one', 'config.json');
}

export async function loadGlobalConfig(customHome?: string): Promise<OnlyOneGlobalConfig> {
    const configPath = getGlobalConfigPath(customHome);
    try {
        const raw = await fs.readFile(configPath, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<OnlyOneGlobalConfig>;
        return {
            ...DEFAULT_GLOBAL_CONFIG,
            ...parsed,
            cleanPolicy: {
                ...DEFAULT_GLOBAL_CONFIG.cleanPolicy,
                ...(parsed.cleanPolicy || {}),
            },
            agentRouting: {
                ...DEFAULT_GLOBAL_CONFIG.agentRouting,
                ...(Object.fromEntries(
                    Object.entries(parsed.agentRouting || {}).map(([key, val]) => [key, normalizePhaseRoute(val as any)]),
                ) as any),
            },
            herdr: {
                ...DEFAULT_GLOBAL_CONFIG.herdr,
                ...(parsed.herdr || {}),
            },
        };
    } catch {
        await saveGlobalConfig(DEFAULT_GLOBAL_CONFIG, customHome);
        return DEFAULT_GLOBAL_CONFIG;
    }
}

export async function saveGlobalConfig(config: OnlyOneGlobalConfig, customHome?: string): Promise<void> {
    const configPath = getGlobalConfigPath(customHome);
    const dir = path.dirname(configPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}
