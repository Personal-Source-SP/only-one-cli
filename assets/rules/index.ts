import { AllowedToolId } from '@/constants/allowed-tools.js';
import type { RuleManifest } from '../types.js';

export const RULES: RuleManifest[] = [
    {
        id: 'architecture-stack',
        description: 'Architecture & Tech Stack Guidelines — NestJS, Next.js/React, TypeScript standards and shared contracts',
        sourceFile: '02-architecture-stack.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
        requiredSkills: [
            'next-dev-loop',
            'next-cache-components-adoption',
            'next-cache-components-optimizer',
            'next-partial-prefetching-adoption',
        ],
    },
    {
        id: 'context-and-tools',
        description: 'Context Minimization — enforce dependency discovery and minimal file context loading before edits',
        sourceFile: '01-context-and-tools.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
        requiredMcps: ['gitnexus'],
    },
];
