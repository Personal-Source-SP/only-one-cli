import { existsSync } from 'node:fs';
import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { checkGit, checkNode, type CheckResult } from '@/core/doctor/checks.js';
import type { RunDoctorOptions } from '@/core/doctor/types.js';
import { getAllowedVsSettingsTargets } from '@/core/target-selection/index.js';
import { findVsEditor } from '@/core/vs/index.js';
import { findMcpIdeAdapter } from '@/core/mcp/index.js';
import { MCPS } from '../../../../assets/mcps/index.js';
import { SKILLS } from '../../../../assets/skills/index.js';
import { WORKFLOWS } from '../../../../assets/workflows/index.js';
import { VS_LIBRARY } from '../../../../assets/vs/index.js';
import { RULES } from '../../../../assets/rules/index.js';

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

    // 2. Thư viện & Tools: GitNexus
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

    // Target IDE resolution
    const targetEditorId = options.targetEditorId || 'vscode';
    const targetsToCheck =
        targetEditorId === 'all' ? getAllowedVsSettingsTargets() : getAllowedVsSettingsTargets().filter((t) => t.id === targetEditorId);

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

        // 7. Extensions: Check individually against VS_LIBRARY.extensions
        if (editorDescriptor && editorDescriptor.commandCandidates.length) {
            let installedExts: string[] = [];
            for (const cmd of editorDescriptor.commandCandidates) {
                try {
                    const extOutput = execFileSync(cmd, ['--list-extensions'], { encoding: 'utf-8' });
                    installedExts = extOutput
                        .trim()
                        .split('\n')
                        .filter(Boolean)
                        .map((e) => e.toLowerCase());
                    break;
                } catch {
                    // Command candidate failed
                }
            }

            for (const extId of VS_LIBRARY.extensions) {
                const isInstalled = installedExts.includes(extId.toLowerCase());
                results.push({
                    category: 'Extensions',
                    name: `extension: ${extId}`,
                    ok: isInstalled,
                    detail: isInstalled ? 'Installed' : 'Missing',
                    required: false,
                    remediation: isInstalled ? undefined : `Install extension ${extId} on ${editorName}`,
                });
            }
        }
    }

    // 4. Các MCP: Check using target IDE adapter global config + local mcp.json fallback
    let configuredMcps: string[] = [];
    const mcpAdapter = findMcpIdeAdapter(targetEditorId);
    let mcpServersObj: Record<string, unknown> = {};

    if (mcpAdapter) {
        try {
            const globalMcpPath = mcpAdapter.getConfigPath(homedir(), process.platform);
            if (existsSync(globalMcpPath)) {
                const parsed = mcpAdapter.codec.parse(await readFile(globalMcpPath, 'utf-8'), globalMcpPath);
                mcpServersObj = mcpAdapter.getMcpServers(parsed);
            }
        } catch {
            // Failed reading global MCP config
        }
    }

    if (Object.keys(mcpServersObj).length === 0) {
        try {
            const localMcpPath = join(cwd, 'mcp.json');
            const content = JSON.parse(await readFile(localMcpPath, 'utf-8'));
            mcpServersObj = content.mcpServers || {};
        } catch {
            // No local mcp.json
        }
    }

    configuredMcps = Object.keys(mcpServersObj).map((k) => k.toLowerCase());

    for (const mcpManifest of MCPS) {
        const isConfigured = configuredMcps.includes(mcpManifest.id.toLowerCase());
        results.push({
            category: 'MCP Servers',
            name: `MCP: ${mcpManifest.id}`,
            ok: isConfigured,
            detail: isConfigured ? 'Configured in IDE/Workspace' : 'Not configured',
            required: false,
            remediation: isConfigured ? undefined : `Configure MCP server '${mcpManifest.id}' via only-one`,
        });
    }

    // 5. Skills: Check against SKILLS manifest
    for (const skill of SKILLS) {
        const skillPath = join(cwd, '.agents', 'skills', skill.name, 'SKILL.md');
        let exists = false;
        try {
            await access(skillPath);
            exists = true;
        } catch {}

        results.push({
            category: 'Agent Skills',
            name: `skill: ${skill.name}`,
            ok: exists,
            detail: exists ? '.agents/skills' : 'Missing',
            required: false,
            remediation: exists ? undefined : `Sync skill '${skill.name}' via only-one`,
        });
    }

    // Workflows: Check against WORKFLOWS manifest
    for (const workflow of WORKFLOWS) {
        const workflowPath = join(cwd, '.agents', 'workflows', `${workflow.name}.md`);
        let exists = false;
        try {
            await access(workflowPath);
            exists = true;
        } catch {}

        results.push({
            category: 'Agent Workflows',
            name: `workflow: ${workflow.name}.md`,
            ok: exists,
            detail: exists ? '.agents/workflows' : 'Missing',
            required: false,
            remediation: exists ? undefined : `Sync workflow '${workflow.name}' via only-one`,
        });
    }

    // Rules: Check AGENTS.md files + RULES manifest
    try {
        const rulesPath = join(cwd, '.agents', 'AGENTS.md');
        await access(rulesPath);
        results.push({
            category: 'Agent Rules',
            name: 'rules: .agents/AGENTS.md',
            ok: true,
            detail: 'Present in project',
            required: false,
        });
    } catch {
        results.push({
            category: 'Agent Rules',
            name: 'rules: .agents/AGENTS.md',
            ok: false,
            detail: 'Missing in project root',
            required: false,
            remediation: 'Create .agents/AGENTS.md rules file',
        });
    }

    for (const ruleManifest of RULES) {
        const rulePath = join(cwd, '.agents', 'rules', ruleManifest.sourceFile);
        let exists = false;
        try {
            await access(rulePath);
            exists = true;
        } catch {}

        results.push({
            category: 'Agent Rules',
            name: `rule: ${ruleManifest.id}`,
            ok: exists,
            detail: exists ? `.agents/rules/${ruleManifest.sourceFile}` : 'Missing',
            required: false,
            remediation: exists ? undefined : `Install rule '${ruleManifest.id}' via only-one rule`,
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

    return results.sort((a, b) => (a.ok === b.ok ? 0 : a.ok ? -1 : 1));
};
