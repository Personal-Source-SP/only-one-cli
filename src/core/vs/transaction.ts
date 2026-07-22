import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import type { VsFileSystem, VsProcessRunner, VsProgressReporter } from './types.js';

export interface VsTransactionFile {
    backupPath: string;
    targetPath: string;
}

export interface VsTransactionExtension {
    command: string;
    extensionId: string;
}

interface VsTransactionJournal {
    completed: boolean;
    extensions: VsTransactionExtension[];
    files: VsTransactionFile[];
    id: string;
}

export class VsSyncTransaction {
    private journal: VsTransactionJournal;

    public constructor(
        private readonly fs: VsFileSystem,
        private readonly runner: VsProcessRunner,
        private readonly progress: VsProgressReporter,
        private readonly journalPath: string,
    ) {
        this.journal = { completed: false, extensions: [], files: [], id: String(Date.now()) };
    }

    public async recoverIfNeeded(): Promise<void> {
        try {
            await this.fs.stat(this.journalPath);
        } catch {
            return;
        }
        const content = await this.fs.readFile(this.journalPath);
        const journal = JSON.parse(content) as VsTransactionJournal;
        if (journal.completed) {
            await this.fs.rm(this.journalPath);
            return;
        }
        this.journal = journal;
        await this.rollback();
    }

    public async begin(): Promise<void> {
        await this.fs.mkdir(dirname(this.journalPath));
        await this.persist();
    }

    public async backupFile(targetPath: string): Promise<void> {
        const targetHash = createHash('sha256').update(targetPath).digest('hex');
        const backupPath = `${this.journalPath}.${targetHash}.bak`;
        try {
            await this.fs.copyFile(targetPath, backupPath);
        } catch {
            await this.fs.writeFile(backupPath, '');
        }
        this.journal.files.push({ backupPath, targetPath });
        await this.persist();
    }

    public async atomicWrite(targetPath: string, content: string): Promise<void> {
        await this.fs.mkdir(dirname(targetPath));
        const tmpPath = `${targetPath}.only-one.tmp`;
        await this.fs.writeFile(tmpPath, content);
        await this.fs.rename(tmpPath, targetPath);
    }

    public async recordInstalledExtension(command: string, extensionId: string): Promise<void> {
        this.journal.extensions.push({ command, extensionId });
        await this.persist();
    }

    public async commit(): Promise<void> {
        this.journal.completed = true;
        await this.persist();
        await this.fs.rm(this.journalPath);
        for (const file of this.journal.files) await this.fs.rm(file.backupPath);
    }

    public async rollback(): Promise<void> {
        for (const file of [...this.journal.files].reverse()) {
            this.progress.rollback(file.targetPath);
            await this.fs.mkdir(dirname(file.targetPath));
            await this.fs.copyFile(file.backupPath, file.targetPath);
        }
        for (const extension of [...this.journal.extensions].reverse()) {
            this.progress.rollback(extension.extensionId);
            const result = await this.runner.run(extension.command, ['--uninstall-extension', extension.extensionId]);
            if (result.code !== 0) throw new Error(result.stderr || `Failed to uninstall ${extension.extensionId}`);
        }
        await this.fs.rm(this.journalPath);
        for (const file of this.journal.files) await this.fs.rm(file.backupPath);
    }

    private async persist(): Promise<void> {
        await this.fs.writeFile(this.journalPath, `${JSON.stringify(this.journal, null, 2)}\n`);
    }
}

export const resolveVsJournalPath = (cwd: string): string => join(cwd, '.only-one', 'vs-sync-journal.json');
