import { AllowedToolId } from '@/constants/allowed-tools.js';
import type { RuleManifest } from '../types.js';

export const RULES: RuleManifest[] = [
    {
        id: 'next-architecture-stack',
        description: 'Next.js architecture, strict TypeScript, runtime boundaries, public contracts, and verification guidelines',
        sourceFile: '02-next-architecture-stack.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
        requiredSkills: ['only-one-nextjs-development'],
    },
    {
        id: 'nest-architecture-stack',
        description: 'NestJS and full-stack architecture, strict TypeScript, public contracts, and verification guidelines',
        sourceFile: '02-nest-architecture-stack.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
        requiredSkills: ['only-one-nestjs-development', 'only-one-nextjs-development'],
    },
    {
        id: 'context-and-tools',
        description: 'Context Minimization — enforce dependency discovery and minimal file context loading before edits',
        sourceFile: '01-context-and-tools.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
    },
];
