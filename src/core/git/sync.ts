import { readFileSync, writeFileSync, existsSync } from 'node:fs';

export const mergeManagedBlock = (existingContent: string, newContent: string, tag = 'ONLY-ONE-GIT'): string => {
    const startTag = `# >>> ${tag} >>>`;
    const endTag = `# <<< ${tag} <<<`;

    const block = `${startTag}\n${newContent.trim()}\n${endTag}`;

    if (existingContent.includes(startTag)) {
        const regex = new RegExp(`${startTag}[\\s\\S]*?${endTag}`, 'g');
        return existingContent.replace(regex, block);
    }

    return existingContent ? `${existingContent.trim()}\n\n${block}\n` : `${block}\n`;
};
