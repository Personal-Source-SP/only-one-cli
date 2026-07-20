import { dirname, join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { VsEditorId, VsPlatform, mergeSettings, normalizeExtensionIds, parseVsEditorIds, vsEditors } from '@src/core/vs/index.js';
import { PercentProgressReporter } from '@src/core/vs/progress.js';
import { syncVsExtensions } from '@src/core/vs/extensions-sync.js';
import { syncVsSettings } from '@src/core/vs/settings-sync.js';
import { resolveVsJournalPath, VsSyncTransaction } from '@src/core/vs/transaction.js';
import type { VsFileSystem, VsProcessResult, VsProcessRunner } from '@src/core/vs/types.js';

const missingFile = (): Error => Object.assign(new Error('missing'), { code: 'ENOENT' });

class MemoryFs implements VsFileSystem {
    public readonly files = new Map<string, string>();
    public readonly dirs = new Set<string>();

    public async copyFile(source: string, target: string): Promise<void> {
        const content = this.files.get(source);
        if (content === undefined) throw missingFile();
        this.files.set(target, content);
    }

    public async mkdir(path: string): Promise<void> {
        this.dirs.add(path);
    }

    public async readFile(path: string): Promise<string> {
        const content = this.files.get(path);
        if (content === undefined) throw missingFile();
        return content;
    }

    public async rename(source: string, target: string): Promise<void> {
        const content = this.files.get(source);
        if (content === undefined) throw missingFile();
        this.files.set(target, content);
        this.files.delete(source);
    }

    public async rm(path: string): Promise<void> {
        this.files.delete(path);
    }

    public async stat(path: string): Promise<{ isFile: () => boolean }> {
        if (!this.files.has(path)) throw missingFile();
        return { isFile: () => true };
    }

    public async writeFile(path: string, content: string): Promise<void> {
        this.files.set(path, content);
    }
}

class MemoryRunner implements VsProcessRunner {
    public readonly calls: Array<{ command: string; args: string[] }> = [];

    public constructor(private readonly failInstallId?: string) {}

    public async run(command: string, args: string[]): Promise<VsProcessResult> {
        this.calls.push({ args, command });
        if (args[0] === '--list-extensions') return { code: 0, stderr: '', stdout: 'existing.keep\n' };
        if ((args[0] === '--install-extension' || args[0] === '--uninstall-extension') && args[1] === this.failInstallId) {
            return { code: 1, stderr: 'install failed', stdout: '' };
        }
        return { code: 0, stderr: '', stdout: '' };
    }
}

const seedLibrary = (fs: MemoryFs, libraryDir = join('/library', 'vs')): void => {
    fs.files.set(join(libraryDir, 'settings.json'), JSON.stringify({ editor: { tabSize: 4 }, sourceOnly: true }));
    fs.files.set(
        join(libraryDir, 'extensions.json'),
        JSON.stringify({ extensions: ['Existing.Keep', 'Missing.One', 'Missing.One', 'fail.ext'] }),
    );
};

describe('VS core sync helpers', () => {
    it('merges settings deeply and lets source win conflicts', () => {
        expect(
            mergeSettings(
                {
                    editor: { fontSize: 12, tabSize: 2 },
                    files: { autoSave: 'off' },
                    keep: true,
                    list: ['target'],
                },
                {
                    editor: { tabSize: 4 },
                    files: 'source-wins',
                    list: ['source'],
                },
            ),
        ).toEqual({
            editor: { fontSize: 12, tabSize: 4 },
            files: 'source-wins',
            keep: true,
            list: ['source'],
        });
    });

    it('deduplicates extension ids case-insensitively', () => {
        expect(normalizeExtensionIds(['ESBENP.prettier-vscode', 'esbenp.prettier-vscode', ' dbaeumer.vscode-eslint '])).toEqual([
            'esbenp.prettier-vscode',
            'dbaeumer.vscode-eslint',
        ]);
    });

    it('resolves supported editor settings paths by platform', () => {
        const vscode = vsEditors.find((editor) => editor.id === VsEditorId.VSCode);
        expect(vscode?.resolveSettingsPath('/Users/me', VsPlatform.Darwin).replace(/\\/g, '/')).toContain(
            'Library/Application Support/Code/User/settings.json',
        );
        expect(vscode?.resolveSettingsPath('C:/Users/me', VsPlatform.Win32).replace(/\\/g, '/')).toContain(
            'AppData/Roaming/Code/User/settings.json',
        );
    });

    it('parses comma-separated editor ids and ignores unsupported ids', () => {
        expect(parseVsEditorIds('vscode,cursor,unknown,antigravity')).toEqual([
            VsEditorId.VSCode,
            VsEditorId.Cursor,
            VsEditorId.Antigravity,
        ]);
    });

    it('reports monotonic progress and reaches 100 at final step', () => {
        const writes: string[] = [];
        const reporter = new PercentProgressReporter((line) => writes.push(line));
        reporter.start(2, 'start');
        reporter.step('one');
        reporter.step('two');
        expect(writes).toEqual(['✓ start', '✓ one', '✓ two']);
    });

    it('rolls settings back when a later editor write fails', async () => {
        const fs = new MemoryFs();
        seedLibrary(fs);
        const vscodePath =
            vsEditors.find((editor) => editor.id === VsEditorId.VSCode)?.resolveSettingsPath('/Users/me', VsPlatform.Darwin) ?? '';
        fs.files.set(vscodePath, JSON.stringify({ editor: { fontSize: 12, tabSize: 2 }, keep: true }));
        const rename = vi.spyOn(fs, 'rename').mockImplementation(async (source, target) => {
            if (target.includes('Antigravity')) throw new Error('write failed');
            const content = fs.files.get(source);
            if (content === undefined) throw missingFile();
            fs.files.set(target, content);
            fs.files.delete(source);
        });

        await expect(
            syncVsSettings({
                cwd: '/repo',
                editorIds: [VsEditorId.VSCode, VsEditorId.Antigravity],
                fs,
                homeDir: '/Users/me',
                libraryDir: join('/library', 'vs'),
                platform: VsPlatform.Darwin,
                runner: new MemoryRunner(),
                write: () => undefined,
            }),
        ).rejects.toThrow('write failed');

        expect(JSON.parse(fs.files.get(vscodePath) ?? '{}')).toEqual({ editor: { fontSize: 12, tabSize: 2 }, keep: true });
        expect(fs.files.has(resolveVsJournalPath('/repo'))).toBe(false);
        rename.mockRestore();
    });

    it('recovers unfinished journals before settings sync starts', async () => {
        const fs = new MemoryFs();
        seedLibrary(fs);
        const targetPath =
            vsEditors.find((editor) => editor.id === VsEditorId.VSCode)?.resolveSettingsPath('/Users/me', VsPlatform.Darwin) ?? '';
        const journalPath = resolveVsJournalPath('/repo');
        const backupPath = `${journalPath}.${Buffer.from(targetPath).toString('hex')}.bak`;
        fs.files.set(targetPath, JSON.stringify({ broken: true }));
        fs.files.set(backupPath, JSON.stringify({ restored: true }));
        fs.files.set(journalPath, JSON.stringify({ completed: false, extensions: [], files: [{ backupPath, targetPath }], id: 'old' }));

        await syncVsSettings({
            cwd: '/repo',
            editorIds: [VsEditorId.VSCode],
            fs,
            homeDir: '/Users/me',
            libraryDir: join('/library', 'vs'),
            platform: VsPlatform.Darwin,
            runner: new MemoryRunner(),
            write: () => undefined,
        });

        const result = JSON.parse(fs.files.get(targetPath) ?? '{}');
        expect(result.restored).toBe(true);
        expect(result.sourceOnly).toBe(true);
    });

    it('keeps journal when recovery rollback fails and blocks new changes', async () => {
        const fs = new MemoryFs();
        const runner = new MemoryRunner('broken.ext');
        const progress = new PercentProgressReporter(() => undefined);
        const journalPath = resolveVsJournalPath('/repo');
        fs.files.set(
            journalPath,
            JSON.stringify({ completed: false, extensions: [{ command: 'code', extensionId: 'broken.ext' }], files: [], id: 'old' }),
        );

        await expect(new VsSyncTransaction(fs, runner, progress, journalPath).recoverIfNeeded()).rejects.toThrow('install failed');
        expect(fs.files.has(journalPath)).toBe(true);
    });

    it('uninstalls extensions installed by a failed extension sync', async () => {
        const fs = new MemoryFs();
        seedLibrary(fs);
        const runner = new MemoryRunner('fail.ext');

        await expect(
            syncVsExtensions({
                cwd: '/repo',
                editorIds: [VsEditorId.VSCode],
                fs,
                libraryDir: join('/library', 'vs'),
                runner,
                write: () => undefined,
            }),
        ).rejects.toThrow('install failed');

        expect(runner.calls).toContainEqual({ command: 'code', args: ['--install-extension', 'Missing.One'] });
        expect(runner.calls).toContainEqual({ command: 'code', args: ['--uninstall-extension', 'Missing.One'] });
        expect(runner.calls).not.toContainEqual({ command: 'code', args: ['--uninstall-extension', 'existing.keep'] });
    });
});
