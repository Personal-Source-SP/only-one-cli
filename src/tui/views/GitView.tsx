import type { ProgramDeps } from '@/cli/deps.js';
import { executeGitCommandStep } from '@/commands/git/actions/execute.js';
import { Box, Text, useInput } from 'ink';
import React, { FC, useEffect, useState } from 'react';
import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';
import { BACK_KEY_INPUTS } from '../constants/index.js';

interface GitViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const GitView: FC<GitViewProps> = ({ deps, onBack }) => {
    const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useInput((input, key) => {
        const isBackOrQuit = BACK_KEY_INPUTS.includes(input);
        const isConfirmExit = key.return && ['done', 'error'].includes(status);

        if (isBackOrQuit || isConfirmExit) {
            onBack();
        }
    });

    useEffect(() => {
        const runSync = async () => {
            try {
                setStatus('running');
                const runDeps: ProgramDeps = deps ?? {
                    stdout: (msg: string) => console.log(msg),
                    stderr: (msg: string) => console.error(msg),
                    cwd: process.cwd(),
                    env: process.env,
                    fetcher: globalThis.fetch,
                };
                await executeGitCommandStep(runDeps, undefined, { all: true });
                setStatus('done');
            } catch (err: any) {
                setStatus('error');
                setErrorMsg(err?.message || String(err));
            }
        };

        runSync();
    }, [deps]);

    return (
        <Box flexDirection="column">
            <Header />
            <Text bold color="yellow">
                ⚡ Git & Shell Profile Sync
            </Text>

            <Box marginY={1} flexDirection="column">
                {status === 'running' && <Text color="yellow">⏳ Running Git shell profile sync...</Text>}
                {status === 'done' && <Text color="green">✔ Git shell profiles & selected modules synced successfully! 🎉</Text>}
                {status === 'error' && <Text color="red">❌ Sync failed: {errorMsg}</Text>}
            </Box>

            <Footer hints={['Enter/b Back to Menu', 'q Exit']} />
        </Box>
    );
};
