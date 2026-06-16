import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import yaml from 'js-yaml';
import type { ProgramDeps } from '../../src/cli/deps.js';
import { getAgentToolById } from '../../src/core/agent/tools.js';

const OPENSPEC_CONFIG_FILE = '.openspec.yaml';
const CUSTOM_SKILLS_DIRS = ['libraries/skills', '.agents/skills'] as const;

const resolveCustomSkillsDir = (projectDir: string): string | null => {
    for (const dir of CUSTOM_SKILLS_DIRS) {
        const fullPath = join(projectDir, dir);
        if (existsSync(fullPath)) {
            return fullPath;
        }
    }
    return null;
};

interface OpenspecConfig {
    agent_tools?: string[];
}

export const readOpenspecConfig = async (projectDir: string): Promise<OpenspecConfig> => {
    const configPath = join(projectDir, OPENSPEC_CONFIG_FILE);

    if (!existsSync(configPath)) {
        return {};
    }

    try {
        const raw = await readFile(configPath, 'utf-8');
        const parsed = yaml.load(raw) as OpenspecConfig | null;
        return parsed ?? {};
    } catch {
        return {};
    }
};

export const syncCustomSkills = async (deps: ProgramDeps, projectDir: string): Promise<void> => {
    const config = await readOpenspecConfig(projectDir);
    const toolIds = config.agent_tools ?? [];

    if (toolIds.length === 0) {
        deps.stdout('  Custom skills: no tools selected, skipping');
        return;
    }

    const customSkillsDir = resolveCustomSkillsDir(projectDir);

    if (!customSkillsDir) {
        deps.stdout(`  Custom skills: no skills directory found (checked: ${CUSTOM_SKILLS_DIRS.join(', ')}), nothing to sync`);
        return;
    }

    for (const toolId of toolIds) {
        const tool = getAgentToolById(toolId);

        if (!tool?.skillsDir) {
            deps.stdout(`  ${toolId}: unknown tool or no skills directory, skipping`);
            continue;
        }

        const toolSkillsDir = join(projectDir, tool.skillsDir, 'skills');

        try {
            const skillNames = await readdir(customSkillsDir);

            for (const skillName of skillNames) {
                const srcPath = join(customSkillsDir, skillName);
                const srcStat = await stat(srcPath);

                if (!srcStat.isDirectory()) {
                    continue;
                }

                const destPath = join(toolSkillsDir, skillName);
                await mkdir(destPath, { recursive: true });
                await cp(srcPath, destPath, { recursive: true, force: true });
            }
        } catch {
            deps.stdout(`  ${toolId}: failed to sync custom skills`);
        }
    }
};
