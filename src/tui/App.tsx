import React, { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { HomeView } from './views/HomeView.js';
import { DoctorView } from './views/DoctorView.js';
import type { ProgramDeps } from '@/cli/deps.js';

interface AppProps {
    deps?: ProgramDeps;
}

export type ViewState = 'home' | 'doctor' | 'info';

export const App: React.FC<AppProps> = ({ deps }) => {
    const { exit } = useApp();
    const [currentView, setCurrentView] = useState<ViewState>('home');
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    useInput((input) => {
        if (input === 'q' && currentView === 'home') {
            exit();
        }
    });

    const handleSelectOption = (value: string) => {
        if (value === 'exit') {
            exit();
            return;
        }

        if (value === 'doctor') {
            setCurrentView('doctor');
            setActionMessage(null);
            return;
        }

        // For other commands like init, skill, mcp, setting-vs, show quick info notice
        setActionMessage(
            `👉 Running '$ only-one ${value}'. Exit TUI or run '$ only-one ${value}' directly in terminal for interactive CLI wizard.`,
        );
    };

    return (
        <Box flexDirection="column" padding={1}>
            {currentView === 'home' && (
                <Box flexDirection="column">
                    <HomeView onSelectOption={handleSelectOption} />
                    {actionMessage && (
                        <Box marginY={1} paddingX={1} borderStyle="single" borderColor="yellow">
                            <Text color="yellow">{actionMessage}</Text>
                        </Box>
                    )}
                </Box>
            )}

            {currentView === 'doctor' && <DoctorView onBack={() => setCurrentView('home')} />}
        </Box>
    );
};
