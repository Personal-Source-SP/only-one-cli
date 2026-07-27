import { AllowedToolId } from '@/constants/allowed-tools.js';
import type { RuleManifest } from '../types.js';

export const RULES: RuleManifest[] = [
    {
        id: 'architecture-stack',
        description: 'Framework-neutral architecture, strict TypeScript, runtime boundaries, public contracts, and verification guidelines',
        sourceFile: '02-architecture-stack.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
    },
    {
        id: 'context-and-tools',
        description: 'Context Minimization — enforce dependency discovery and minimal file context loading before edits',
        sourceFile: '01-context-and-tools.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
        requiredMcps: ['gitnexus'],
    },
];
