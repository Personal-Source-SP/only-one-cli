import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';

interface IgnoreSection {
    header: string;
    patterns: string[];
}

const normalizePattern = (pattern: string): string => pattern.trim().replace(/\/$/, '');

const parseSections = (template: string): IgnoreSection[] => {
    const sections: IgnoreSection[] = [];
    let current: IgnoreSection | undefined;

    for (const rawLine of template.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line) continue;
        if (line.startsWith('#')) {
            current = { header: line, patterns: [] };
            sections.push(current);
        } else if (current) {
            current.patterns.push(line);
        }
    }

    return sections.filter((section) => section.patterns.length > 0);
};

const findSectionEnd = (lines: string[], headerIndex: number): number => {
    let index = headerIndex + 1;
    while (index < lines.length && !lines[index].trim().startsWith('#') && lines[index].trim() !== '') index++;
    return index;
};

/** Merge patterns from assets/ignore/git.ignore into a project's .gitignore. */
export async function updateGitignore(projectDir: string): Promise<void> {
    const gitignorePath = join(projectDir, '.gitignore');
    const templatePath = join(resolvePackageRoot(import.meta.url), 'assets', 'ignore', 'git.ignore');
    const template = await readFile(templatePath, 'utf8');
    const sections = parseSections(template);
    const original = existsSync(gitignorePath) ? await readFile(gitignorePath, 'utf8') : '';
    const newline = original.includes('\r\n') ? '\r\n' : '\n';
    const lines = original ? original.split(/\r?\n/) : [];
    if (lines.at(-1) === '') lines.pop();

    const existingPatterns = new Set(
        lines
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('#'))
            .map(normalizePattern),
    );

    for (const section of sections) {
        const missing = section.patterns.filter((pattern) => !existingPatterns.has(normalizePattern(pattern)));
        if (missing.length === 0) continue;

        const headerIndex = lines.findIndex((line) => line.trim() === section.header);
        if (headerIndex >= 0) {
            lines.splice(findSectionEnd(lines, headerIndex), 0, ...missing);
        } else {
            if (lines.length > 0 && lines.at(-1)?.trim() !== '') lines.push('');
            lines.push(section.header, ...missing);
        }
        for (const pattern of missing) existingPatterns.add(normalizePattern(pattern));
    }

    const content = lines.length > 0 ? `${lines.join(newline)}${newline}` : original;
    if (content !== original) await writeFile(gitignorePath, content, 'utf8');
}
