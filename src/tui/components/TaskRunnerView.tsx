import React from 'react';
import { Box, Text } from 'ink';

interface TaskRunnerViewProps {
    title: string;
    status: 'idle' | 'running' | 'success' | 'error';
    message: string;
    details?: string[];
}

export const TaskRunnerView: React.FC<TaskRunnerViewProps> = ({ title, status, message, details }) => {
    return (
        <Box flexDirection="column" marginY={1}>
            <Text bold color="cyan">
                {title}
            </Text>

            <Box marginY={1}>
                {status === 'running' && <Text color="yellow">⏳ {message}</Text>}
                {status === 'success' && <Text color="green">✔ {message}</Text>}
                {status === 'error' && <Text color="red">✖ {message}</Text>}
                {status === 'idle' && <Text color="gray">{message}</Text>}
            </Box>

            {details && details.length > 0 && (
                <Box flexDirection="column" marginLeft={2} paddingLeft={1} borderStyle="single" borderColor="gray">
                    {details.map((detail, idx) => (
                        <Text key={idx} color="gray">
                            • {detail}
                        </Text>
                    ))}
                </Box>
            )}
        </Box>
    );
};
