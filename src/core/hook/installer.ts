import { existsSync } from 'node:fs';
import { cp, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';

export interface InstallHooksOptions {
    projectDir: string;
    isGlobal?: boolean;
    tools?: string[];
}

export interface InstallHooksResult {
    installedFiles: string[];
    agentsHooksDir: string;
    configsCreated: string[];
}

export async function installHooks(options: InstallHooksOptions): Promise<InstallHooksResult> {
    const { projectDir, isGlobal = false, tools = ['antigravity', 'claude'] } = options;
    const packageRoot = resolvePackageRoot(import.meta.url);
    const srcHooksDir = join(packageRoot, 'assets', 'hooks');

    const baseDir = isGlobal ? join(homedir(), '.agents') : join(projectDir, '.agents');
    const targetHooksDir = join(baseDir, 'hooks');
    await mkdir(targetHooksDir, { recursive: true });

    const hookScripts = ['block-heavy-scripts.sh', 'no-secrets.sh', 'format-on-edit.sh', 'test-gate.sh', 'protect-configs.sh'];

    const installedFiles: string[] = [];
    for (const script of hookScripts) {
        const srcPath = join(srcHooksDir, script);
        const destPath = join(targetHooksDir, script);
        if (existsSync(srcPath)) {
            await cp(srcPath, destPath, { force: true });
            installedFiles.push(destPath);
        }
    }

    const configsCreated: string[] = [];

    // 1. Antigravity .agents/hooks.json
    if (tools.includes('antigravity')) {
        const srcJson = join(srcHooksDir, 'hooks.json');
        const destJson = isGlobal ? join(homedir(), '.gemini', 'config', 'hooks.json') : join(baseDir, 'hooks.json');
        if (existsSync(srcJson)) {
            await mkdir(dirname(destJson), { recursive: true });
            await cp(srcJson, destJson, { force: true });
            configsCreated.push(destJson);
        }
    }

    // 2. Claude Code .claude/settings.json
    if (tools.includes('claude')) {
        const srcClaude = join(srcHooksDir, 'claude-settings.json');
        const destClaude = isGlobal ? join(homedir(), '.claude', 'settings.json') : join(projectDir, '.claude', 'settings.json');
        if (existsSync(srcClaude)) {
            await mkdir(dirname(destClaude), { recursive: true });
            await cp(srcClaude, destClaude, { force: true });
            configsCreated.push(destClaude);
        }
    }

    return {
        installedFiles,
        agentsHooksDir: targetHooksDir,
        configsCreated,
    };
}
