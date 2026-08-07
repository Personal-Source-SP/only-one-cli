import React, { FC, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { SelectMenu } from '../components/SelectMenu.js';
import { BACK_KEY_INPUTS, SKILL_MENU_ITEMS } from '../constants/index.js';
import type { MenuItem } from '../types/index.js';
import type { ProgramDeps } from '@/cli/deps.js';

interface SkillViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const SkillView: FC<SkillViewProps> = ({ deps, onBack }) => {
    const [step, setStep] = useState<'select' | 'running' | 'done'>('select');
    const [statusText, setStatusText] = useState('');

    useInput((input, key) => {
        if (BACK_KEY_INPUTS.includes(input) && ['select', 'done'].includes(step)) {
            onBack();
        }
    });

    const handleSelect = (item: MenuItem) => {
        setStep('running');
        setStatusText(`Executing ${item.label}...`);

        setTimeout(() => {
            setStep('done');
            setStatusText(`Completed: ${item.label} successfully!`);
        }, 1000);
    };

    return (
        <Box flexDirection="column">
            <Header />
            <Text bold color="cyan">
                🧩 Agent Skills Manager
            </Text>

            {step === 'select' && <SelectMenu items={SKILL_MENU_ITEMS} onSelect={handleSelect} />}

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

            <Footer hints={['Enter Select', 'b Back', 'q Exit']} />
        </Box>
    );
};
