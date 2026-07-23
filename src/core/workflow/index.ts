import { existsSync } from 'node:fs';
import { mkdir, cp } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AgentToolOption } from '@/core/agent/tools.js';
import type { ProgramDeps } from '@/cli/deps.js';
import { WORKFLOWS } from '@assets/workflows/index.js';
import { installSkills, type SkillInstallResult } from '@/core/skill/index.js';

import { resolvePackageRoot } from '@/core/runtime/package-root.js';

const workflowsDir = join(resolvePackageRoot(import.meta.url), 'assets/workflows');

export interface ExistingWorkflow {
    toolId: string;
    toolName: string;
    workflowName: string;
    destPath: string;
    exists: boolean;
}

export interface WorkflowInstallResult {
    toolId: string;
    toolName: string;
    workflowName: string;
    status: 'success' | 'skipped' | 'failed';
    error?: string;
    installedSkills?: SkillInstallResult[];
}

export interface WorkflowInstallRequest {
    deps: ProgramDeps;
    projectDir: string;
    selectedTools: AgentToolOption[];
    workflowNames: string[];
    overwriteList?: string[];
    noIgnore?: boolean;
}

export const checkExistingWorkflows = async (
    projectDir: string,
    selectedTools: AgentToolOption[],
    workflowNames: string[],
): Promise<ExistingWorkflow[]> => {
    const results: ExistingWorkflow[] = [];
    for (const tool of selectedTools) {
        if (!tool.skillsDir) continue;
        for (const wfName of workflowNames) {
            const destPath = join(tool.skillsDir, 'workflows', `${wfName}.md`);
            const absoluteDestPath = join(projectDir, destPath);
            const exists = existsSync(absoluteDestPath);
            results.push({
                toolId: tool.value,
                toolName: tool.name,
                workflowName: wfName,
                destPath,
                exists,
            });
        }
    }
    return results;
};

export const installWorkflows = async (request: WorkflowInstallRequest): Promise<WorkflowInstallResult[]> => {
    const { deps, projectDir, selectedTools, workflowNames, overwriteList = [], noIgnore = false } = request;
    const results: WorkflowInstallResult[] = [];

    const existingChecks = await checkExistingWorkflows(projectDir, selectedTools, workflowNames);

    for (const tool of selectedTools) {
        if (!tool.skillsDir) continue;

        for (const wfName of workflowNames) {
            const check = existingChecks.find((c) => c.toolId === tool.value && c.workflowName === wfName);
            const exists = check ? check.exists : false;

            if (exists) {
                const identifier = `${tool.value}:${wfName}`;
                if (!overwriteList.includes(identifier)) {
                    results.push({
                        toolId: tool.value,
                        toolName: tool.name,
                        workflowName: wfName,
                        status: 'skipped',
                    });
                    continue;
                }
            }

            const toolWorkflowsDir = join(projectDir, tool.skillsDir, 'workflows');
            const destPath = join(toolWorkflowsDir, `${wfName}.md`);
            const srcPath = join(workflowsDir, `${wfName}.md`);

            try {
                await mkdir(toolWorkflowsDir, { recursive: true });
                await cp(srcPath, destPath, { force: true });

                // Check dependencies (Required Skills)
                const wfMeta = WORKFLOWS.find((w) => w.name === wfName);
                let skillResults: SkillInstallResult[] = [];
                if (wfMeta?.requiredSkills?.length) {
                    const missingSkills: string[] = [];
                    for (const skillName of wfMeta.requiredSkills) {
                        const skillDestPath = join(projectDir, tool.skillsDir, 'skills', skillName);
                        if (!existsSync(skillDestPath)) {
                            missingSkills.push(skillName);
                        }
                    }

                    if (missingSkills.length > 0) {
                        deps.stdout(`  Workflow '${wfName}' requires skill(s): ${missingSkills.join(', ')}. Installing them...`);
                        skillResults = await installSkills({
                            deps,
                            projectDir,
                            selectedTools: [tool],
                            skillNames: missingSkills,
                            overwriteList: missingSkills.map((s) => `${tool.value}:${s}`),
                            noIgnore,
                        });
                    }
                }

                results.push({
                    toolId: tool.value,
                    toolName: tool.name,
                    workflowName: wfName,
                    status: 'success',
                    installedSkills: skillResults,
                });
            } catch (error: unknown) {
                results.push({
                    toolId: tool.value,
                    toolName: tool.name,
                    workflowName: wfName,
                    status: 'failed',
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
    }

    return results;
};
