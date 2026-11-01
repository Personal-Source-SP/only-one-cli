import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../..');

export type BumpType = 'patch' | 'minor' | 'major';

export function analyzeBump(commits: string[]): BumpType {
    let hasBreaking = false;
    let hasFeat = false;

    for (const commit of commits) {
        const lower = commit.toLowerCase();

        if (lower.includes('breaking change') || /^[a-z]+(\([a-z0-9_-]+\))?!:/.test(lower)) {
            hasBreaking = true;
            break;
        }

        if (/^feat(\([a-z0-9_-]+\))?:/.test(lower)) {
            hasFeat = true;
        }
    }

    if (hasBreaking) return 'major';
    if (hasFeat) return 'minor';

    return 'patch';
}

export function calculateNewVersion(currentVersion: string, bump: BumpType): string {
    const [majorStr, minorStr, patchStr] = currentVersion.split('-')[0].split('.');
    let major = parseInt(majorStr, 10) || 0;
    let minor = parseInt(minorStr, 10) || 0;
    let patch = parseInt(patchStr, 10) || 0;

    switch (bump) {
        case 'major':
            major += 1;
            minor = 0;
            patch = 0;
            break;
        case 'minor':
            minor += 1;
            patch = 0;
            break;
        case 'patch':
        default:
            patch += 1;
            break;
    }

    return `${major}.${minor}.${patch}`;
}

export function generateChangelogEntry(version: string, date: string, commits: string[]): string {
    const added: string[] = [];
    const fixed: string[] = [];
    const changed: string[] = [];

    for (const commit of commits) {
        const trimmed = commit.replace(/^[a-f0-9]+\s+/, '').trim();

        if (/^feat(\([a-z0-9_-]+\))?:\s*/i.test(trimmed)) {
            added.push(trimmed.replace(/^feat(\([a-z0-9_-]+\))?:\s*/i, ''));
        } else if (/^fix(\([a-z0-9_-]+\))?:\s*/i.test(trimmed)) {
            fixed.push(trimmed.replace(/^fix(\([a-z0-9_-]+\))?:\s*/i, ''));
        } else {
            const clean = trimmed.replace(/^[a-z]+(\([a-z0-9_-]+\))?:\s*/i, '');

            changed.push(clean || trimmed);
        }
    }

    const lines: string[] = [`### [${version}] - ${date}`, ''];

    if (added.length > 0) {
        lines.push('#### Added');
        added.forEach((item) => lines.push(`- ${item}`));
        lines.push('');
    }

    if (fixed.length > 0) {
        lines.push('#### Fixed');
        fixed.forEach((item) => lines.push(`- ${item}`));
        lines.push('');
    }

    if (changed.length > 0) {
        lines.push('#### Changed');
        changed.forEach((item) => lines.push(`- ${item}`));
        lines.push('');
    }

    return lines.join('\n');
}

export function updateChangelog(newEntry: string, changelogPath = path.join(ROOT, 'CHANGELOG.md')): void {
    let currentContent = '';

    if (fs.existsSync(changelogPath)) {
        currentContent = fs.readFileSync(changelogPath, 'utf8');
    } else {
        currentContent = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
    }

    const headerMatch = currentContent.match(/^(# Changelog[\s\S]*?\n\n)/i);

    if (headerMatch) {
        const header = headerMatch[1];
        const body = currentContent.slice(header.length);

        fs.writeFileSync(changelogPath, `${header}${newEntry}\n${body}`);
    } else {
        fs.writeFileSync(changelogPath, `# Changelog\n\n${newEntry}\n${currentContent}`);
    }
}

export function updatePackageJsonVersion(newVersion: string, pkgPath = path.join(ROOT, 'package.json')): void {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    pkg.version = newVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n');
}

export async function runRelease(): Promise<void> {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const createTag = args.includes('--tag');

    const info = (msg: string) => console.log(`\x1b[1;34m[release]\x1b[0m ${msg}`);
    const ok = (msg: string) => console.log(`\x1b[1;32m[release]\x1b[0m ${msg}`);

    const pkgPath = path.join(ROOT, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const currentVersion = pkg.version;

    info(`Current Version: ${currentVersion}`);

    let lastTag = '';

    try {
        lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8', cwd: ROOT }).trim();
        info(`Last Git Tag: ${lastTag}`);
    } catch {
        info('No previous git tag found. Inspecting full git history.');
    }

    let commitLog = '';

    try {
        const gitCmd = lastTag
            ? `git log ${lastTag}..HEAD --oneline --no-merges`
            : 'git log -n 50 --oneline --no-merges';

        commitLog = execSync(gitCmd, { encoding: 'utf8', cwd: ROOT }).trim();
    } catch {
        commitLog = '';
    }

    const commits = commitLog ? commitLog.split('\n').filter(Boolean) : [];

    info(`Unreleased Commits Found: ${commits.length}`);

    let bump: BumpType = 'patch';
    const bumpIdx = args.indexOf('--bump');

    if (bumpIdx !== -1 && ['patch', 'minor', 'major'].includes(args[bumpIdx + 1])) {
        bump = args[bumpIdx + 1] as BumpType;
        info(`Manual Bump Override: ${bump}`);
    } else {
        bump = analyzeBump(commits);
        info(`Suggested Bump: ${bump}`);
    }

    const newVersion = calculateNewVersion(currentVersion, bump);
    const today = new Date().toISOString().slice(0, 10);
    const changelogEntry = generateChangelogEntry(newVersion, today, commits);

    info(`New Target Version: ${newVersion}`);
    console.log('\n--- Changelog Preview ---\n' + changelogEntry + '-------------------------\n');

    if (dryRun) {
        ok('[release] Dry-run complete. No files modified.');
        return;
    }

    updatePackageJsonVersion(newVersion, pkgPath);
    ok(`Updated package.json to ${newVersion}`);

    updateChangelog(changelogEntry);
    ok('Updated CHANGELOG.md');

    if (createTag) {
        info('Creating git commit and tag...');
        execSync('git add package.json CHANGELOG.md', { cwd: ROOT });
        execSync(`git commit -m "chore(release): v${newVersion}"`, { cwd: ROOT });
        execSync(`git tag v${newVersion}`, { cwd: ROOT });
        ok(`Created Git Commit and Tag v${newVersion}`);
        info(`To publish via CI, push the tag: git push origin v${newVersion}`);
    }
}

if (process.argv[1] && process.argv[1].includes('release-helper')) {
    runRelease().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}

