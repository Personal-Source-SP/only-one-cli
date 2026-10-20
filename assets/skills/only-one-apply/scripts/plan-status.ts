import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface ParsedTask {
    order: number;
    action: 'NEW' | 'MODIFY' | 'DELETE' | 'RENAME';
    filePath: string;
    status: '[ ]' | '[/]' | '[x]';
    dependsOn: string;
    fastTestCommand: string;
}

export interface PlanStatusResult {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    nextWave: ParsedTask[];
}

export function parsePlanTasks(content: string): PlanStatusResult {
    const tasks: ParsedTask[] = [];
    const taskBlockRegex = /### (\d+)\.\s*`?\[(NEW|MODIFY|DELETE|RENAME)\]`?\s*`?([^`\r\n]+)`?/g;
    const matches = [...content.matchAll(taskBlockRegex)];

    matches.forEach((match) => {
        const order = parseInt(match[1], 10);
        const action = match[2] as any;
        const filePath = match[3].trim();
        const blockContent = content.slice(match.index);

        const statusMatch = blockContent.match(/-\s*\*\*Status\*\*:\s*`?(\[[ x/]\])`?/i);
        const status = (statusMatch ? statusMatch[1] : '[ ]') as any;

        const depMatch = blockContent.match(/-\s*\*\*Depends On\*\*:\s*`?([^`\r\n]+)`?/i);
        const dependsOn = depMatch ? depMatch[1].trim() : 'None';

        const testMatch = blockContent.match(/-\s*\*\*Fast Test Command\*\*:\s*`?([^`\r\n]+)`?/i);
        const fastTestCommand = testMatch ? testMatch[1].trim() : '';

        tasks.push({ order, action, filePath, status, dependsOn, fastTestCommand });
    });

    const completed = tasks.filter((t) => t.status === '[x]').length;
    const inProgress = tasks.filter((t) => t.status === '[/]').length;
    const pendingTasks = tasks.filter((t) => t.status === '[ ]');

    const nextWave: ParsedTask[] = [];
    const touchedFiles = new Set<string>();

    for (const task of pendingTasks) {
        const hasUnmetDep = task.dependsOn !== 'None' && tasks.some((t) => task.dependsOn.includes(t.filePath) && t.status !== '[x]');
        if (!hasUnmetDep && !touchedFiles.has(task.filePath)) {
            nextWave.push(task);
            touchedFiles.add(task.filePath);
        }
    }

    return {
        total: tasks.length,
        completed,
        inProgress,
        pending: pendingTasks.length,
        nextWave,
    };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename || '')) {
    const filePath = process.argv[2];
    if (!filePath || !existsSync(filePath)) {
        console.error('Usage: npx tsx plan-status.ts <path-to-plan.md>');
        process.exit(1);
    }
    const result = parsePlanTasks(readFileSync(filePath, 'utf8'));
    console.log(JSON.stringify(result, null, 2));
}
