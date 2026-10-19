import pc from 'picocolors';

export interface FormattedLine {
    raw: string;
    formatted: string;
    isCodeBlock: boolean;
}

export function formatMarkdown(content: string): FormattedLine[] {
    const lines = content.split(/\r?\n/);
    let inCodeBlock = false;

    return lines.map((line) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            return {
                raw: line,
                formatted: pc.dim(pc.gray(line)),
                isCodeBlock: true,
            };
        }

        if (inCodeBlock) {
            return {
                raw: line,
                formatted: pc.green(line),
                isCodeBlock: true,
            };
        }

        if (trimmed.startsWith('# ')) {
            return { raw: line, formatted: pc.bold(pc.cyan(line)), isCodeBlock: false };
        }
        if (trimmed.startsWith('## ')) {
            return { raw: line, formatted: pc.bold(pc.blue(line)), isCodeBlock: false };
        }
        if (trimmed.startsWith('### ')) {
            return { raw: line, formatted: pc.bold(pc.yellow(line)), isCodeBlock: false };
        }
        if (trimmed.startsWith('> ')) {
            return { raw: line, formatted: pc.italic(pc.gray(line)), isCodeBlock: false };
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return { raw: line, formatted: pc.cyan('• ') + line.slice(2), isCodeBlock: false };
        }
        if (trimmed.startsWith('---')) {
            return { raw: line, formatted: pc.dim('────────────────────────────────────────'), isCodeBlock: false };
        }

        return { raw: line, formatted: line, isCodeBlock: false };
    });
}
