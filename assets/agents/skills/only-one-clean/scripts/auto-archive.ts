import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import yaml from 'js-yaml';

export interface ArchiveTaskSummary {
    slug: string;
    status: 'archived' | 'skipped';
    improvementsStaged: boolean;
}

export function runAutoArchive(baseDir = process.cwd(), dryRun = false): ArchiveTaskSummary[] {
    const tasksDir = join(baseDir, 'only-one/tasks');
    const archivesDir = join(baseDir, 'only-one/archives');
    const repoName = resolveRepoIdentifier(baseDir);
    const globalImprovementsDir = join(homedir(), '.only-one', 'improvements', repoName);
    const results: ArchiveTaskSummary[] = [];

    if (!existsSync(tasksDir)) return results;

    const taskFolders = readdirSync(tasksDir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name);

    for (const slug of taskFolders) {
        const taskPath = join(tasksDir, slug);
        const planPath = join(taskPath, 'plan.md');
        const debugPath = join(taskPath, 'debug.md');

        let docPath = existsSync(planPath) ? planPath : existsSync(debugPath) ? debugPath : null;
        if (!docPath) continue;

        const content = readFileSync(docPath, 'utf8');
        const fmMatch = content.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
        if (!fmMatch) continue;

        let fm: any = {};
        try {
            fm = yaml.load(fmMatch[1]);
        } catch {
            continue;
        }

        if (fm.status !== 'done' && fm.status !== 'fixed') {
            results.push({ slug, status: 'skipped', improvementsStaged: false });
            continue;
        }

        if (dryRun) {
            results.push({ slug, status: 'archived', improvementsStaged: existsSync(join(taskPath, 'improvements.md')) });
            continue;
        }

        // 1. Stage improvements.md if present
        let staged = false;
        const improvementFile = join(taskPath, 'improvements.md');
        if (existsSync(improvementFile)) {
            const imprContent = readFileSync(improvementFile, 'utf8');
            const imprFmMatch = imprContent.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
            let imprFm: any = {};
            if (imprFmMatch) {
                try {
                    imprFm = yaml.load(imprFmMatch[1]) || {};
                } catch {}
            }
            const targetSkills: string[] = Array.isArray(imprFm?.target_skills) ? imprFm.target_skills : [];
            const isOnlyOne = targetSkills.some((s) => typeof s === 'string' && s.trim().startsWith('only-one-'));
            if (isOnlyOne) {
                mkdirSync(globalImprovementsDir, { recursive: true });
                const targetFile = join(globalImprovementsDir, `${slug}.md`);
                const tagged = imprContent
                    .replace(/^status:\s*.*$/m, '')
                    .replace(/^---/, `---\nstatus: pending\narchived_at: ${new Date().toISOString()}`);
                writeFileSync(targetFile, tagged, 'utf8');
                staged = true;
            }
        }

        // 2. Generate archive from template if available
        mkdirSync(archivesDir, { recursive: true });
        const archivePath = join(archivesDir, `${slug}.md`);
        const templatePath = resolve(dirname(import.meta.filename || ''), '../assets/archive-template.md');
        let archiveContent = '';
        const now = new Date().toISOString();

        if (existsSync(templatePath)) {
            archiveContent = readFileSync(templatePath, 'utf8')
                .replace(/\{\{slug\}\}/g, slug)
                .replace(/\{\{title\}\}/g, slug)
                .replace(/\{\{domain\}\}/g, 'workflow')
                .replace(/\{\{archived_at\}\}/g, now)
                .replace(/\{\{problem\}\}/g, `Task ${slug} completed.`)
                .replace(/\{\{approach\}\}/g, 'Auto-archived via only-one-clean.');
        } else {
            archiveContent = `---
id: ${slug}
title: ${slug}
domain: workflow
archived_at: ${now}
status: active
---

# Archive: ${slug}

Auto-archived by only-one-clean.
`;
        }

        writeFileSync(archivePath, archiveContent, 'utf8');

        // 3. Purge raw task directory
        rmSync(taskPath, { recursive: true, force: true });
        results.push({ slug, status: 'archived', improvementsStaged: staged });
    }

    return results;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename || '')) {
    const dryRun = process.argv.includes('--dry-run');
    const results = runAutoArchive(process.cwd(), dryRun);
    console.log(JSON.stringify(results, null, 2));
}

function resolveRepoIdentifier(baseDir: string): string {
    try {
        const out = execSync('git config --get remote.origin.url', {
            cwd: baseDir,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
            timeout: 2000,
        }).trim();
        if (out) {
            const last = out.split(/[\\/]/).filter(Boolean).at(-1) || '';
            const clean = last.replace(/\.git$/i, '');
            if (clean) return clean;
        }
    } catch {}
    return basename(baseDir) || 'unknown-repo';
}
