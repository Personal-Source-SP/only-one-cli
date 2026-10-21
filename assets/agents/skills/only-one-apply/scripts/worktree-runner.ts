import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export interface WorktreeOptions {
    projectDir: string;
    slug: string;
    baseBranch?: string;
}

export function resolveWorktreePath(projectDir: string, slug: string): string {
    return join(projectDir, '.worktrees', slug);
}

export function spawnWorktree(options: WorktreeOptions): string {
    const { projectDir, slug, baseBranch = 'main' } = options;
    const worktreePath = resolveWorktreePath(projectDir, slug);
    const branchName = `task/${slug}`;

    if (existsSync(worktreePath)) {
        return worktreePath;
    }

    const worktreesDir = join(projectDir, '.worktrees');
    if (!existsSync(worktreesDir)) {
        mkdirSync(worktreesDir, { recursive: true });
    }

    execSync(`git worktree add -B "${branchName}" "${worktreePath}" "${baseBranch}"`, {
        cwd: projectDir,
        stdio: 'pipe',
    });

    syncWorktreeInclude(projectDir, worktreePath);
    return worktreePath;
}

export function syncWorktreeInclude(projectDir: string, worktreePath: string): void {
    const includeConfigPath = join(projectDir, '.worktreeinclude');
    const fallbackTemplatePath = join(__dirname, '../templates/worktreeinclude.template');
    const configContent = existsSync(includeConfigPath)
        ? readFileSync(includeConfigPath, 'utf8')
        : existsSync(fallbackTemplatePath)
          ? readFileSync(fallbackTemplatePath, 'utf8')
          : '.env\n.env.local\n.agents/\nonly-one/\ntsconfig.json';

    const lines = configContent
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'));

    for (const item of lines) {
        const src = join(projectDir, item);
        const dest = join(worktreePath, item);
        if (existsSync(src) && !existsSync(dest)) {
            cpSync(src, dest, { recursive: true, dereference: true });
        }
    }

    const rootNodeModules = join(projectDir, 'node_modules');
    const targetNodeModules = join(worktreePath, 'node_modules');
    if (existsSync(rootNodeModules) && !existsSync(targetNodeModules)) {
        try {
            const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
            symlinkSync(rootNodeModules, targetNodeModules, symlinkType);
        } catch {
            // Fallback gracefully if junction creation is restricted
        }
    }
}

export function rebaseMain(options: WorktreeOptions): { success: boolean; conflict: boolean; error?: string } {
    const { projectDir, slug, baseBranch = 'main' } = options;
    const worktreePath = resolveWorktreePath(projectDir, slug);

    try {
        execSync(`git pull --rebase origin "${baseBranch}"`, {
            cwd: worktreePath,
            stdio: 'pipe',
        });
        return { success: true, conflict: false };
    } catch (err: any) {
        const output = String(err.stderr || err.stdout || '');
        const hasConflict = output.includes('CONFLICT') || output.includes('Failed to merge');
        return { success: false, conflict: hasConflict, error: output };
    }
}

export function cleanupWorktree(options: WorktreeOptions): void {
    const { projectDir, slug } = options;
    const worktreePath = resolveWorktreePath(projectDir, slug);

    if (!existsSync(worktreePath)) {
        return;
    }

    const targetNodeModules = join(worktreePath, 'node_modules');
    if (existsSync(targetNodeModules)) {
        try {
            unlinkSync(targetNodeModules);
        } catch {
            rmSync(targetNodeModules, { recursive: true, force: true });
        }
    }

    try {
        execSync(`git worktree remove --force "${worktreePath}"`, {
            cwd: projectDir,
            stdio: 'pipe',
        });
    } catch {
        rmSync(worktreePath, { recursive: true, force: true });
        execSync('git worktree prune', { cwd: projectDir, stdio: 'pipe' });
    }
}
