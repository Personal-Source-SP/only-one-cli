import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanCompletedTasks } from '@/ui/services/taskCleaner.js';

describe('Clean Workflow & Fallback', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'only-one-clean-workflow-'));
        const tasksRoot = path.join(tempDir, 'only-one', 'tasks');
        await fs.mkdir(tasksRoot, { recursive: true });
    });

    afterEach(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    it('fallback dọn dẹp toàn bộ task hoàn thành khi threshold = 0', async () => {
        for (let i = 1; i <= 3; i++) {
            const taskFolder = path.join(tempDir, 'only-one', 'tasks', `task-${i}`);
            await fs.mkdir(taskFolder, { recursive: true });
            await fs.writeFile(path.join(taskFolder, 'plan.md'), `---\nstatus: done\nslug: task-${i}\n---\n# Task ${i}`);
        }

        const res = await cleanCompletedTasks(tempDir, 0);
        expect(res.archivedSlugs).toHaveLength(3);
        expect(res.remainingDoneCount).toBe(0);

        const archivesRoot = path.join(tempDir, 'only-one', 'archives');
        const archives = await fs.readdir(archivesRoot);
        expect(archives).toHaveLength(3);
    });
});
