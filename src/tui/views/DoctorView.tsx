import React, { FC, useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { SelectMenu } from '../components/SelectMenu.js';
import { runDoctorChecksStep } from '@/commands/doctor/actions/index.js';
import type { CheckResult } from '@/core/doctor/checks.js';
import { getAllowedVsSettingsTargets } from '@/core/target-selection/index.js';
import { BACK_KEY_INPUTS } from '../constants/index.js';

interface DoctorViewProps {
    onBack: () => void;
}

export const DoctorView: FC<DoctorViewProps> = ({ onBack }) => {
    const [selectedEditor, setSelectedEditor] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<CheckResult[]>([]);

    useEffect(() => {
        if (!selectedEditor) return;

        let isMounted = true;
        setLoading(true);
        runDoctorChecksStep({ targetEditorId: selectedEditor }).then((res) => {
            if (isMounted) {
                setResults(res);
                setLoading(false);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [selectedEditor]);

    useInput((input, key) => {
        if (key.return || BACK_KEY_INPUTS.includes(input)) {
            if (selectedEditor && !loading) {
                // If already showing results, back goes to editor select
                setSelectedEditor(null);
            } else {
                onBack();
            }
        }
    });

    if (!selectedEditor) {
        const ideOptions = [
            ...getAllowedVsSettingsTargets().map((t) => ({
                label: t.vs?.name || t.id,
                value: t.id,
            })),
            { label: 'Check All Supported IDEs', value: 'all' },
        ];

        return (
            <Box flexDirection="column">
                <Header />
                <Text bold color="cyan">
                    🩺 Select Target IDE to Check:
                </Text>
                <SelectMenu items={ideOptions} onSelect={(item) => setSelectedEditor(item.value)} />
                <Footer hints={['↑/↓ Navigate', 'Enter Select', 'b Back', 'q Exit']} />
            </Box>
        );
    }

    // Group results by category
    const categorized = results.reduce<Record<string, CheckResult[]>>((acc, item) => {
        const cat = item.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    return (
        <Box flexDirection="column">
            <Header />
            <Text bold color="cyan">
                🩺 Environment Readiness Doctor ({selectedEditor.toUpperCase()})
            </Text>

            {loading ? (
                <Box marginY={1}>
                    <Text color="yellow">⏳ Running environment checks...</Text>
                </Box>
            ) : (
                <Box flexDirection="column" marginY={1}>
                    {Object.entries(categorized).map(([category, items], catIdx) => (
                        <Box key={catIdx} flexDirection="column" marginY={0}>
                            <Text bold color="blue">
                                [{category}]
                            </Text>
                            {items.map((result, idx) => (
                                <Box key={idx} flexDirection="column" marginLeft={2}>
                                    <Box>
                                        <Text color={result.ok ? 'green' : 'red'}>{result.ok ? '✔ ' : '✖ '}</Text>
                                        <Text bold color={result.ok ? 'green' : 'red'}>
                                            {result.name}:
                                        </Text>
                                        <Text color="white"> {result.detail}</Text>
                                    </Box>
                                    {result.remediation && (
                                        <Box marginLeft={4}>
                                            <Text color="yellow">💡 {result.remediation}</Text>
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    ))}
                </Box>
            )}

            <Footer hints={['Enter/b Back to IDE Selection', 'q Exit']} />
        </Box>
    );
};
