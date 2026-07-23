import type { Fetcher } from '@/core/client/index.js';

export interface PromptDeps {
    input: (config: { message: string; default?: string }) => Promise<string>;
    confirm: (config: { message: string; default?: boolean }) => Promise<boolean>;
    select?: <T>(config: { message: string; choices: Array<{ name: string; value: T }>; default?: T }) => Promise<T>;
    checkbox?: <T>(config: {
        message: string;
        choices: Array<{ name: string; value: T; checked?: boolean; preSelected?: boolean; configured?: boolean; detected?: boolean }>;
        default?: T[];
    }) => Promise<T[]>;
}

export interface ProgramDeps {
    cwd: string;
    env: Record<string, string | undefined>;
    prompts?: PromptDeps;
    /** When set, overrides TTY detection for rich search output. */
    isInteractive?: boolean;
    fetcher: Fetcher;
    stdout: (line: string) => void;
    stderr?: (line: string) => void;
}
