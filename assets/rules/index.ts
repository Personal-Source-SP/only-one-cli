import { AllowedToolId } from '@/constants/allowed-tools.js';
import type { RuleManifest } from '../types.js';

export const RULES: RuleManifest[] = [
    {
        id: 'context-minimization',
        description: 'Context Minimization — enforce dependency discovery and minimal file context loading before edits',
        sourceFile: 'context-minimization.md',
        supportedTargets: [
            AllowedToolId.Antigravity,
            AllowedToolId.Claude,
            AllowedToolId.Cursor,
        ],
        requiredPackages: ['@fission-ai/openspec'],
        requiredPlugins: ['superpowers'],
        requiredMcps: ['gitnexus'],
    },
];
