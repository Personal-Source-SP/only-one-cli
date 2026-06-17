import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Appends directory/file patterns to the project's .gitignore file
 * under a dedicated section if they are not already ignored.
 *
 * @param projectDir Absolute path to the project directory
 * @param pathsToIgnore Array of paths/patterns to ignore (e.g. ['.cursor', '.claude'])
 */
export async function updateGitignore(projectDir: string, pathsToIgnore: string[]): Promise<void> {
    const gitignorePath = join(projectDir, '.gitignore');
    let content = '';

    if (existsSync(gitignorePath)) {
        content = await readFile(gitignorePath, 'utf-8');
    }

    const sectionHeader = '# AI ignores';
    const lines = content.split(/\r?\n/);

    const sectionStartIndex = lines.findIndex((line) => line.trim() === sectionHeader);

    // Default ignores as requested by the user
    const defaultIgnores = ['.agent/', 'openspec/', 'adr', 'openspec'];

    // Format all input directories to ensure they end with a slash for safety
    const formattedInputPaths = (pathsToIgnore || []).map((p) => {
        const cleanPath = p.trim().replace(/\/$/, '');
        return `${cleanPath}/`;
    });

    // Merge default ignores with formatted input paths
    const allPaths = Array.from(new Set([...defaultIgnores, ...formattedInputPaths]));

    const newIgnores: string[] = [];
    for (const p of allPaths) {
        // Check if the path is already present
        const isAlreadyIgnored = lines.some((line) => {
            const trimmed = line.trim();
            return trimmed === p;
        });

        if (!isAlreadyIgnored) {
            newIgnores.push(p);
        }
    }

    if (newIgnores.length === 0) return;

    if (sectionStartIndex === -1) {
        // Append section to the end of the file
        if (content && !content.endsWith('\n')) {
            content += '\n';
        }
        content += `\n${sectionHeader}\n${newIgnores.join('\n')}\n`;
    } else {
        // Insert new ignore patterns after the section header
        let insertIndex = sectionStartIndex + 1;
        while (insertIndex < lines.length && lines[insertIndex].trim() !== '' && !lines[insertIndex].startsWith('#')) {
            insertIndex++;
        }
        lines.splice(insertIndex, 0, ...newIgnores);
        content = lines.join('\n');
    }

    await writeFile(gitignorePath, content, 'utf-8');
}
