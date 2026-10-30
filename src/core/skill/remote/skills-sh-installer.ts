import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { type AgentToolOption, resolveToolDestinationPaths } from '@/core/agent/tools.js';

import { syncGlobalSkillsManifest } from '../manifest-bridge.js';

const execFileAsync = promisify(execFile);

export const SKILLS_CLI_TARGETS: Record<string, string> = {
    antigravity: 'antigravity',
    claude: 'claude-code',
    cursor: 'cursor',
    codex: 'codex',
    cline: 'cline',
    gemini: 'gemini',
    'github-copilot': 'github-copilot',
    opencode: 'opencode',
    windsurf: 'windsurf',
};

export const getExternalSkillPath = (
    projectDir: string,
    tool: AgentToolOption,
    skillName: string,
    isGlobal = false,
): string | undefined => {
    if (isGlobal) {
        const globalPath = resolveToolDestinationPaths(tool, 'skills', projectDir, true);

        return join(globalPath, skillName, 'SKILL.md');
    }

    return tool.skillsDir ? join(projectDir, tool.skillsDir, 'skills', skillName, 'SKILL.md') : undefined;
};

export async function installSkillViaSkillsCli(params: {
    projectDir: string;
    source: string;
    skillName: string;
    selectedTools: AgentToolOption[];
    cliVersion?: string;
    isGlobal?: boolean;
}): Promise<void> {
    const { projectDir, source, skillName, selectedTools, cliVersion = '^1.0.0', isGlobal = false } = params;
    const unsupported = selectedTools.filter((tool) => !SKILLS_CLI_TARGETS[tool.value]);

    if (unsupported.length > 0) {
        throw new Error(`skills CLI does not support target(s): ${unsupported.map((tool) => tool.value).join(', ')}`);
    }

    const agents = selectedTools.map((tool) => SKILLS_CLI_TARGETS[tool.value]);
    const cleanVersion = cliVersion && !cliVersion.startsWith('^') && cliVersion !== '1.0.0' ? cliVersion : undefined;
    const packageSpec = cleanVersion ? `skills@${cleanVersion}` : 'skills';

    const args = ['-y', packageSpec, 'add', source, '--skill', skillName, '--agent', ...agents, '--yes', '--copy'];

    if (isGlobal) {
        args.push('-g');
    }

    await execFileAsync('npx', args, {
        cwd: projectDir,
        timeout: 120000,
        shell: process.platform === 'win32',
    });

    for (const tool of selectedTools) {
        const targetSkillDir = resolveToolDestinationPaths(tool, 'skills', projectDir, isGlobal);
        const targetSkillPath = join(targetSkillDir, skillName);
        const localSkillPath = join(projectDir, '.agents', 'skills', skillName);

        if (targetSkillPath !== localSkillPath && existsSync(localSkillPath)) {
            await cp(localSkillPath, targetSkillPath, { recursive: true, force: true });

            if (isGlobal) {
                await rm(localSkillPath, { recursive: true, force: true });
            }
        }
    }

    const missing = selectedTools.filter((tool) => {
        const path = getExternalSkillPath(projectDir, tool, skillName, isGlobal);

        return !path || !existsSync(path);
    });

    if (missing.length > 0) {
        throw new Error(`External skill '${skillName}' missing after install for: ${missing.map((tool) => tool.value).join(', ')}`);
    }

    if (isGlobal) {
        const globalAgentsDir = join(projectDir, '.agents');

        if (existsSync(globalAgentsDir)) {
            const skillsDir = join(globalAgentsDir, 'skills');
            const remainingSkills = existsSync(skillsDir) ? await readdir(skillsDir) : [];

            if (remainingSkills.length === 0) {
                await rm(globalAgentsDir, { recursive: true, force: true });
            }
        }

        await syncGlobalSkillsManifest(projectDir);
    }
}
