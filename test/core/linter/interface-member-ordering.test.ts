import { describe, expect, it } from 'vitest';

import { interfaceMemberOrderingRule } from '../../../eslint-rules/rules/interface-member-ordering.js';

describe('interfaceMemberOrderingRule', () => {
    it('flags required property declared after optional property', () => {
        const reports: any[] = [];
        const context = {
            report: (reportObj: any) => reports.push(reportObj),
        };

        const visitor = (interfaceMemberOrderingRule as any).create(context);
        visitor.TSInterfaceDeclaration({
            body: {
                body: [
                    { type: 'TSPropertySignature', optional: true, key: { name: 'optionalProp' } },
                    { type: 'TSPropertySignature', optional: false, key: { name: 'requiredProp' } },
                ],
            },
        });

        expect(reports.length).toBe(1);
        expect(reports[0].messageId).toBe('invalidMemberOrder');
        expect(reports[0].data.name).toBe('requiredProp');
    });

    it('allows deterministic order where required properties precede optional properties', () => {
        const reports: any[] = [];
        const context = {
            report: (reportObj: any) => reports.push(reportObj),
        };

        const visitor = (interfaceMemberOrderingRule as any).create(context);
        visitor.TSInterfaceDeclaration({
            body: {
                body: [
                    { type: 'TSPropertySignature', optional: false, key: { name: 'id' } },
                    { type: 'TSPropertySignature', optional: false, key: { name: 'name' } },
                    { type: 'TSPropertySignature', optional: true, key: { name: 'description' } },
                ],
            },
        });

        expect(reports.length).toBe(0);
    });
});
