import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { runDoctorChecksStep } from '@/commands/doctor/actions/index.js';
import type { CheckResult } from '@/core/doctor/checks.js';

interface DoctorViewProps {
    onBack: () => void;
}

export const DoctorView: React.FC<DoctorViewProps> = ({ onBack }) => {
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<CheckResult[]>([]);

    useEffect(() => {
        let isMounted = true;
        runDoctorChecksStep().then((res) => {
            if (isMounted) {
                setResults(res);
                setLoading(false);
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);

    useInput((input, key) => {
        if (key.return || input === 'b' || input === 'q') {
            onBack();
        }
    });

    return (
        <Box flexDirection="column">
            <Header />
            <Text bold color="cyan">
                🩺 Environment Readiness Doctor
            </Text>

            {loading ? (
                <Box marginY={1}>
                    <Text color="yellow">⏳ Running environment checks...</Text>
                </Box>
            ) : (
                <Box flexDirection="column" marginY={1}>
                    {results.map((result, idx) => (
                        <Box key={idx} flexDirection="column" marginY={0}>
                            <Box>
                                <Text color={result.ok ? 'green' : 'red'}>{result.ok ? '  ✔ ' : '  ✖ '}</Text>
                                <Text bold color={result.ok ? 'green' : 'red'}>
                                    {result.name}:
                                </Text>
                                <Text color="white"> {result.detail}</Text>
                            </Box>
                            {result.remediation && (
                                <Box marginLeft={5}>
                                    <Text color="yellow">💡 {result.remediation}</Text>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>
            )}

            <Footer hints={['Enter/b Back to Menu', 'q Exit']} />
        </Box>
    );
};
