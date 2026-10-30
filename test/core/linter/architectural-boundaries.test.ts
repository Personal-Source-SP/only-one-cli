import { describe, expect, it } from 'vitest';

import { architecturalBoundariesRule } from '../../../eslint-rules/rules/architectural-boundaries.js';

describe('architecturalBoundariesRule', () => {
    it('flags forbidden imports when custom boundary options are violated', () => {
        const reports: any[] = [];
        const context = {
            filename: 'd:/Sources/PERSONAL/only-one-cli/src/core/example.ts',
            options: [
                {
                    boundaries: [
                        {
                            layer: '/src/core/',
                            cannotImportFrom: ['/src/commands/', '@/commands'],
                        },
                    ],
                },
            ],
            report: (reportObj: any) => reports.push(reportObj),
        };

        const visitor = (architecturalBoundariesRule as any).create(context);
        visitor.ImportDeclaration({
            source: { value: '@/commands/run.js' },
        });

        expect(reports.length).toBe(1);
        expect(reports[0].messageId).toBe('forbiddenCrossImport');
    });

    it('allows valid imports matching architectural seams', () => {
        const reports: any[] = [];
        const context = {
            filename: 'd:/Sources/PERSONAL/only-one-cli/src/core/example.ts',
            options: [
                {
                    boundaries: [
                        {
                            layer: '/src/core/',
                            cannotImportFrom: ['/src/commands/'],
                        },
                    ],
                },
            ],
            report: (reportObj: any) => reports.push(reportObj),
        };

        const visitor = (architecturalBoundariesRule as any).create(context);
        visitor.ImportDeclaration({
            source: { value: '@/core/utils.js' },
        });

        expect(reports.length).toBe(0);
    });

    it('allows type-only imports across boundaries when allowTypeImports is enabled', () => {
        const reports: any[] = [];
        const context = {
            filename: 'd:/Sources/PERSONAL/only-one-cli/src/core/example.ts',
            options: [
                {
                    allowTypeImports: true,
                    boundaries: [
                        {
                            layer: '/src/core/',
                            cannotImportFrom: ['/src/commands/'],
                        },
                    ],
                },
            ],
            report: (reportObj: any) => reports.push(reportObj),
        };

        const visitor = (architecturalBoundariesRule as any).create(context);
        visitor.ImportDeclaration({
            importKind: 'type',
            source: { value: '@/commands/run.js' },
        });

        expect(reports.length).toBe(0);
    });

    it('falls back to default domain/infra boundaries when options are omitted', () => {
        const reports: any[] = [];
        const context = {
            filename: '/app/domain/user.ts',
            options: [],
            report: (reportObj: any) => reports.push(reportObj),
        };

        const visitor = (architecturalBoundariesRule as any).create(context);
        visitor.ImportDeclaration({
            source: { value: '/app/infra/db.ts' },
        });

        expect(reports.length).toBe(1);
        expect(reports[0].messageId).toBe('forbiddenCrossImport');
    });
});
