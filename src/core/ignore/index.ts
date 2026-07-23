import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { IGNORE_TEMPLATES, IgnoreTarget } from '@assets/ignore/index.js';
import type { ProgramDeps } from '@/cli/deps.js';

export { IgnoreTarget } from '@assets/ignore/index.js';

export interface IgnoreWriteResult {
    added: number;
    fileName: string;
    target: IgnoreTarget;
}

const TEMPLATE_NAMES: Record<IgnoreTarget, string> = {
    [IgnoreTarget.Docker]: 'docker.ignore',
    [IgnoreTarget.Git]: 'git.ignore',
    [IgnoreTarget.Npm]: 'npm.ignore',
};

const packageRoot = join(fileURLToPath(new URL('../../..', import.meta.url)));

export const selectIgnoreTargets = async (deps: ProgramDeps): Promise<IgnoreTarget[]> => {
    if (!deps.prompts?.checkbox) return [];
    const selected = await deps.prompts.checkbox({
        message: 'Select ignore files to update (optional, empty to skip):',
        choices: [
            { name: 'Git (.gitignore)', value: IgnoreTarget.Git },
            { name: 'Docker (.dockerignore)', value: IgnoreTarget.Docker },
            { name: 'npm (.npmignore)', value: IgnoreTarget.Npm },
        ],
    });
    return (selected ?? []).filter((target): target is IgnoreTarget => Object.values(IgnoreTarget).includes(target as IgnoreTarget));
};

export const writeIgnoreTemplates = async (projectDir: string, targets: IgnoreTarget[] = []): Promise<IgnoreWriteResult[]> => {
    const results: IgnoreWriteResult[] = [];
    for (const target of targets) {
        const { fileName } = IGNORE_TEMPLATES[target];
        const templatePath = join(packageRoot, 'assets', 'ignore', TEMPLATE_NAMES[target]);
        const targetPath = join(projectDir, fileName);
        const template = await readFile(templatePath, 'utf8');
        const content = existsSync(targetPath) ? await readFile(targetPath, 'utf8') : '';
        const existing = new Set(
            content
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(Boolean),
        );
        const additions = template
            .split(/\r?\n/)
            .filter((line) => line.trim() && !line.trim().startsWith('#') && !existing.has(line.trim()));
        if (additions.length) {
            const prefix = content && !content.endsWith('\n') ? '\n' : '';
            await writeFile(targetPath, `${content}${prefix}${additions.join('\n')}\n`, 'utf8');
        }
        results.push({ added: additions.length, fileName, target });
    }
    return results;
};
