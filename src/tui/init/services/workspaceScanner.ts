import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RULES } from '@assets/rules/index.js';
import { SKILLS } from '@assets/skills/index.js';
import { CONFIGS } from '@assets/configs/index.js';
import { PACKAGES } from '@assets/packages/index.js';
import type { ResourceItem } from '../types.js';

export function scanWorkspaceAssets(projectDir: string, selectedTools: string[]): ResourceItem[] {
    const items: ResourceItem[] = [];

    // 1. Rules
    for (const rule of RULES) {
        const compatible = rule.supportedTargets.some((t) => selectedTools.includes(t as any));
        if (!compatible && selectedTools.length > 0) continue;

        const installed =
            existsSync(join(projectDir, '.agents', 'rules', `${rule.id}.md`)) ||
            existsSync(join(projectDir, '.cursorrules')) ||
            existsSync(join(projectDir, '.gemini', 'rules', `${rule.id}.md`));

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
            existsSync(join(projectDir, '.agents', 'skills', skill.name)) || existsSync(join(projectDir, '.gemini', 'skills', skill.name));

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

    for (const pkg of PACKAGES) {
        const installed = installedPkgs.includes(pkg.id);
        items.push({
            id: `package:${pkg.id}`,
            name: pkg.id,
            description: pkg.description || '',
            category: 'package',
            isInstalled: installed,
            selected: installed,
        });
    }

    return items;
}
