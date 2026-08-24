import React, { FC, useState } from 'react';
import { Box, Text } from 'ink';
import { SelectMenu } from '../components/SelectMenu.js';
import { TaskRunnerView } from '../components/TaskRunnerView.js';
import { MCPS } from '@assets/mcps/index.js';
import { syncMcpGlobalConfig } from '@/core/mcp/sync.js';
import { getAllowedVsSettingsTargets } from '@/core/target-selection/index.js';
import type { ProgramDeps } from '@/cli/deps.js';
import type { MenuItem } from '../types/index.js';
import { homedir } from 'node:os';

interface McpViewProps {
    deps?: ProgramDeps;
    onBack: () => void;
}

export const McpView: FC<McpViewProps> = ({ deps, onBack }) => {
    const [selectedMcpId, setSelectedMcpId] = useState<string | null>(null);

    const mcpMenuItems: MenuItem[] = [
        {
            label: 'Sync All MCP Servers',
            value: 'all',
            icon: '🌐',
            description: `Sync all ${MCPS.length} registered MCP server configurations`,
        },
        ...MCPS.map((m) => ({
            label: m.id,
            value: m.id,
            icon: '🌐',
            description: `Configure ${m.id} Model Context Protocol server`,
        })),
    ];

    const handleRunMcpSync = async (log: (msg: string) => void) => {
        log(`Configuring MCP servers...`);
        const targetMcps = selectedMcpId === 'all' ? MCPS : MCPS.filter((m) => m.id === selectedMcpId);
        const ideIds = getAllowedVsSettingsTargets().map((t) => t.id);

        const results = await syncMcpGlobalConfig({
            cwd: process.cwd(),
            homeDir: homedir(),
            platform: process.platform,
            ideIds,
            manifests: targetMcps,
            write: (msg: string) => log(msg),
            overwriteList: targetMcps.map((m) => m.id),
        });

        log(`Sync completed: ${results.results.length} IDE configs updated.`);
    };

    if (selectedMcpId) {
        const title = selectedMcpId === 'all' ? 'All MCP Servers' : selectedMcpId;
        return (
            <Box flexDirection="column" paddingX={1}>
                <TaskRunnerView title={`Configure MCP: ${title}`} runTask={handleRunMcpSync} onDone={onBack} />
            </Box>
        );
    }

    return (
        <Box flexDirection="column" paddingX={1}>
            <Box marginY={0}>
                <Text bold color="magenta">
                    🌐 Select MCP Server to Configure:
                </Text>
            </Box>
            <SelectMenu items={mcpMenuItems} onSelect={(item) => setSelectedMcpId(item.value)} />
        </Box>
    );
};
