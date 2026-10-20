import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanCompletedTasks } from '@/ui/services/taskCleaner.js';

describe('Task Cleaner Service', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'only-one-cleaner-test-'));
        const tasksRoot = path.join(tempDir, 'only-one', 'tasks');
        await fs.mkdir(tasksRoot, { recursive: true });
    });

    afterEach(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    it('tự động lưu trữ các task hoàn thành khi vượt quá ngưỡng threshold', async () => {
        for (let i = 1; i <= 4; i++) {
            const taskFolder = path.join(tempDir, 'only-one', 'tasks', `task-${i}`);
            await fs.mkdir(taskFolder, { recursive: true });
            await fs.writeFile(path.join(taskFolder, 'concept.md'), `---\nstatus: done\nslug: task-${i}\n---\n# Task ${i}`);
        }

        const res = await cleanCompletedTasks(tempDir, 2);
        expect(res.archivedSlugs.length).toBe(2);
        expect(res.remainingDoneCount).toBe(2);

        const archivesRoot = path.join(tempDir, 'only-one', 'archives');
        const archivedFolders = await fs.readdir(archivesRoot);
        expect(archivedFolders.length).toBe(2);
    });

    it('giữ nguyên các task khi số lượng task done chưa vượt ngưỡng', async () => {
        const taskFolder = path.join(tempDir, 'only-one', 'tasks', 'task-1');
        await fs.mkdir(taskFolder, { recursive: true });
        await fs.writeFile(path.join(taskFolder, 'concept.md'), '---\nstatus: done\nslug: task-1\n---\n# Task 1');

        const res = await cleanCompletedTasks(tempDir, 5);
        expect(res.archivedSlugs.length).toBe(0);
        expect(res.remainingDoneCount).toBe(1);
    });
});
