import { describe, expect, it } from 'vitest';
import { VS_LIBRARY } from '@assets/vs/index.js';
import { loadVsLibraryManifest } from '@src/core/vs/library.js';

describe('VS_LIBRARY manifest', () => {
    it('contains unique and alphabetically sorted extensions', () => {
        const extensions = VS_LIBRARY.extensions;
        expect(extensions.length).toBeGreaterThan(0);

        const sorted = [...extensions].sort((a, b) => a.localeCompare(b));
        expect(extensions).toEqual(sorted);

        const unique = Array.from(new Set(extensions.map((e) => e.toLowerCase())));
        expect(extensions.length).toBe(unique.length);
    });

    it('loads normalized library correctly', async () => {
        const lib = await loadVsLibraryManifest();
        expect(lib.extensions).toContain('bierner.markdown-mermaid');
        expect(lib.extensions).toContain('bierner.markdown-preview-github-styles');
        expect(lib.extensions).not.toContain('shd101wyy.markdown-preview-enhanced');
        expect(lib.settings['git.autofetch']).toBe(true);
        expect(lib.settings['workbench.editorAssociations']).toEqual({ '*.md': 'vscode.markdown.preview.editor' });
    });
});
