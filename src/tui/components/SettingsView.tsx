import { Box, Text, useInput } from 'ink';
import React, { FC, useState } from 'react';
import type { OnlyOneGlobalConfig } from '../types/config.js';

type SettingsViewProps = {
    initialConfig: OnlyOneGlobalConfig;
    onSave: (config: OnlyOneGlobalConfig) => void;
    onClose: () => void;
};

const AGENT_OPTIONS = ['antigravity', 'claude', 'codex', 'claudecode'];

export const SettingsView: FC<SettingsViewProps> = ({ initialConfig, onSave, onClose }) => {
    const [config, setConfig] = useState<OnlyOneGlobalConfig>(initialConfig);
    const [focusIndex, setFocusIndex] = useState(0);

    const settingItems = [
        { id: 'clean_enabled', label: 'Bật tự động dọn dẹp (Auto-Clean)' },
        { id: 'clean_threshold', label: 'Ngưỡng task hoàn thành (Threshold)' },
        { id: 'agent_concept', label: "Agent cho Phase 'concept'" },
        { id: 'agent_plan', label: "Agent cho Phase 'plan'" },
        { id: 'agent_apply', label: "Agent cho Phase 'apply'" },
        { id: 'agent_debug', label: "Agent cho Phase 'debug'" },
        { id: 'herdr_direction', label: 'Hướng chia màn hình Herdr (Split)' },
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
            const currentAgent = config.agentRouting[phase] || 'antigravity';
            const idx = AGENT_OPTIONS.indexOf(currentAgent);
            const nextIdx = (idx + 1) % AGENT_OPTIONS.length;
            setConfig((prev) => ({
                ...prev,
                agentRouting: { ...prev.agentRouting, [phase]: AGENT_OPTIONS[nextIdx] },
            }));
        } else if (currentItem === 'herdr_direction' && (input === ' ' || key.return)) {
            setConfig((prev) => ({
                ...prev,
                herdr: {
                    ...prev.herdr,
                    splitDirection: prev.herdr.splitDirection === 'right' ? 'down' : 'right',
                },
            }));
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
                        valueDisplay = `[ ${config.agentRouting[phase]} ] (Space/Enter để đổi)`;
                    } else if (item.id === 'herdr_direction') {
                        valueDisplay = `[ ${config.herdr.splitDirection.toUpperCase()} ] (Space để đổi)`;
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
