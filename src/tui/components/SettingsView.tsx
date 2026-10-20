import { Box, Text, useInput } from 'ink';
import React, { FC, useEffect, useState } from 'react';
import { isHerdrSessionActive, listHerdrPanes, normalizePhaseRoute } from '../services/herdrService.js';
import type { OnlyOneGlobalConfig } from '../types/config.js';
import type { HerdrAgent } from '../types/task.js';

type SettingsViewProps = {
    initialConfig: OnlyOneGlobalConfig;
    onSave: (config: OnlyOneGlobalConfig) => void;
    onClose: () => void;
};

const SUPPORTED_CLI_TOOLS = ['agy', 'codex', 'claude', 'cursor', 'gemini'];

export const SettingsView: FC<SettingsViewProps> = ({ initialConfig, onSave, onClose }) => {
    const [config, setConfig] = useState<OnlyOneGlobalConfig>(initialConfig);
    const [herdrAgents, setHerdrAgents] = useState<HerdrAgent[]>([]);
    const [focusIndex, setFocusIndex] = useState(0);

    useEffect(() => {
        listHerdrPanes().then((agents) => {
            if (agents.length > 0) {
                setHerdrAgents(agents);
            }
        });
    }, []);

    const settingItems = [
        { id: 'clean_enabled', label: 'Bật tự động dọn dẹp (Auto-Clean)' },
        { id: 'clean_threshold', label: 'Ngưỡng task hoàn thành (Threshold)' },
        { id: 'agent_concept', label: "Agent cho Phase 'concept'" },
        { id: 'agent_plan', label: "Agent cho Phase 'plan'" },
        { id: 'agent_apply', label: "Agent cho Phase 'apply'" },
        { id: 'agent_debug', label: "Agent cho Phase 'debug'" },
        { id: 'agent_review', label: "Agent cho Phase 'review'" },
        { id: 'agent_clean', label: "Agent cho Tác vụ 'clean'" },
    ];

    useInput((input, key) => {
        if (key.escape || input === 's' || input === 'q') {
            onSave(config);
            onClose();
            return;
        }

        if (key.upArrow) {
            setFocusIndex((prev) => Math.max(0, prev - 1));
            return;
        }

        if (key.downArrow) {
            setFocusIndex((prev) => Math.min(settingItems.length - 1, prev + 1));
            return;
        }

        const currentItem = settingItems[focusIndex]?.id;

        if (currentItem === 'clean_enabled' && (input === ' ' || key.return)) {
            setConfig((prev) => ({
                ...prev,
                cleanPolicy: { ...prev.cleanPolicy, enabled: !prev.cleanPolicy.enabled },
            }));
        } else if (currentItem === 'clean_threshold') {
            if (key.leftArrow) {
                setConfig((prev) => ({
                    ...prev,
                    cleanPolicy: {
                        ...prev.cleanPolicy,
                        thresholdCount: Math.max(1, prev.cleanPolicy.thresholdCount - 1),
                    },
                }));
            } else if (key.rightArrow) {
                setConfig((prev) => ({
                    ...prev,
                    cleanPolicy: {
                        ...prev.cleanPolicy,
                        thresholdCount: prev.cleanPolicy.thresholdCount + 1,
                    },
                }));
            }
        } else if (currentItem?.startsWith('agent_')) {
            const phase = currentItem.replace('agent_', '') as keyof OnlyOneGlobalConfig['agentRouting'];
            const currentRoute = normalizePhaseRoute(config.agentRouting[phase]);
            const availablePanes = ['auto', ...herdrAgents.map((a) => a.pane_id).filter(Boolean)];

            // [←/→]: Đổi Target Pane
            if (key.leftArrow) {
                const pIdx = availablePanes.indexOf(currentRoute.pane);
                const nextPIdx = pIdx > 0 ? pIdx - 1 : availablePanes.length - 1;
                setConfig((prev) => ({
                    ...prev,
                    agentRouting: {
                        ...prev.agentRouting,
                        [phase]: { ...currentRoute, pane: availablePanes[nextPIdx] },
                    },
                }));
            } else if (key.rightArrow) {
                const pIdx = availablePanes.indexOf(currentRoute.pane);
                const nextPIdx = (pIdx + 1) % availablePanes.length;
                setConfig((prev) => ({
                    ...prev,
                    agentRouting: {
                        ...prev.agentRouting,
                        [phase]: { ...currentRoute, pane: availablePanes[nextPIdx] },
                    },
                }));
                // [Space/Enter]: Đổi CLI Tool
            } else if (input === ' ' || key.return) {
                const cIdx = SUPPORTED_CLI_TOOLS.indexOf(currentRoute.cli);
                const nextCIdx = (cIdx + 1) % SUPPORTED_CLI_TOOLS.length;
                setConfig((prev) => ({
                    ...prev,
                    agentRouting: {
                        ...prev.agentRouting,
                        [phase]: { ...currentRoute, cli: SUPPORTED_CLI_TOOLS[nextCIdx] },
                    },
                }));
            }
        }
    });

    return (
        <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1} flexGrow={1}>
            <Box marginBottom={1} justifyContent="space-between">
                <Text bold color="cyan">
                    ⚙️ ONLY-ONE GLOBAL SETTINGS (~/.only-one/config.json)
                </Text>
                <Text dimColor>[Esc / s] Lưu & Quay lại</Text>
            </Box>

            {/* Panel danh sách Herdr Active Agents */}
            <Box flexDirection="column" borderStyle="single" borderColor="green" paddingX={1} marginBottom={1}>
                <Box justifyContent="space-between">
                    <Text bold color="green">
                        🟢 HERDR ACTIVE AGENTS ({herdrAgents.length} agents đang chạy)
                    </Text>
                    <Text dimColor>{isHerdrSessionActive() ? 'SESSION: CONNECTED' : 'SESSION: OFF'}</Text>
                </Box>
                {herdrAgents.length === 0 ? (
                    <Text dimColor italic>
                        {isHerdrSessionActive()
                            ? 'Chưa có agent nào đang chạy trong Herdr session.'
                            : 'Herdr session không hoạt động (HERDR_ENV != 1).'}
                    </Text>
                ) : (
                    herdrAgents.map((a) => (
                        <Box key={a.pane_id || a.agent} gap={1}>
                            <Text bold color="cyan">
                                {a.name || a.pane_id}
                            </Text>
                            <Text color="gray">
                                ({a.agent} - {a.pane_id})
                            </Text>
                            <Text color={a.agent_status === 'idle' ? 'green' : a.agent_status === 'terminal' ? 'gray' : 'yellow'}>
                                [{a.agent_status === 'idle' ? '🟢 idle' : a.agent_status === 'terminal' ? '⚪ terminal' : '🟡 working'}]
                            </Text>
                            {a.cwd && <Text dimColor>cwd: {a.cwd}</Text>}
                        </Box>
                    ))
                )}
            </Box>

            <Box flexDirection="column" gap={1}>
                {settingItems.map((item, idx) => {
                    const isFocused = idx === focusIndex;
                    let valueDisplay = '';

                    if (item.id === 'clean_enabled') {
                        valueDisplay = config.cleanPolicy.enabled ? '[✓] Đang bật' : '[ ] Đang tắt';
                    } else if (item.id === 'clean_threshold') {
                        valueDisplay = `< ${config.cleanPolicy.thresholdCount} tasks > (dùng phím ←/→ để chỉnh)`;
                    } else if (item.id.startsWith('agent_')) {
                        const phase = item.id.replace('agent_', '') as keyof OnlyOneGlobalConfig['agentRouting'];
                        const route = normalizePhaseRoute(config.agentRouting[phase]);
                        const targetAgent = herdrAgents.find((a) => a.pane_id === route.pane);
                        const paneLabel = route.pane === 'auto' ? 'Auto (Mở mới)' : targetAgent?.name ? targetAgent.name : route.pane;
                        valueDisplay = `Agent: [ ${paneLabel} ] (←/→)  |  CLI: [ ${route.cli} ] (Space/Enter)`;
                    }

                    return (
                        <Box key={item.id} gap={2}>
                            <Text bold={isFocused} color={isFocused ? 'cyan' : 'white'}>
                                {isFocused ? '►' : ' '} {item.label}:
                            </Text>
                            <Text color={isFocused ? 'yellow' : 'gray'}>{valueDisplay}</Text>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};
