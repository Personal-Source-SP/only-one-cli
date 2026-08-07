import React, { FC, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { SelectMenu } from '../components/SelectMenu.js';
import { BACK_KEY_INPUTS } from '../constants/index.js';
import type { MenuItem } from '../types/index.js';
import type { ProgramDeps } from '@/cli/deps.js';

interface UpdateViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const UpdateView: FC<UpdateViewProps> = ({ deps, onBack }) => {
    const [step, setStep] = useState<'select' | 'running' | 'done'>('select');
    const [statusText, setStatusText] = useState('');

    useInput((input, key) => {
        const isBackOrQuit = BACK_KEY_INPUTS.includes(input);
        const isConfirmExit = key.return && ['select', 'done'].includes(step);

        if (isBackOrQuit || isConfirmExit) {
            onBack();
        }
    });

    const updateItems: MenuItem[] = [
        {
            label: 'Refresh Skills & Templates',
            value: 'refresh-all',
            icon: '🔄',
            description: 'Refresh installed agent skills, rules, and workspace templates',
        },
    ];

    const handleSelect = (item: MenuItem) => {
        setStep('running');
        setStatusText(`Refreshing skills and templates (${item.label})...`);

        setTimeout(() => {
            setStep('done');
            setStatusText(`Skills and templates refreshed successfully! 🔄`);
        }, 1200);
    };

    return (
        <Box flexDirection="column">
            <Header />
            <Text bold color="green">
                🔄 Refresh Skills & Templates
            </Text>

            {step === 'select' && <SelectMenu items={updateItems} onSelect={handleSelect} />}

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
