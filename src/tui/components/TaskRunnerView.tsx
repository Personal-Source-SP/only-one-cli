import React, { FC, useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';

export interface TaskRunnerViewProps {
    title: string;
    status?: 'idle' | 'running' | 'success' | 'error';
    message?: string;
    details?: string[];
    runTask?: (log: (msg: string) => void) => Promise<void>;
    onDone?: () => void;
}

export const TaskRunnerView: FC<TaskRunnerViewProps> = ({
    title,
    status: initialStatus,
    message: initialMessage,
    details: initialDetails,
    runTask,
    onDone,
}) => {
    const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>(runTask ? 'running' : initialStatus || 'idle');
    const [logs, setLogs] = useState<string[]>(initialDetails || (initialMessage ? [initialMessage] : []));
    const [startTime] = useState<number>(Date.now());
    const [duration, setDuration] = useState<number | null>(null);

    const appendLog = (msg: string) => {
        setLogs((prev) => [...prev.slice(-8), msg]);
    };

    useEffect(() => {
        if (!runTask) {
            if (initialStatus) setStatus(initialStatus);
            if (initialDetails) setLogs(initialDetails);
            return;
        }

        let mounted = true;
        appendLog(`🚀 Starting ${title}...`);

        runTask(appendLog)
            .then(() => {
                if (mounted) {
                    setStatus('success');
                    setDuration(Math.round((Date.now() - startTime) / 100) / 10);
                    appendLog(`✔ Finished ${title} successfully!`);
                }
            })
            .catch((err: unknown) => {
                if (mounted) {
                    setStatus('error');
                    setDuration(Math.round((Date.now() - startTime) / 100) / 10);
                    const errorMsg = err instanceof Error ? err.message : String(err);
                    appendLog(`✖ Error: ${errorMsg}`);
                }
            });

        return () => {
            mounted = false;
        };
    }, []);

    useInput((input, key) => {
        if (status !== 'running' && onDone) {
            if (key.return || input === 'b' || input === 'q') {
                onDone();
            }
        }
    });

    return (
        <Box flexDirection="column" marginY={1}>
            <Box marginBottom={1}>
                {status === 'running' && <Text color="yellow">⏳ Running: </Text>}
                {status === 'success' && <Text color="green">✔ Success: </Text>}
                {status === 'error' && <Text color="red">✖ Failed: </Text>}
                {status === 'idle' && <Text color="cyan">⚙️ Task: </Text>}
                <Text bold color="white">
                    {title}
                </Text>
                {duration !== null && <Text color="gray"> ({duration}s)</Text>}
            </Box>

            <Box
                flexDirection="column"
                borderStyle="single"
                borderColor={status === 'error' ? 'red' : status === 'success' ? 'green' : 'gray'}
                paddingX={1}
                minHeight={6}
            >
                {logs.length === 0 ? (
                    <Text color="gray" italic>
                        Waiting for logs...
                    </Text>
                ) : (
                    logs.map((log, idx) => (
                        <Text key={idx} color={idx === logs.length - 1 ? 'cyan' : 'gray'}>
                            {log}
                        </Text>
                    ))
                )}
            </Box>

            {status !== 'running' && onDone && (
                <Box marginTop={1}>
                    <Text color="gray">
                        Press{' '}
                        <Text bold color="yellow">
                            [Enter]
                        </Text>{' '}
                        or{' '}
                        <Text bold color="yellow">
                            [b]
                        </Text>{' '}
                        to return
                    </Text>
                </Box>
            )}
        </Box>
    );
};
