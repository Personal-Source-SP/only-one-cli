import { Box, Text, useInput } from 'ink';
import React, { FC, useEffect, useState } from 'react';
import { listHerdrAgents } from '../services/herdrService.js';
import type { HerdrAgent, TaskModel } from '../types/task.js';

interface AgentSelectorModalProps {
    task: TaskModel;
    onConfirm: (selectedTargets: string[]) => void;
    onCancel: () => void;
}

export const AgentSelectorModal: FC<AgentSelectorModalProps> = ({ task, onConfirm, onCancel }) => {
    const [agents, setAgents] = useState<HerdrAgent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [focusIndex, setFocusIndex] = useState<number>(0);
    const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());

    useEffect(() => {
        listHerdrAgents().then((list) => {
            setAgents(list);
            setLoading(false);
        });
    }, []);

    useInput((input, key) => {
        if (key.escape) {
            onCancel();
            return;
        }

        if (key.upArrow && agents.length > 0) {
            setFocusIndex((prev) => Math.max(0, prev - 1));
            return;
        }

        if (key.downArrow && agents.length > 0) {
            setFocusIndex((prev) => Math.min(agents.length - 1, prev + 1));
            return;
        }

        if (input === ' ' && agents[focusIndex]) {
            const target = agents[focusIndex].pane_id || agents[focusIndex].agent;
            setSelectedTargets((prev) => {
                const next = new Set(prev);
                if (next.has(target)) next.delete(target);
                else next.add(target);
                return next;
            });
            return;
        }

        if (key.return) {
            if (selectedTargets.size > 0) {
                onConfirm(Array.from(selectedTargets));
            } else if (agents[focusIndex]) {
                const target = agents[focusIndex].pane_id || agents[focusIndex].agent;
                onConfirm([target]);
            }
        }
    });

    return (
        <Box flexDirection="column" borderStyle="double" borderColor="cyan" padding={1} marginY={1}>
            <Box marginBottom={1} justifyContent="space-between">
                <Text bold color="cyan">
                    🤖 CHỌN AGENT TỪ HERDR CHO: <Text color="yellow">{task.slug}</Text> ({task.status})
                </Text>
                <Text dimColor>Đã chọn: {selectedTargets.size} agent(s)</Text>
            </Box>

            {loading ? (
                <Text color="yellow">Đang tải danh sách agent từ Herdr...</Text>
            ) : agents.length === 0 ? (
                <Text color="red">Không tìm thấy agent nào đang chạy trong Herdr. Hãy khởi động agent qua herdr pane split.</Text>
            ) : (
                agents.map((agent, idx) => {
                    const target = agent.pane_id || agent.agent;
                    const isChecked = selectedTargets.has(target);
                    const isFocused = idx === focusIndex;
                    const isIdle = agent.agent_status === 'idle';
                    const statusBadge = isIdle ? '🟢 idle (rảnh)' : '🟡 working (đang bận - sẽ xếp hàng)';

                    return (
                        <Box key={target} paddingLeft={1} backgroundColor={isFocused ? 'gray' : undefined}>
                            <Text color={isFocused ? 'black' : isChecked ? 'green' : 'white'} bold={isChecked}>
                                [{isChecked ? 'x' : ' '}] {agent.pane_id} ({agent.agent}) - {statusBadge}
                            </Text>
                        </Box>
                    );
                })
            )}
        </Box>
    );
};
