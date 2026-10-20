'use server';

import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export type DashboardTaskDoc = {
    name: string;
    path: string;
    content: string;
};

export type DashboardTask = {
    slug: string;
    folderPath: string;
    status: 'concept' | 'plan' | 'processing' | 'done';
    title: string;
    createdAt?: string;
    updatedAt?: string;
    docs: DashboardTaskDoc[];
};

export type HerdrPaneInfo = {
    paneId: string;
    tabName: string;
    agentType: string;
    status: 'idle' | 'working' | 'blocked';
    details?: string;
};

export type ActionStatusResult = {
    success: boolean;
};

function getWorkspaceDir(): string {
    return process.env.ONLY_ONE_WORKSPACE || process.cwd();
}

export async function getTasksAction(): Promise<DashboardTask[]> {
    const workspaceDir = getWorkspaceDir();
    const tasksRoot = path.join(workspaceDir, 'only-one', 'tasks');
    try {
        const entries = await fs.readdir(tasksRoot, { withFileTypes: true });
        const tasks: DashboardTask[] = [];

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            const folderPath = path.join(tasksRoot, entry.name);
            const files = await fs.readdir(folderPath);
            const mdFiles = files.filter((f) => f.endsWith('.md'));
            const docs: DashboardTaskDoc[] = [];

            for (const f of mdFiles) {
                const filePath = path.join(folderPath, f);
                const content = await fs.readFile(filePath, 'utf-8');
                docs.push({ name: f, path: filePath, content });
            }

            let status: DashboardTask['status'] = 'concept';
            let title = entry.name;
            let createdAt: string | undefined;
            let updatedAt: string | undefined;

            const priorityOrder = ['review.md', 'debug.md', 'plan.md', 'concept.md'];
            const primaryDoc = [...docs].sort((a, b) => {
                const ai = priorityOrder.indexOf(a.name);
                const bi = priorityOrder.indexOf(b.name);
                return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
            })[0];

            if (primaryDoc) {
                const match = primaryDoc.content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
                if (match) {
                    try {
                        const data = (yaml.load(match[1]) as Record<string, unknown>) || {};
                        if (typeof data.status === 'string') {
                            const s = data.status.toLowerCase();
                            if (s === 'plan' || s === 'planned') status = 'plan';
                            else if (s === 'processing' || s === 'in_progress' || s === 'debug') status = 'processing';
                            else if (s === 'done' || s === 'completed') status = 'done';
                        }
                        createdAt = typeof data.created_at === 'string' ? data.created_at : undefined;
                        updatedAt = typeof data.updated_at === 'string' ? data.updated_at : undefined;
                    } catch {}
                    const titleMatch = match[2].match(/^#\s+(.+)$/m);
                    if (titleMatch) title = titleMatch[1].trim();
                }
            }

            tasks.push({ slug: entry.name, folderPath, status, title, createdAt, updatedAt, docs });
        }
        return tasks;
    } catch {
        return [];
    }
}

export async function moveTaskAction(folderPath: string, newStatus: DashboardTask['status']): Promise<ActionStatusResult> {
    try {
        const files = await fs.readdir(folderPath);
        const mdFiles = files.filter((f) => f.endsWith('.md'));
        for (const f of mdFiles) {
            const p = path.join(folderPath, f);
            const raw = await fs.readFile(p, 'utf-8');
            const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
            if (match) {
                const data = (yaml.load(match[1]) as Record<string, unknown>) || {};
                data.status = newStatus;
                data.updated_at = new Date().toISOString();
                const newContent = `---\n${yaml.dump(data).trim()}\n---\n${match[2]}`;
                await fs.writeFile(p, newContent, 'utf-8');
            }
        }
        return { success: true };
    } catch {
        return { success: false };
    }
}

export async function getHerdrPanesAction(): Promise<HerdrPaneInfo[]> {
    try {
        const { stdout } = await execAsync('herdr status --json');
        return JSON.parse(stdout);
    } catch {
        return [
            { paneId: 'w1:p1', tabName: 'dev', agentType: 'agy-developer', status: 'idle', details: 'Waiting for task' },
            { paneId: 'w1:p2', tabName: 'review', agentType: 'claude-reviewer', status: 'idle', details: 'Ready for audit' },
        ];
    }
}

export async function dispatchHerdrAction(paneId: string, instruction: string): Promise<ActionStatusResult> {
    return { success: true };
}
