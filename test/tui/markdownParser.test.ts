import { describe, expect, it } from 'vitest';
import { formatMarkdown } from '@/tui/utils/markdownParser.js';

describe('Terminal Markdown Formatter', () => {
    it('detects and styles headers', () => {
        const md = '# Title\n## Subtitle\n### Section';
        const lines = formatMarkdown(md);
        expect(lines.length).toBe(3);
        expect(lines[0].isCodeBlock).toBe(false);
    });

    it('flags lines inside fenced code blocks', () => {
        const md = '```typescript\nconst x = 1;\n```';
        const lines = formatMarkdown(md);
        expect(lines.length).toBe(3);
        expect(lines[1].isCodeBlock).toBe(true);
    });

    it('formats bullet lists with bullet symbol', () => {
        const md = '- Item 1\n* Item 2';
        const lines = formatMarkdown(md);
        expect(lines[0].formatted).toContain('•');
        expect(lines[1].formatted).toContain('•');
    });
});
