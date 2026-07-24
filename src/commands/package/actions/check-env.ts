import { execSync } from 'node:child_process';
import type { ProgramDeps } from '@/cli/deps.js';

export function checkEnvironmentRequirement(req: string): boolean {
    try {
        const cmd = process.platform === 'win32' ? `where ${req}` : `which ${req}`;
        execSync(cmd, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

export function checkEnvironment(deps: ProgramDeps, requirements: string[]): { ok: boolean; missing: string[] } {
    const missing: string[] = [];
    for (const req of requirements) {
        if (!checkEnvironmentRequirement(req)) {
            missing.push(req);
        }
    }
    return {
        ok: missing.length === 0,
        missing,
    };
}
