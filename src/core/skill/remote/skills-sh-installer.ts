import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import type { AgentToolOption } from '@/core/agent/tools.js';

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

export const getExternalSkillPath = (projectDir: string, tool: AgentToolOption, skillName: string): string | undefined =>
    tool.skillsDir ? join(projectDir, tool.skillsDir, 'skills', skillName, 'SKILL.md') : undefined;

export async function installSkillViaSkillsCli(params: {
    projectDir: string;
    source: string;
    skillName: string;
    selectedTools: AgentToolOption[];
    cliVersion?: string;
}): Promise<void> {
    const { projectDir, source, skillName, selectedTools, cliVersion = '^1.0.0' } = params;
    const unsupported = selectedTools.filter((tool) => !SKILLS_CLI_TARGETS[tool.value]);
    if (unsupported.length > 0) {
        throw new Error(`skills CLI does not support target(s): ${unsupported.map((tool) => tool.value).join(', ')}`);
    }

    const agents = selectedTools.map((tool) => SKILLS_CLI_TARGETS[tool.value]);
    const packageSpec = cliVersion ? `skills@${cliVersion}` : 'skills';

    await execFileAsync('npx', ['-y', packageSpec, 'add', source, '--skill', skillName, '--agent', ...agents, '--yes', '--copy'], {
        cwd: projectDir,
        timeout: 120000,
        shell: process.platform === 'win32',
    });

    const missing = selectedTools.filter((tool) => {
        const path = getExternalSkillPath(projectDir, tool, skillName);
        return !path || !existsSync(path);
    });
    if (missing.length > 0) {
        throw new Error(`External skill '${skillName}' missing after install for: ${missing.map((tool) => tool.value).join(', ')}`);
    }
}
