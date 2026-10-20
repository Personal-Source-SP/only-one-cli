import { describe, expect, it } from 'vitest';

function transformPaths(content: string, relPrefix: string, relAssetsPrefix: string): string {
    let cleaned = content;
    if (content.includes("'@/") || content.includes('"@/')) {
        cleaned = cleaned
            .replaceAll(/from '@\//g, "from '" + relPrefix)
            .replaceAll(/from "@\//g, 'from "' + relPrefix)
            .replaceAll(/import\('@\//g, "import('" + relPrefix)
            .replaceAll(/import\("@\//g, 'import("' + relPrefix);
    }
    if (content.includes("'@assets/") || content.includes('"@assets/')) {
        cleaned = cleaned
            .replaceAll(/from '@assets\//g, "from '" + relAssetsPrefix)
            .replaceAll(/from "@assets\//g, 'from "' + relAssetsPrefix)
            .replaceAll(/import\('@assets\//g, "import('" + relAssetsPrefix)
            .replaceAll(/import\("@assets\//g, 'import("' + relAssetsPrefix);
    }
    return cleaned;
}

describe('Postbuild Paths Transformer', () => {
    it('thay thế chính xác static import aliases', () => {
        const input = "import { foo } from '@/core/foo.js';\nimport { bar } from '@assets/bar.js';";
        const output = transformPaths(input, '../../', '../../../assets/');
        expect(output).toContain("from '../../core/foo.js'");
        expect(output).toContain("from '../../../assets/bar.js'");
        expect(output).not.toContain('@/');
        expect(output).not.toContain('@assets/');
    });

    it('thay thế chính xác dynamic import aliases gây lỗi ERR_MODULE_NOT_FOUND', () => {
        const input = "const m = await import('@/tui/init/InitWizardApp.js');\nconst a = await import('@assets/packages/index.js');";
        const output = transformPaths(input, '../../', '../../../assets/');
        expect(output).toContain("import('../../tui/init/InitWizardApp.js')");
        expect(output).toContain("import('../../../assets/packages/index.js')");
        expect(output).not.toContain('@/');
        expect(output).not.toContain('@assets/');
    });
});
