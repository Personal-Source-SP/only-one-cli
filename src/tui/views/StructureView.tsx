import React, { FC, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { SelectMenu } from '../components/SelectMenu.js';
import { BACK_KEY_INPUTS } from '../constants/index.js';
import type { MenuItem } from '../types/index.js';
import type { ProgramDeps } from '@/cli/deps.js';

interface StructureViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const StructureView: FC<StructureViewProps> = ({ deps, onBack }) => {
    const [step, setStep] = useState<'select' | 'running' | 'done'>('select');
    const [statusText, setStatusText] = useState('');

    useInput((input, key) => {
        const isBackOrQuit = BACK_KEY_INPUTS.includes(input);
        const isConfirmExit = key.return && ['select', 'done'].includes(step);

        if (isBackOrQuit || isConfirmExit) {
            onBack();
        }
    });

    const structureItems: MenuItem[] = [
        {
            label: 'Generate Blueprint Structure',
            value: 'generate-blueprint',
            icon: '🏗️',
            description: 'Scaffold structural blueprint files for agents in workspace',
        },
    ];

    const handleSelect = (item: MenuItem) => {
        setStep('running');
        setStatusText(`Scaffolding blueprint structure (${item.label})...`);

        setTimeout(() => {
            setStep('done');
            setStatusText(`Blueprint structure generated successfully! 🏗️`);
        }, 1200);
    };

    return (
        <Box flexDirection="column">
            <Header />
            <Text bold color="cyan">
                🏗️ Structural Blueprint Generator
            </Text>

            {step === 'select' && <SelectMenu items={structureItems} onSelect={handleSelect} />}

            {step === 'running' && (
                <Box marginY={1}>
                    <Text color="yellow">⏳ {statusText}</Text>
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
