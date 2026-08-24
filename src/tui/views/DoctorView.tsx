import React, { FC, useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
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
        if (!selectedEditor) return;

        if (key.return || BACK_KEY_INPUTS.includes(input)) {
            if (!loading) {
                setSelectedEditor(null);
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
            <Box flexDirection="column" paddingX={1}>
                <Box marginY={0}>
                    <Text bold color="cyan">
                        🩺 Select Target IDE to Check:
                    </Text>
                </Box>
                <SelectMenu items={ideOptions} onSelect={(item) => setSelectedEditor(item.value)} />
            </Box>
        );
    }

    const categorized = results.reduce<Record<string, CheckResult[]>>((acc, item) => {
        const cat = item.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    return (
        <Box flexDirection="column" paddingX={1}>
            <Box marginY={0}>
                <Text bold color="cyan">
                    🩺 Diagnostic Results ({selectedEditor.toUpperCase()})
                </Text>
            </Box>

            {loading ? (
                <Box marginY={1}>
                    <Text color="yellow">⏳ Running environment checks...</Text>
                </Box>
            ) : (
                <Box flexDirection="column" marginY={1}>
                    {Object.entries(categorized).map(([category, items], catIdx) => {
                        const sortedItems = [...items].sort((a, b) => (a.ok === b.ok ? 0 : a.ok ? -1 : 1));
                        return (
                            <Box key={catIdx} flexDirection="column" marginY={0}>
                                <Text bold color="blue">
                                    [{category}]
                                </Text>
                                {sortedItems.map((result, idx) => (
                                    <Box key={idx} flexDirection="column" marginLeft={2}>
                                        <Box>
                                            <Text color={result.ok ? 'green' : 'red'}>{result.ok ? '✔ ' : '✖ '}</Text>
                                            <Text bold color={result.ok ? 'green' : 'red'}>
                                                {result.name}
                                            </Text>
                                        </Box>
                                        {result.detail && (
                                            <Box marginLeft={2}>
                                                <Text color="gray">{result.detail}</Text>
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        );
                    })}

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
                            to choose another IDE
                        </Text>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
