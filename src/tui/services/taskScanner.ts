import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import type { ColumnModel, TaskDoc, TaskModel, TaskStatus } from '../types/task.js';

const LIFECYCLE_COLUMNS: { id: TaskStatus; title: string; color: ColumnModel['color'] }[] = [
    { id: 'concept', title: 'CONCEPT', color: 'cyan' },
    { id: 'plan', title: 'PLAN', color: 'blue' },
    { id: 'in_progress', title: 'IN-PROGRESS', color: 'yellow' },
    { id: 'review', title: 'REVIEW', color: 'magenta' },
    { id: 'done', title: 'DONE', color: 'green' },
];

export function parseFrontmatter(content: string): { data: Record<string, unknown>; body: string } {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return { data: {}, body: content };
    try {
        const data = (yaml.load(match[1]) as Record<string, unknown>) || {};
        return { data, body: match[2] };
    } catch {
        return { data: {}, body: content };
    }
}

export async function scanTasks(workspaceDir: string = process.cwd()): Promise<TaskModel[]> {
    const tasksRoot = path.join(workspaceDir, 'only-one', 'tasks');
    try {
        const entries = await fs.readdir(tasksRoot, { withFileTypes: true });
        const taskDirs = entries.filter((e) => e.isDirectory());
        const tasks: TaskModel[] = [];

        for (const dir of taskDirs) {
            const folderPath = path.join(tasksRoot, dir.name);
            const files = await fs.readdir(folderPath);
            const mdFiles = files.filter((f) => f.endsWith('.md'));
            const docs: TaskDoc[] = [];

            for (const f of mdFiles) {
                const filePath = path.join(folderPath, f);
                const content = await fs.readFile(filePath, 'utf-8');
                docs.push({ name: f, path: filePath, content });
            }

            let status: TaskStatus = 'concept';
            let title = dir.name;
            let createdAt: string | undefined;
            let updatedAt: string | undefined;

            const priorityOrder = ['review.md', 'debug.md', 'plan.md', 'concept.md'];
            const sortedDocs = [...docs].sort((a, b) => {
                const ai = priorityOrder.indexOf(a.name);
                const bi = priorityOrder.indexOf(b.name);
                return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
            });
            const primaryDoc = sortedDocs[0];
            if (primaryDoc) {
                const { data, body } = parseFrontmatter(primaryDoc.content);
                if (data.status && typeof data.status === 'string') {
                    const s = data.status.toLowerCase();
                    if (s === 'plan' || s === 'planned') status = 'plan';
                    else if (s === 'in_progress' || s === 'in-progress' || s === 'debug') status = 'in_progress';
                    else if (s === 'review') status = 'review';
                    else if (s === 'done' || s === 'completed' || s === 'fixed' || s === 'resolved') status = 'done';
                    else status = 'concept';
                } else {
                    if (docs.some((d) => d.name === 'review.md')) status = 'review';
                    else if (docs.some((d) => d.name === 'debug.md')) status = 'in_progress';
                    else if (docs.some((d) => d.name === 'plan.md')) status = 'plan';
                }

                createdAt = typeof data.created_at === 'string' ? data.created_at : undefined;
                updatedAt = typeof data.updated_at === 'string' ? data.updated_at : undefined;

                const titleMatch = body.match(/^#\s+(.+)$/m);
                if (titleMatch) title = titleMatch[1].trim();
            }

            tasks.push({
                slug: dir.name,
                folderPath,
                status,
                title,
                createdAt,
                updatedAt,
                docs,
                activeDocIndex: 0,
            });
        }
        return tasks;
    } catch {
        return [];
    }
}

export function groupTasksByColumn(tasks: TaskModel[]): ColumnModel[] {
    return LIFECYCLE_COLUMNS.map((col) => ({
        ...col,
        tasks: tasks.filter((t) => t.status === col.id),
    }));
}

export async function updateTaskStatus(taskFolderPath: string, newStatus: TaskStatus): Promise<void> {
    const files = await fs.readdir(taskFolderPath);
    const mdFiles = files.filter((f) => f.endsWith('.md'));
    for (const f of mdFiles) {
        const p = path.join(taskFolderPath, f);
        const raw = await fs.readFile(p, 'utf-8');
        const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        if (match) {
            let data = (yaml.load(match[1]) as Record<string, unknown>) || {};
            data.status = newStatus;
            data.updated_at = new Date().toISOString();
            const newContent = `---\n${yaml.dump(data).trim()}\n---\n${match[2]}`;
            await fs.writeFile(p, newContent, 'utf-8');
        }
    }
}
