import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface ParsedTask {
    order: number;
    action: 'NEW' | 'MODIFY' | 'DELETE' | 'RENAME';
    filePath: string;
    status: '[ ]' | '[/]' | '[x]';
    wave: number;
    track: string;
    dependsOn: string;
    fastTestCommand: string;
}

export interface ParsedWave {
    wave: number;
    tasks: ParsedTask[];
    qaTasks: ParsedTask[];
    devTasks: ParsedTask[];
    status: 'pending' | 'in-progress' | 'completed';
}

export interface PlanStatusResult {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    nextWave: ParsedTask[];
    waves: ParsedWave[];
    maxWave: number;
    isMultiWave: boolean;
}

export function parsePlanTasks(content: string): PlanStatusResult {
    const tasks: ParsedTask[] = [];
    const taskBlockRegex = /### (\d+)\.\s*`?\[(NEW|MODIFY|DELETE|RENAME)\]`?\s*`?([^`\r\n]+)`?/g;
    const matches = [...content.matchAll(taskBlockRegex)];
    const testFileRegex = /(\.test\.|\.spec\.|_test\.)/;

    matches.forEach((match) => {
        const order = parseInt(match[1], 10);
        const action = match[2] as any;
        const filePath = match[3].trim();
        const blockContent = content.slice(match.index);

        const statusMatch = blockContent.match(/-\s*\*\*Status\*\*:\s*`?(\[[ x/]\])`?/i);
        const status = (statusMatch ? statusMatch[1] : '[ ]') as any;

        const waveMatch = blockContent.match(/-\s*\*\*Wave\*\*:\s*`?(\d+)(?:\s*\(([^)]+)\))?`?/i);
        const wave = waveMatch ? parseInt(waveMatch[1], 10) : 1;
        const track = waveMatch && waveMatch[2] ? waveMatch[2].trim() : (testFileRegex.test(filePath) ? 'Track QA' : 'Track Dev');

        const depMatch = blockContent.match(/-\s*\*\*Depends On\*\*:\s*`?([^`\r\n]+)`?/i);
        const dependsOn = depMatch ? depMatch[1].trim() : 'None';

        const testMatch = blockContent.match(/-\s*\*\*Fast Test Command\*\*:\s*`?([^`\r\n]+)`?/i);
        const fastTestCommand = testMatch ? testMatch[1].trim() : '';

        tasks.push({ order, action, filePath, status, wave, track, dependsOn, fastTestCommand });
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

    const wavesMap = new Map<number, ParsedTask[]>();
    tasks.forEach((task) => {
        if (!wavesMap.has(task.wave)) wavesMap.set(task.wave, []);
        wavesMap.get(task.wave)!.push(task);
    });

    const waves: ParsedWave[] = [];
    const sortedWaveNums = [...wavesMap.keys()].sort((a, b) => a - b);
    sortedWaveNums.forEach((wNum) => {
        const waveTasks = wavesMap.get(wNum)!;
        const qaTasks = waveTasks.filter((t) => /qa|test/i.test(t.track) || testFileRegex.test(t.filePath));
        const devTasks = waveTasks.filter((t) => !qaTasks.includes(t));
        const isDone = waveTasks.every((t) => t.status === '[x]');
        const isInProgress = waveTasks.some((t) => t.status === '[/]' || t.status === '[x]') && !isDone;
        const status = isDone ? 'completed' : (isInProgress ? 'in-progress' : 'pending');
        waves.push({ wave: wNum, tasks: waveTasks, qaTasks, devTasks, status });
    });

    const maxWave = waves.length > 0 ? Math.max(...sortedWaveNums) : 1;

    return {
        total: tasks.length,
        completed,
        inProgress,
        pending: pendingTasks.length,
        nextWave,
        waves,
        maxWave,
        isMultiWave: maxWave > 1,
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
