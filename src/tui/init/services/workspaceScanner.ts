import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { RULES } from '@assets/rules/index.js';
import { SKILLS } from '@assets/skills/index.js';
import { CONFIGS } from '@assets/configs/index.js';
import { PACKAGES } from '@assets/packages/index.js';
import { COMBOS } from '@assets/combos/index.js';
import { MCPS } from '@assets/mcps/index.js';
import { GIT_MANIFESTS } from '@assets/git/index.js';
import { VS_LIBRARY } from '@assets/vs/index.js';
import { IGNORE_TEMPLATES } from '@assets/ignore/index.js';
import type { ResourceItem } from '../types.js';

function loadLockfileSync(filePath: string): any {
    if (!existsSync(filePath)) return null;
    try {
        return JSON.parse(readFileSync(filePath, 'utf8'));
    } catch {
        return null;
    }
}

export function scanWorkspaceAssets(projectDir: string, selectedTools: string[], customHome?: string): ResourceItem[] {
    const items: ResourceItem[] = [];
    const home = customHome || process.env.ONLY_ONE_HOME || homedir();
    const projectLock = loadLockfileSync(join(projectDir, 'only-one', 'installed.json'));
    const globalLock = loadLockfileSync(join(home, '.only-one', 'installed.json'));

    const isInstalledInLockfile = (bucket: string, id: string): boolean => {
        return Boolean(
            projectLock?.installed?.[bucket]?.[id] ||
            globalLock?.installed?.[bucket]?.[id] ||
            (bucket === 'skills' && (projectLock?.installed?.workflows?.[id] || globalLock?.installed?.workflows?.[id])),
        );
    };

    // Cache danh sách VS Code / Cursor extensions đã cài đặt
    const installedVsExtensions = new Set<string>();
    const vsExtDirs = [join(home, '.vscode', 'extensions'), join(home, '.cursor', 'extensions')];
    for (const extDir of vsExtDirs) {
        if (existsSync(extDir)) {
            try {
                for (const entry of readdirSync(extDir)) {
                    installedVsExtensions.add(entry.toLowerCase());
                }
            } catch {}
        }
    }

    // Cache cấu hình MCP Servers đã cài đặt từ Antigravity & Cursor
    const installedMcpServers = new Set<string>();
    const mcpConfigPaths = [join(home, '.gemini', 'config', 'mcp_config.json'), join(home, '.cursor', 'mcp.json')];
    for (const mcpPath of mcpConfigPaths) {
        const cfg = loadLockfileSync(mcpPath);
        if (cfg?.mcpServers) {
            for (const key of Object.keys(cfg.mcpServers)) {
                installedMcpServers.add(key.toLowerCase());
            }
        }
    }

    // 0. Combos
    for (const combo of COMBOS) {
        const installed = isInstalledInLockfile('combos', combo.id);
        items.push({
            id: `combo:${combo.id}`,
            name: combo.name || combo.id,
            description: combo.description || '',
            category: 'combo',
            isInstalled: installed,
            selected: installed,
        });
    }

    // 1. Rules
    for (const rule of RULES) {
        const compatible = rule.supportedTargets.some((t) => selectedTools.includes(t as any));
        if (!compatible && selectedTools.length > 0) continue;

        const installed =
            isInstalledInLockfile('rules', rule.id) ||
            existsSync(join(projectDir, '.agents', 'rules', `${rule.id}.md`)) ||
            existsSync(join(projectDir, '.cursorrules')) ||
            existsSync(join(projectDir, '.gemini', 'rules', `${rule.id}.md`)) ||
            existsSync(join(home, '.gemini', 'config', 'rules', `${rule.id}.md`)) ||
            existsSync(join(home, '.agents', 'rules', `${rule.id}.md`));

        items.push({
            id: `rule:${rule.id}`,
            name: rule.id,
            description: rule.description || '',
            category: 'rule',
            isInstalled: installed,
            selected: installed,
        });
    }

    // 2. Skills
    for (const skill of SKILLS) {
        const installed =
            isInstalledInLockfile('skills', skill.name) ||
            existsSync(join(projectDir, '.agents', 'skills', skill.name)) ||
            existsSync(join(projectDir, '.gemini', 'skills', skill.name)) ||
            existsSync(join(home, '.gemini', 'config', 'skills', skill.name)) ||
            existsSync(join(home, '.agents', 'skills', skill.name));

        items.push({
            id: `skill:${skill.name}`,
            name: skill.name,
            description: skill.description || '',
            category: 'skill',
            isInstalled: installed,
            selected: installed,
        });
    }

    // 3. Configs
    for (const config of Object.values(CONFIGS)) {
        const installed = existsSync(join(projectDir, config.name));
        items.push({
            id: `config:${config.name}`,
            name: config.name,
            description: config.description || '',
            category: 'config',
            isInstalled: installed,
            selected: installed,
        });
    }

    // 4. Packages
    const pkgJsonPath = join(projectDir, 'package.json');
    let installedPkgs: string[] = [];
    if (existsSync(pkgJsonPath)) {
        try {
            const pkgContent = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
            installedPkgs = Object.keys({ ...pkgContent.dependencies, ...pkgContent.devDependencies });
        } catch {
            installedPkgs = [];
        }
    }

    const globalNpmModulesDir =
        customHome || process.env.ONLY_ONE_HOME
            ? join(home, 'AppData', 'Roaming', 'npm', 'node_modules')
            : process.platform === 'win32'
              ? join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'npm', 'node_modules')
              : '/usr/local/lib/node_modules';

    for (const pkg of PACKAGES) {
        const isNpmInstalledGlobally =
            pkg.installer.kind === 'npm' &&
            (existsSync(join(globalNpmModulesDir, pkg.installer.packageName)) || isInstalledInLockfile('packages', pkg.id));
        const isSkillPkgInstalled =
            pkg.installer.kind === 'skills' &&
            (existsSync(join(home, '.gemini', 'config', 'skills', pkg.installer.skillName)) ||
                existsSync(join(projectDir, '.agents', 'skills', pkg.installer.skillName)) ||
                isInstalledInLockfile('skills', pkg.installer.skillName));
        const installed = installedPkgs.includes(pkg.id) || isNpmInstalledGlobally || isSkillPkgInstalled;
        items.push({
            id: `package:${pkg.id}`,
            name: pkg.id,
            description: pkg.description || '',
            category: 'package',
            isInstalled: installed,
            selected: installed,
        });
    }

    // 5. MCPs
    for (const mcp of MCPS) {
        const installed = isInstalledInLockfile('mcps', mcp.id) || installedMcpServers.has(mcp.id.toLowerCase());
        items.push({
            id: `mcp:${mcp.id}`,
            name: mcp.id,
            description: `Model Context Protocol server (${mcp.id})`,
            category: 'mcp',
            isInstalled: installed,
            selected: installed,
        });
    }

    // 6. Git
    for (const git of Object.values(GIT_MANIFESTS)) {
        const installed = git.files.some((f) => existsSync(join(home, f.dest)) || existsSync(join(projectDir, f.dest)));
        items.push({
            id: `git:${git.id}`,
            name: git.name || git.id,
            description: git.description || '',
            category: 'git',
            isInstalled: installed,
            selected: installed,
        });
    }

    // 7. VS Code Extensions
    for (const ext of VS_LIBRARY.extensions.slice(0, 15)) {
        const extLower = ext.toLowerCase();
        const installed = Array.from(installedVsExtensions).some((dir) => dir.startsWith(`${extLower}-`) || dir === extLower);
        items.push({
            id: `vs:${ext}`,
            name: ext,
            description: 'VS Code Recommended Extension',
            category: 'vs',
            isInstalled: installed,
            selected: installed,
        });
    }

    // 8. Ignore Templates
    for (const [targetKey, tmpl] of Object.entries(IGNORE_TEMPLATES)) {
        const installed = existsSync(join(projectDir, tmpl.fileName));
        items.push({
            id: `ignore:${targetKey}`,
            name: tmpl.fileName,
            description: `Ignore configuration file (${tmpl.fileName})`,
            category: 'ignore',
            isInstalled: installed,
            selected: installed,
        });
    }

    return items;
}
