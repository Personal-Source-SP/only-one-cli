import { AllowedToolId } from '../../../src/constants/allowed-tools.js';
import type { SubagentManifest } from '../../types.js';

export const SUBAGENTS: SubagentManifest[] = [
    {
        id: 'terminal-runner',
        version: '0.0.1',
        description: 'Isolated terminal execution, CLI feature test, and ANSI-stripped log isolation agent.',
        sourceFile: 'terminal-runner.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
        tools: ['run_command'],
    },
    {
        id: 'browser-tester',
        version: '0.0.1',
        description: 'Isolated Playwright browser testing, UI visual screenshot, and DevTools monitoring agent.',
        sourceFile: 'browser-tester.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
        tools: ['browser_navigate', 'browser_click', 'browser_type', 'browser_take_screenshot'],
    },
    {
        id: 'api-tester',
        version: '0.0.1',
        description: 'Isolated backend API validation, concurrency race condition testing, and latency audit agent.',
        sourceFile: 'api-tester.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
        tools: ['run_command'],
    },
    {
        id: 'codebase-scout',
        version: '0.0.1',
        description: 'Isolated read-only codebase explorer and AST-grep reconnaissance agent.',
        sourceFile: 'codebase-scout.md',
        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
        tools: ['read_file', 'search_files', 'run_command'],
        disallowedTools: ['write_file', 'edit_file'],
    },
];
