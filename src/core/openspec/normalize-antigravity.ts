import { existsSync } from 'node:fs';
import { cp, readdir, rm, rmdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const listFiles = async (root: string): Promise<string[]> => {
    if (!existsSync(root)) return [];
    const files: string[] = [];
    for (const entry of await readdir(root, { withFileTypes: true })) {
        const path = join(root, entry.name);
        if (entry.isDirectory()) files.push(...(await listFiles(path)));
        else if (entry.isFile()) files.push(path);
    }
    return files;
};

export const normalizeOpenSpecAntigravityOutput = async (projectDir: string): Promise<void> => {
    const legacyRoot = join(projectDir, '.agent');
    if (!existsSync(legacyRoot)) return;

    for (const directory of ['skills', 'workflows']) {
        const source = join(legacyRoot, directory);
        if (!existsSync(source)) continue;
        const destination = join(projectDir, '.agents', directory);
        const sourceFiles = await listFiles(source);
        await cp(source, destination, { recursive: true, force: true });

        const missing = sourceFiles.filter((file) => !existsSync(join(destination, relative(source, file))));
        if (missing.length > 0) {
            throw new Error(`OpenSpec normalization failed; missing ${missing.length} file(s) in .agents/${directory}`);
        }
        await rm(source, { recursive: true });
    }

    try {
        await rmdir(legacyRoot);
    } catch (error) {
        const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
        if (code !== 'ENOTEMPTY' && code !== 'ENOENT') throw error;
    }
};
