import fs from 'node:fs/promises';
import path from 'node:path';
import { scanTasks } from './taskScanner.js';

export interface CleanResult {
    archivedSlugs: string[];
    remainingDoneCount: number;
}

export async function cleanCompletedTasks(workspaceDir: string, thresholdCount: number): Promise<CleanResult> {
    const tasks = await scanTasks(workspaceDir);
    const doneTasks = tasks.filter((t) => t.status === 'done');

    if (doneTasks.length <= thresholdCount) {
        return { archivedSlugs: [], remainingDoneCount: doneTasks.length };
    }

    const excessCount = doneTasks.length - thresholdCount;
    const tasksToArchive = doneTasks.slice(0, excessCount);

    const archivesRoot = path.join(workspaceDir, 'only-one', 'archives');
    await fs.mkdir(archivesRoot, { recursive: true });

    const archivedSlugs: string[] = [];

    for (const task of tasksToArchive) {
        const destPath = path.join(archivesRoot, task.slug);
        try {
            await fs.rename(task.folderPath, destPath);
            archivedSlugs.push(task.slug);
        } catch {
            // Bỏ qua lỗi rename từng file riêng lẻ
        }
    }

    return {
        archivedSlugs,
        remainingDoneCount: doneTasks.length - archivedSlugs.length,
    };
}
