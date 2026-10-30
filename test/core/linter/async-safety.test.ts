import { describe, expect, it } from 'vitest';

import { asyncSafetyRule } from '../../../eslint-rules/rules/async-safety.js';

describe('asyncSafetyRule', () => {
    it('flags unhandled call expression ending with Async', () => {
        const reports: any[] = [];
        const context = {
            report: (reportObj: any) => reports.push(reportObj),
        };

        const visitor = (asyncSafetyRule as any).create(context);
        visitor.CallExpression({
            callee: { name: 'fetchDataAsync' },
            parent: { type: 'ExpressionStatement' },
        });

        expect(reports.length).toBe(1);
        expect(reports[0].messageId).toBe('missingAwait');
    });

    it('allows async call wrapped in AwaitExpression', () => {
        const reports: any[] = [];
        const context = {
            report: (reportObj: any) => reports.push(reportObj),
        };

        const visitor = (asyncSafetyRule as any).create(context);
        visitor.CallExpression({
            callee: { name: 'fetchDataAsync' },
            parent: { type: 'AwaitExpression' },
        });

        expect(reports.length).toBe(0);
    });

    it('allows async call directly in ReturnStatement', () => {
        const reports: any[] = [];
        const context = {
            report: (reportObj: any) => reports.push(reportObj),
        };

        const visitor = (asyncSafetyRule as any).create(context);
        visitor.CallExpression({
            callee: { name: 'fetchDataAsync' },
            parent: { type: 'ReturnStatement' },
        });

        expect(reports.length).toBe(0);
    });
});
