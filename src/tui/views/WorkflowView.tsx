import React, { FC, useState } from 'react';
import { Box, Text } from 'ink';
import { SelectMenu } from '../components/SelectMenu.js';
import { TaskRunnerView } from '../components/TaskRunnerView.js';
import { WORKFLOWS } from '@assets/workflows/index.js';
import { installWorkflows } from '@/core/workflow/index.js';
import { getAllowedVsSettingsTargets } from '@/core/target-selection/index.js';
import type { ProgramDeps } from '@/cli/deps.js';
import type { MenuItem } from '../types/index.js';

interface WorkflowViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const WorkflowView: FC<WorkflowViewProps> = ({ deps, onBack }) => {
    const [selectedWfName, setSelectedWfName] = useState<string | null>(null);

    const workflowMenuItems: MenuItem[] = [
        {
            label: 'Sync All Workflows',
            value: 'all',
            icon: '⚡',
            description: `Sync all ${WORKFLOWS.length} official workflow templates`,
        },
        ...WORKFLOWS.map((wf) => ({
            label: wf.name,
            value: wf.name,
            icon: '⚡',
            description: wf.description,
        })),
    ];

    const handleRunWorkflowSync = async (log: (msg: string) => void) => {
        log(`Preparing workflow sync...`);
        const wfNames = selectedWfName === 'all' ? WORKFLOWS.map((w) => w.name) : [selectedWfName!];

        const targetTools = getAllowedVsSettingsTargets().map((t) => ({
            value: t.id,
            name: t.vs?.name || t.id,
            description: '',
            skillsDir: t.id === 'antigravity' ? '.agents' : `.agents/${t.id}`,
            ruleExt: 'md' as const,
        }));

        if (deps) {
            const results = await installWorkflows({
                deps: {
                    ...deps,
                    stdout: (msg) => log(msg),
                },
                projectDir: process.cwd(),
                selectedTools: targetTools,
                workflowNames: wfNames,
                overwriteList: wfNames,
            });

            log(`Sync completed: ${results.filter((r) => r.status === 'success').length} installed.`);
        } else {
            log(`Synced workflows: ${wfNames.join(', ')}`);
        }
    };

    if (selectedWfName) {
        const title = selectedWfName === 'all' ? 'All Workflow Templates' : selectedWfName;
        return (
            <Box flexDirection="column" paddingX={1}>
                <TaskRunnerView title={`Sync Workflow: ${title}`} runTask={handleRunWorkflowSync} onDone={onBack} />
            </Box>
        );
    }

    return (
        <Box flexDirection="column" paddingX={1}>
            <Box marginY={0}>
                <Text bold color="cyan">
                    ⚡ Select Workflow Template to Sync:
                </Text>
            </Box>
            <SelectMenu items={workflowMenuItems} onSelect={(item) => setSelectedWfName(item.value)} />
        </Box>
    );
};
