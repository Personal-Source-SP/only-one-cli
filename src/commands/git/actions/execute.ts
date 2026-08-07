import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { GIT_MANIFESTS, GIT_SNIPPETS } from '@assets/git/index.js';
import { mergeManagedBlock } from '@/core/git/sync.js';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';
import { searchableMultiSelect } from '@/prompts/searchable-multi-select.js';
import type { GitCommandOptions } from '../types.js';

const assetsGitDir = join(resolvePackageRoot(import.meta.url), 'assets/git');

export const executeGitCommandStep = async (deps: ProgramDeps, targetArg?: string, options?: GitCommandOptions): Promise<void> => {
    const selectedProfile = options?.profile || (targetArg as 'bash' | 'zsh' | 'all') || 'all';

    let selectedSnippetIds: string[] = [];

    if (options?.all) {
        selectedSnippetIds = GIT_SNIPPETS.map((s) => s.id);
    } else if (options?.snippets) {
        selectedSnippetIds = options.snippets
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    } else {
        const choices = GIT_SNIPPETS.map((s) => ({
            name: `${s.name} — ${s.description}`,
            value: s.id,
            checked: s.defaultSelected ?? false,
        }));

        const selectCheckbox = (deps.prompts?.checkbox ?? searchableMultiSelect) as (config: any) => Promise<string[]>;
        selectedSnippetIds = await selectCheckbox({
            message: 'Select Git & Shell configuration modules to apply:',
            choices,
        });
    }

    if (!selectedSnippetIds.length) {
        deps.stdout(COLORS.dim('\nNo snippet modules selected. Exiting without changes.'));
        return;
    }

    deps.stdout(COLORS.cli.header('\n⚡ Syncing Git Shell Profiles & Snippets...'));

    const home = homedir();
    const manifestsToSync = [];

    if (selectedProfile === 'bash' || selectedProfile === 'all') {
        manifestsToSync.push(GIT_MANIFESTS.gitbash);
    }
    if ((selectedProfile === 'zsh' || selectedProfile === 'all') && process.platform === 'darwin') {
        manifestsToSync.push(GIT_MANIFESTS.zsh);
    }

    // Build combined snippets text
    const snippetContents: string[] = [];
    for (const snippetId of selectedSnippetIds) {
        const snippet = GIT_SNIPPETS.find((s) => s.id === snippetId);
        if (!snippet) continue;

        const snippetPath = join(assetsGitDir, snippet.file);
        if (existsSync(snippetPath)) {
            snippetContents.push(readFileSync(snippetPath, 'utf8').trim());
        }
    }

    const aggregatedSnippetText = snippetContents.join('\n\n');

    for (const manifest of manifestsToSync) {
        deps.stdout(`\nProcessing ${COLORS.cli.command(manifest.name)}...`);
        for (const fileEntry of manifest.files) {
            const srcPath = join(assetsGitDir, fileEntry.src);
            const destPath = join(home, fileEntry.dest);

            if (!existsSync(srcPath)) {
                deps.stdout(`  ⚠️ Template file not found: ${fileEntry.src}`);
                continue;
            }

            const templateContent = readFileSync(srcPath, 'utf8');
            let existingContent = '';

            if (existsSync(destPath)) {
                existingContent = readFileSync(destPath, 'utf8');
            }

            const combinedNewContent = `${templateContent.trim()}\n\n# --- Selected Modules ---\n${aggregatedSnippetText}`;
            const merged = mergeManagedBlock(existingContent, combinedNewContent, 'ONLY-ONE-GIT');
            writeFileSync(destPath, merged, 'utf8');
            deps.stdout(`  ✓ Updated ${COLORS.dim(destPath)}`);
        }
    }

    deps.stdout(COLORS.cli.header('\n✨ Git shell profiles & selected snippets synced successfully!'));
};
