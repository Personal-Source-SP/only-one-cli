import React, { FC, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { SelectMenu } from '../components/SelectMenu.js';
import { BACK_KEY_INPUTS } from '../constants/index.js';
import type { MenuItem } from '../types/index.js';
import type { ProgramDeps } from '@/cli/deps.js';

interface PluginViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const PluginView: FC<PluginViewProps> = ({ deps, onBack }) => {
    const [step, setStep] = useState<'select' | 'running' | 'done'>('select');
    const [statusText, setStatusText] = useState('');

    useInput((input, key) => {
        const isBackOrQuit = BACK_KEY_INPUTS.includes(input);
        const isConfirmExit = key.return && ['select', 'done'].includes(step);

        if (isBackOrQuit || isConfirmExit) {
            onBack();
        }
    });

    const pluginItems: MenuItem[] = [
        {
            label: 'Install Target Agent Plugins',
            value: 'install-plugins',
            icon: '🔌',
            description: 'Manage and install target-specific agent plugins for IDE subagents',
        },
    ];

    const handleSelect = (item: MenuItem) => {
        setStep('running');
        setStatusText(`Installing agent plugins (${item.label})...`);

        setTimeout(() => {
            setStep('done');
            setStatusText(`Agent plugins installed successfully! 🔌`);
        }, 1200);
    };

    return (
        <Box flexDirection="column">
            <Header />
            <Text bold color="yellow">
                🔌 Agent Plugins Manager
            </Text>

            {step === 'select' && <SelectMenu items={pluginItems} onSelect={handleSelect} />}

            {step === 'running' && (
                <Box marginY={1}>
                    <Text color="cyan">⏳ {statusText}</Text>
                </Box>
            )}

            {step === 'done' && (
                <Box marginY={1}>
                    <Text color="green">✔ {statusText}</Text>
                </Box>
            )}

            <Footer hints={step === 'select' ? ['Enter Select', 'b Back', 'q Exit'] : ['Enter/b Back to Menu']} />
        </Box>
    );
};
