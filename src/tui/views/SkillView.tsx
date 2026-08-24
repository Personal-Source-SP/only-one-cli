import React, { FC, useState } from 'react';
import { Box, Text } from 'ink';
import { SelectMenu } from '../components/SelectMenu.js';
import { TaskRunnerView } from '../components/TaskRunnerView.js';
import { SKILLS } from '@assets/skills/index.js';
import { installSkills } from '@/core/skill/index.js';
import { getAllowedVsSettingsTargets } from '@/core/target-selection/index.js';
import type { ProgramDeps } from '@/cli/deps.js';
import type { MenuItem } from '../types/index.js';

interface SkillViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const SkillView: FC<SkillViewProps> = ({ deps, onBack }) => {
    const [selectedSkillName, setSelectedSkillName] = useState<string | null>(null);

    const skillMenuItems: MenuItem[] = [
        {
            label: 'Sync All Built-in Skills',
            value: 'all',
            icon: '⚡',
            description: `Sync all ${SKILLS.length} official agent skills to workspace`,
        },
        ...SKILLS.map((s) => ({
            label: s.name,
            value: s.name,
            icon: '🧩',
            description: s.description,
        })),
    ];

    const handleRunSkillSync = async (log: (msg: string) => void) => {
        log(`Preparing skill sync...`);
        const skillNames = selectedSkillName === 'all' ? SKILLS.map((s) => s.name) : [selectedSkillName!];

        const targetTools = getAllowedVsSettingsTargets().map((t) => ({
            value: t.id,
            name: t.vs?.name || t.id,
            description: '',
            skillsDir: t.id === 'antigravity' ? '.agents' : `.agents/${t.id}`,
            ruleExt: 'md' as const,
        }));

        if (deps) {
            const results = await installSkills({
                deps: {
                    ...deps,
                    stdout: (msg) => log(msg),
                },
                projectDir: process.cwd(),
                selectedTools: targetTools,
                skillNames,
                overwriteList: skillNames,
            });

            log(`Sync completed: ${results.filter((r) => r.status === 'success').length} installed.`);
        } else {
            log(`Synced skills: ${skillNames.join(', ')}`);
        }
    };

    if (selectedSkillName) {
        const title = selectedSkillName === 'all' ? 'All Built-in Skills' : selectedSkillName;
        return (
            <Box flexDirection="column" paddingX={1}>
                <TaskRunnerView title={`Sync Skill: ${title}`} runTask={handleRunSkillSync} onDone={onBack} />
            </Box>
        );
    }

    return (
        <Box flexDirection="column" paddingX={1}>
            <Box marginY={0}>
                <Text bold color="cyan">
                    🧩 Select Agent Skill to Sync:
                </Text>
            </Box>
            <SelectMenu items={skillMenuItems} onSelect={(item) => setSelectedSkillName(item.value)} />
        </Box>
    );
};
