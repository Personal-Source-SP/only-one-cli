import React, { FC, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { SelectMenu } from '../components/SelectMenu.js';
import { BACK_KEY_INPUTS } from '../constants/index.js';
import type { MenuItem } from '../types/index.js';
import type { ProgramDeps } from '@/cli/deps.js';

interface ComboViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const ComboView: FC<ComboViewProps> = ({ deps, onBack }) => {
    const [step, setStep] = useState<'select' | 'running' | 'done'>('select');
    const [statusText, setStatusText] = useState('');

    useInput((input, key) => {
        const isBackOrQuit = BACK_KEY_INPUTS.includes(input);
        const isConfirmExit = key.return && ['select', 'done'].includes(step);

        if (isBackOrQuit || isConfirmExit) {
            onBack();
        }
    });

    const comboMenuItems: MenuItem[] = [
        {
            label: 'NestJS Backend Combo',
            value: 'nestjs-backend',
            icon: '📦',
            description: 'Apply NestJS skills, DTOs, MikroORM, and backend rules',
        },
        {
            label: 'Next.js Fullstack Combo',
            value: 'nextjs-fullstack',
            icon: '🚀',
            description: 'Apply Next.js App Router skills, Refine hooks, and UI guidelines',
        },
    ];

    const handleSelect = (item: MenuItem) => {
        setStep('running');
        setStatusText(`Applying predefined combo (${item.label})...`);

        setTimeout(() => {
            setStep('done');
            setStatusText(`Combo (${item.label}) applied successfully! ✨`);
        }, 1200);
    };

    return (
        <Box flexDirection="column">
            <Header />
            <Text bold color="cyan">
                ✨ Predefined Combos & Stacks
            </Text>

            {step === 'select' && <SelectMenu items={comboMenuItems} onSelect={handleSelect} />}

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
