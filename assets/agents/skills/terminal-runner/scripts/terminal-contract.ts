import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export function stripAnsiColors(text: string): string {
    // ANSI escape code matching pattern
    const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
    return text.replace(ansiRegex, '');
}

export function isolateFailureStackTrace(rawLog: string, maxLines = 20): string {
    const cleanText = stripAnsiColors(rawLog);
    const lines = cleanText
        .split(/\r?\n/)
        .map((l) => l.trimEnd())
        .filter((l) => l.length > 0);

    // Find first error occurrence
    const errorIndex = lines.findIndex((line) => /(?:Error|Exception|FAIL|failed):/i.test(line));
    if (errorIndex === -1) {
        return lines.slice(-maxLines).join('\n');
    }

    return lines.slice(errorIndex, errorIndex + maxLines).join('\n');
}

export function formatTerminalDigest(status: 'PASS' | 'FAIL', exitCode: number, summary: string): string {
    return [
        '### Terminal Digest',
        `- Status: ${status}`,
        `- Exit Code: ${exitCode}`,
        `- Summary: ${summary.trim()}`,
    ].join('\n');
}

export interface TestStats {
    passed: number;
    failed: number;
    total: number;
}

export function parseTestStats(rawText: string): TestStats {
    const clean = stripAnsiColors(rawText);
    const passMatch = clean.match(/(\d+)\s+passed/i);
    const failMatch = clean.match(/(\d+)\s+failed/i);
    const totalMatch = clean.match(/Tests\s+(\d+)/i) || clean.match(/Total:\s*(\d+)/i);

    const passed = passMatch ? parseInt(passMatch[1], 10) : 0;
    const failed = failMatch ? parseInt(failMatch[1], 10) : 0;
    const total = totalMatch ? parseInt(totalMatch[1], 10) : passed + failed;

    return { passed, failed, total: Math.max(total, passed + failed) };
}

export function saveTerminalLog(taskSlug: string, commandName: string, logContent: string, baseDir = process.cwd()): string {
    const safeCmd = commandName.replace(/[^a-z0-9_-]/gi, '_');
    const targetDir = join(baseDir, 'only-one/tasks', taskSlug, 'evidence/terminal');
    mkdirSync(targetDir, { recursive: true });
    const filePath = join(targetDir, `${safeCmd}.log`);
    writeFileSync(filePath, stripAnsiColors(logContent), 'utf8');
    const normalizedPath = resolve(filePath).replace(/\\/g, '/');
    return `file:///${normalizedPath.replace(/^\//, '')}`;
}
