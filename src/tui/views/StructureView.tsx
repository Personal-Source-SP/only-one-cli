import React, { FC, useState } from 'react';
import { Box, Text } from 'ink';
import { SelectMenu } from '../components/SelectMenu.js';
import { TaskRunnerView } from '../components/TaskRunnerView.js';
import { scaffoldBlueprintStep } from '@/commands/structure-generate/actions/step-2-scaffold-blueprint.js';
import type { ProgramDeps } from '@/cli/deps.js';
import type { MenuItem } from '../types/index.js';

interface StructureViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const StructureView: FC<StructureViewProps> = ({ deps, onBack }) => {
    const [selectedAction, setSelectedAction] = useState<string | null>(null);

    const structureItems: MenuItem[] = [
        {
            label: 'Scaffold Blueprint Structure',
            value: 'generate-blueprint',
            icon: '🏗️',
            description: 'Scaffold structural blueprint files for agents in workspace',
        },
    ];

    const handleRunScaffold = async (log: (msg: string) => void) => {
        log('Scaffolding workspace blueprint structure...');
        const runDeps: ProgramDeps = deps ?? {
            stdout: (msg: string) => log(msg),
            stderr: (msg: string) => log(`[stderr] ${msg}`),
            cwd: process.cwd(),
            env: process.env,
            fetcher: globalThis.fetch,
        };

        const result = await scaffoldBlueprintStep(
            {
                ...runDeps,
                stdout: (msg) => log(msg),
            },
            process.cwd(),
            {},
        );

        if (result.ok && result.scaffold) {
            log(`Blueprint scaffolded at ${result.scaffold.blueprintPath}`);
        } else {
            log('Blueprint scaffolding completed.');
        }
    };

    if (selectedAction) {
        return (
            <Box flexDirection="column" paddingX={1}>
                <TaskRunnerView title="Scaffold Blueprint Structure" runTask={handleRunScaffold} onDone={onBack} />
            </Box>
        );
    }

    return (
        <Box flexDirection="column" paddingX={1}>
            <Box marginY={0}>
                <Text bold color="cyan">
                    🏗️ Structural Blueprint Generator:
                </Text>
            </Box>
            <SelectMenu items={structureItems} onSelect={(item) => setSelectedAction(item.value)} />
        </Box>
    );
};
