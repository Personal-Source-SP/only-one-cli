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

    const hasAssetsAlias =
        content.includes('@assets/') || content.includes('@agents/') || content.includes('@devenv/') || content.includes('@templates/');

    if (hasAssetsAlias) {
        const domainMappings: [string, string][] = [
            ['@assets/skills/', relAssetsPrefix + 'agents/skills/'],
            ['@assets/rules/', relAssetsPrefix + 'agents/rules/'],
            ['@assets/mcps/', relAssetsPrefix + 'agents/mcps/'],
            ['@assets/packages/', relAssetsPrefix + 'agents/packages/'],
            ['@assets/combos/', relAssetsPrefix + 'agents/combos/'],
            ['@assets/hooks/', relAssetsPrefix + 'agents/hooks/'],
            ['@assets/vs/', relAssetsPrefix + 'devenv/editor/'],
            ['@assets/git/', relAssetsPrefix + 'devenv/shell/'],
            ['@assets/configs/', relAssetsPrefix + 'templates/configs/'],
            ['@assets/ignore/', relAssetsPrefix + 'templates/ignore/'],
            ['@assets/agents/', relAssetsPrefix + 'agents/'],
            ['@assets/devenv/', relAssetsPrefix + 'devenv/'],
            ['@assets/templates/', relAssetsPrefix + 'templates/'],
            ['@agents/', relAssetsPrefix + 'agents/'],
            ['@devenv/', relAssetsPrefix + 'devenv/'],
            ['@templates/', relAssetsPrefix + 'templates/'],
            ['@assets/', relAssetsPrefix],
        ];

        for (const [alias, target] of domainMappings) {
            cleaned = cleaned
                .replaceAll("from '" + alias, "from '" + target)
                .replaceAll('from "' + alias, 'from "' + target)
                .replaceAll("import('" + alias, "import('" + target)
                .replaceAll('import("' + alias, 'import("' + target);
        }
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
        expect(output).toContain("import('../../../assets/agents/packages/index.js')");
        expect(output).not.toContain('@/');
        expect(output).not.toContain('@assets/');
    });

    it('ánh xạ chính xác các domain assets sang cấu trúc 3 miền', () => {
        const input = [
            "import { IGNORE_TEMPLATES } from '@assets/ignore/index.js';",
            "import { RULES } from '@assets/rules/index.js';",
            "import { SKILLS } from '@assets/skills/index.js';",
            "import { VS_LIBRARY } from '@assets/vs/index.js';",
            "import { TEMPLATES } from '@assets/templates/ignore/index.js';",
        ].join('\n');
        const output = transformPaths(input, '../../', '../../../assets/');
        expect(output).toContain("from '../../../assets/templates/ignore/index.js'");
        expect(output).toContain("from '../../../assets/agents/rules/index.js'");
        expect(output).toContain("from '../../../assets/agents/skills/index.js'");
        expect(output).toContain("from '../../../assets/devenv/editor/index.js'");
        expect(output).not.toContain('@assets/');
    });
});
