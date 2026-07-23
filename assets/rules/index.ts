import { AllowedToolId } from '@/constants/allowed-tools.js';
import type { RuleManifest } from '../types.js';

export const RULES: RuleManifest[] = [
    {
        id: 'bug-fix',
        description: 'Bug Fix — reproduce, analyze, present evidence, and wait for approval before changes',
        sourceFile: 'bug-fix.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
        requiredPlugins: ['superpowers'],
        requiredMcps: ['gitnexus'],
    },
    {
        id: 'react-nextjs',
        description: 'ReactJS and Next.js — component, hook, rendering boundary, i18n, and responsive conventions',
        sourceFile: 'react-nextjs.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
        requiredSkills: [
            'next-dev-loop',
            'next-cache-components-adoption',
            'next-cache-components-optimizer',
            'next-partial-prefetching-adoption',
        ],
    },
    {
        id: 'nestjs',
        description: 'NestJS — module, service, repository, error handling, and contract conventions',
        sourceFile: 'nestjs.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
    },
    {
        id: 'typescript',
        description: 'TypeScript — preserve strict typing and validate type contracts',
        sourceFile: 'typescript.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
    },
    {
        id: 'ui',
        description: 'UI — follow Antigravity UI directives and existing project design patterns',
        sourceFile: 'ui.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
    },
    {
        id: 'context-minimization',
        description: 'Context Minimization — enforce dependency discovery and minimal file context loading before edits',
        sourceFile: 'context-minimization.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
        requiredPackages: ['@fission-ai/openspec'],
        requiredPlugins: ['superpowers'],
        requiredMcps: ['gitnexus'],
    },
];
