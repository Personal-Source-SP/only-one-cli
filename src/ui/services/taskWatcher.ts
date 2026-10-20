import fs from 'node:fs';
import path from 'node:path';

export interface TaskWatcherHandle {
    close: () => void;
}

export function startTaskWatcher(workspaceDir: string, onChange: () => void, debounceMs: number = 300): TaskWatcherHandle {
    const tasksDir = path.join(workspaceDir, 'only-one', 'tasks');

    let timer: NodeJS.Timeout | null = null;
    let watcher: fs.FSWatcher | null = null;

    try {
        if (!fs.existsSync(tasksDir)) {
            fs.mkdirSync(tasksDir, { recursive: true });
        }

        watcher = fs.watch(tasksDir, { recursive: true }, () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                onChange();
            }, debounceMs);
        });
    } catch {
        // Bỏ qua lỗi nhẹ nếu filesystem watch không được hỗ trợ
    }

    return {
        close: () => {
            if (timer) clearTimeout(timer);
            if (watcher) watcher.close();
        },
    };
}
