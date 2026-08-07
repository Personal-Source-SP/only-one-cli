import { access, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { checkGit, checkNode, type CheckResult } from '@/core/doctor/checks.js';
import type { RunDoctorOptions } from '@/core/doctor/types.js';
import { getAllowedVsSettingsTargets } from '@/core/target-selection/index.js';
import { findVsEditor } from '@/core/vs/index.js';

export const runDoctorChecksStep = async (options: RunDoctorOptions = {}): Promise<CheckResult[]> => {
    const results: CheckResult[] = [];
    const cwd = process.cwd();

    // 1. Môi trường: Node.js, npm, nvm, git
    const gitRes = await checkGit();
    results.push({ ...gitRes, category: 'Environment' });

    const nodeRes = await checkNode();
    results.push({ ...nodeRes, category: 'Environment' });

    try {
        const npmVersion = execFileSync('npm', ['--version'], { encoding: 'utf-8' }).trim();
        results.push({
            category: 'Environment',
            name: 'npm',
            ok: true,
            detail: npmVersion,
            required: true,
        });
    } catch {
        results.push({
            category: 'Environment',
            name: 'npm',
            ok: false,
            detail: 'not found',
            required: true,
            remediation: 'Install Node.js & npm from https://nodejs.org/',
        });
    }

    try {
        const nvmOutput = execFileSync('bash', ['-c', 'source ~/.nvm/nvm.sh 2>/dev/null && nvm --version'], {
            encoding: 'utf-8',
        }).trim();
        results.push({
            category: 'Environment',
            name: 'nvm',
            ok: Boolean(nvmOutput),
            detail: nvmOutput || 'not loaded in shell',
            required: false,
            remediation: nvmOutput ? undefined : 'Install or configure nvm (Node Version Manager)',
        });
    } catch {
        results.push({
            category: 'Environment',
            name: 'nvm',
            ok: false,
            detail: 'not found',
            required: false,
            remediation: 'Install nvm from https://github.com/nvm-sh/nvm',
        });
    }

    // 2. Thư viện & Tools: GitNexus, OpenSpec
    try {
        const gitNexusVer = execFileSync('gitnexus', ['--version'], { encoding: 'utf-8' }).trim();
        results.push({
            category: 'Libraries',
            name: 'GitNexus',
            ok: true,
            detail: gitNexusVer,
            required: false,
        });
    } catch {
        results.push({
            category: 'Libraries',
            name: 'GitNexus',
            ok: false,
            detail: 'not found',
            required: false,
            remediation: 'Install gitnexus global CLI or check path',
        });
    }

    try {
        const openspecVer = execFileSync('openspec', ['--version'], { encoding: 'utf-8' }).trim();
        results.push({
            category: 'Libraries',
            name: 'OpenSpec',
            ok: true,
            detail: openspecVer,
            required: false,
        });
    } catch {
        results.push({
            category: 'Libraries',
            name: 'OpenSpec',
            ok: false,
            detail: 'not found',
            required: false,
            remediation: 'Install openspec via `npm install -g @openspec/cli`',
        });
    }

    // Target IDE resolution
    const targetEditorId = options.targetEditorId || 'vscode';
    const targetsToCheck =
        targetEditorId === 'all' ? getAllowedVsSettingsTargets() : getAllowedVsSettingsTargets().filter((t) => t.id === targetEditorId);

    // Default fallback descriptor if selected editor isn't in targets (or defaults to vscode)
    const effectiveTargets = targetsToCheck.length ? targetsToCheck : [getAllowedVsSettingsTargets()[0]];

    for (const target of effectiveTargets) {
        const editorDescriptor = target.vs || findVsEditor(target.id as any);
        const editorName = editorDescriptor?.name || target.id;

        // 3. Setting Editor
        if (editorDescriptor) {
            const settingsPath = editorDescriptor.resolveSettingsPath(homedir(), process.platform as any);
            try {
                await access(settingsPath);
                results.push({
                    category: 'IDE Settings',
                    name: `${editorName} settings.json`,
                    ok: true,
                    detail: settingsPath,
                    required: true,
                });
            } catch {
                results.push({
                    category: 'IDE Settings',
                    name: `${editorName} settings.json`,
                    ok: false,
                    detail: `Missing at ${settingsPath}`,
                    required: false,
                    remediation: `Open ${editorName} to create initial settings or sync via only-one`,
                });
            }
        }

        // 7. Extensions
        if (editorDescriptor && editorDescriptor.commandCandidates.length) {
            let extensionCount: number | null = null;
            for (const cmd of editorDescriptor.commandCandidates) {
                try {
                    const extOutput = execFileSync(cmd, ['--list-extensions'], { encoding: 'utf-8' });
                    const exts = extOutput.trim().split('\n').filter(Boolean);
                    extensionCount = exts.length;
                    break;
                } catch {
                    // Try next command candidate
                }
            }

            if (extensionCount !== null) {
                results.push({
                    category: 'Extensions',
                    name: `${editorName} extensions`,
                    ok: true,
                    detail: `${extensionCount} installed`,
                    required: false,
                });
            } else {
                results.push({
                    category: 'Extensions',
                    name: `${editorName} extensions`,
                    ok: false,
                    detail: `CLI command (${editorDescriptor.commandCandidates.join(', ')}) not available`,
                    required: false,
                    remediation: `Ensure ${editorName} shell command is installed in PATH`,
                });
            }
        }
    }

    // 4. Các MCP
    try {
        const mcpConfigPath = join(cwd, 'mcp.json');
        await access(mcpConfigPath);
        results.push({
            category: 'MCP',
            name: 'MCP Config (mcp.json)',
            ok: true,
            detail: mcpConfigPath,
            required: false,
        });
    } catch {
        results.push({
            category: 'MCP',
            name: 'MCP Config (mcp.json)',
            ok: false,
            detail: 'No local mcp.json found',
            required: false,
            remediation: 'Configure MCP servers via `only-one` dashboard',
        });
    }

    // 5. Skills, Workflows, Rules
    const agentsDir = join(cwd, '.agents');
    try {
        const skillsDir = join(agentsDir, 'skills');
        const skills = await readdir(skillsDir);
        results.push({
            category: 'Agent Assets',
            name: 'Skills (.agents/skills)',
            ok: true,
            detail: `${skills.length} skills found`,
            required: false,
        });
    } catch {
        results.push({
            category: 'Agent Assets',
            name: 'Skills (.agents/skills)',
            ok: false,
            detail: 'Missing directory',
            required: false,
            remediation: 'Run `only-one` to sync agent skills',
        });
    }

    try {
        const workflowsDir = join(agentsDir, 'workflows');
        const workflows = await readdir(workflowsDir);
        results.push({
            category: 'Agent Assets',
            name: 'Workflows (.agents/workflows)',
            ok: true,
            detail: `${workflows.length} workflows found`,
            required: false,
        });
    } catch {
        results.push({
            category: 'Agent Assets',
            name: 'Workflows (.agents/workflows)',
            ok: false,
            detail: 'Missing directory',
            required: false,
        });
    }

    try {
        const rulesPath = join(agentsDir, 'AGENTS.md');
        await access(rulesPath);
        results.push({
            category: 'Agent Assets',
            name: 'Rules (AGENTS.md)',
            ok: true,
            detail: rulesPath,
            required: false,
        });
    } catch {
        results.push({
            category: 'Agent Assets',
            name: 'Rules (AGENTS.md)',
            ok: false,
            detail: 'Missing AGENTS.md file',
            required: false,
        });
    }

    // 6. Git, npm, docker ignore
    const ignoreFiles = [
        { name: '.gitignore', path: join(cwd, '.gitignore') },
        { name: '.npmignore', path: join(cwd, '.npmignore') },
        { name: '.dockerignore', path: join(cwd, '.dockerignore') },
    ];

    for (const ignoreFile of ignoreFiles) {
        try {
            await access(ignoreFile.path);
            results.push({
                category: 'Ignore Files',
                name: ignoreFile.name,
                ok: true,
                detail: 'Present',
                required: false,
            });
        } catch {
            results.push({
                category: 'Ignore Files',
                name: ignoreFile.name,
                ok: false,
                detail: 'Missing',
                required: false,
                remediation: `Create ${ignoreFile.name} in project root if needed`,
            });
        }
    }

    return results;
};
