import React, { FC } from 'react';
import { Box } from 'ink';
import { TaskRunnerView } from '../components/TaskRunnerView.js';
import { executeGitCommandStep } from '@/commands/git/actions/execute.js';
import type { ProgramDeps } from '@/cli/deps.js';

interface GitViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const GitView: FC<GitViewProps> = ({ deps, onBack }) => {
    const handleRunGitSync = async (log: (msg: string) => void) => {
        log('Starting Git & Shell profile synchronization...');
        const runDeps: ProgramDeps = deps ?? {
            stdout: (msg: string) => log(msg),
            stderr: (msg: string) => log(`[stderr] ${msg}`),
            cwd: process.cwd(),
            env: process.env,
            fetcher: globalThis.fetch,
        };

        await executeGitCommandStep(
            {
                ...runDeps,
                stdout: (msg: string) => log(msg),
            },
            undefined,
            { all: true },
        );
        log('Git & Shell profiles synced successfully.');
    };

    return (
        <Box flexDirection="column" paddingX={1}>
            <TaskRunnerView title="Git & Shell Profiles Sync" runTask={handleRunGitSync} onDone={onBack} />
        </Box>
    );
};
