import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';

export interface InstallHooksOptions {
    projectDir: string;
    isGlobal?: boolean;
    homeDir?: string;
    tools?: string[];
}

export interface InstallHooksResult {
    installedFiles: string[];
    agentsHooksDir: string;
    configsCreated: string[];
}

export async function installHooks(options: InstallHooksOptions): Promise<InstallHooksResult> {
    const { projectDir, isGlobal = false, homeDir = homedir(), tools = ['antigravity', 'claude'] } = options;
    const packageRoot = resolvePackageRoot(import.meta.url);
    const srcHooksDir = join(packageRoot, 'assets', 'agents', 'hooks');

    const hookScripts = ['block-heavy-scripts.sh', 'no-secrets.sh', 'format-on-edit.sh', 'protect-configs.sh'];

    const installedFiles: string[] = [];
    const configsCreated: string[] = [];
    let primaryHooksDir = '';

    const copyScriptsTo = async (destDir: string) => {
        await mkdir(destDir, { recursive: true });
        for (const script of hookScripts) {
            const srcPath = join(srcHooksDir, script);
            const destPath = join(destDir, script);
            if (existsSync(srcPath)) {
                await cp(srcPath, destPath, { force: true });
                installedFiles.push(destPath);
            }
        }
    };

    // 1. Antigravity hooks & config
    if (tools.includes('antigravity')) {
        const agyHooksDir = isGlobal ? join(homeDir, '.gemini', 'config', 'hooks') : join(projectDir, '.gemini', 'hooks');
        await copyScriptsTo(agyHooksDir);
        primaryHooksDir = agyHooksDir;

        const srcJson = join(srcHooksDir, 'hooks.json');
        const destJson = isGlobal ? join(homeDir, '.gemini', 'config', 'hooks.json') : join(projectDir, '.gemini', 'hooks.json');
        if (existsSync(srcJson)) {
            await mkdir(dirname(destJson), { recursive: true });
            const rawContent = await readFile(srcJson, 'utf-8');
            const commandPrefix = isGlobal ? '~/.gemini/config/hooks/' : '.gemini/hooks/';
            const customized = rawContent.replaceAll('.agents/hooks/', commandPrefix);
            await writeFile(destJson, customized, 'utf-8');
            configsCreated.push(destJson);
        }
    }

    // 2. Claude Code hooks & config
    if (tools.includes('claude')) {
        const claudeHooksDir = isGlobal ? join(homeDir, '.claude', 'hooks') : join(projectDir, '.claude', 'hooks');
        await copyScriptsTo(claudeHooksDir);
        if (!primaryHooksDir) primaryHooksDir = claudeHooksDir;

        const srcClaude = join(srcHooksDir, 'claude-settings.json');
        const destClaude = isGlobal ? join(homeDir, '.claude', 'settings.json') : join(projectDir, '.claude', 'settings.json');
        if (existsSync(srcClaude)) {
            await mkdir(dirname(destClaude), { recursive: true });
            const rawContent = await readFile(srcClaude, 'utf-8');
            let customized = rawContent;
            if (isGlobal) {
                customized = customized
                    .replaceAll('$CLAUDE_PROJECT_DIR/.agents/hooks/', '~/.claude/hooks/')
                    .replaceAll('.agents/hooks/', '~/.claude/hooks/');
            } else {
                customized = customized.replaceAll('.agents/hooks/', '.claude/hooks/');
            }
            await writeFile(destClaude, customized, 'utf-8');
            configsCreated.push(destClaude);
        }
    }

    return {
        installedFiles,
        agentsHooksDir: primaryHooksDir,
        configsCreated,
    };
}
