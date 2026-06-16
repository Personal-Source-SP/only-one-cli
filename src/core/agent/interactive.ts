import type { ProgramDeps } from '@/cli/deps.js';

export const isPromptInteractive = (deps: ProgramDeps): boolean => {
    if (deps.isInteractive === false) {
        return false;
    }
    if (deps.isInteractive === true) {
        return true;
    }
    return Boolean(process.stdin.isTTY && process.stdout.isTTY);
};
