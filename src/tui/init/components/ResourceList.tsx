import React, { FC } from 'react';
import { Box, Text } from 'ink';
import type { ResourceItem, WizardFocusArea } from '../types.js';

type ResourceListProps = {
    resources: ResourceItem[];
    cursorIndex: number;
    focusArea: WizardFocusArea;
    viewportSize?: number;
};

export const ResourceList: FC<ResourceListProps> = ({ resources, cursorIndex, focusArea, viewportSize = 12 }) => {
    const half = Math.floor(viewportSize / 2);
    let start = Math.max(0, cursorIndex - half);
    let end = Math.min(resources.length, start + viewportSize);

    if (end - start < viewportSize) {
        start = Math.max(0, end - viewportSize);
    }

    const visibleItems = resources.slice(start, end);

    return (
        <Box flexDirection="column" borderStyle="round" borderColor={focusArea === 'list' ? 'yellow' : 'gray'} paddingX={1}>
            <Box justifyContent="space-between" marginBottom={1}>
                <Text bold color="white">
                    RESOURCES SELECTION ({resources.filter((r) => r.selected).length}/{resources.length} selected)
                </Text>
                <Text dimColor>
                    Items {start + 1}-{end} of {resources.length}
                </Text>
            </Box>

            {visibleItems.map((item, relIdx) => {
                const absIdx = start + relIdx;
                const isSelected = absIdx === cursorIndex;
                const isFocused = focusArea === 'list';

                let statusLabel = '(not installed)';
                let statusColor = 'gray';
                if (item.isInstalled && item.selected) {
                    statusLabel = '[✓] installed';
                    statusColor = 'green';
                } else if (!item.isInstalled && item.selected) {
                    statusLabel = '[+] will install';
                    statusColor = 'cyan';
                } else if (item.isInstalled && !item.selected) {
                    statusLabel = '[-] will prune';
                    statusColor = 'red';
                }

                return (
                    <Box key={item.id} justifyContent="space-between">
                        <Box>
                            <Text color={isSelected && isFocused ? 'yellow' : 'white'} bold={isSelected && isFocused}>
                                {isSelected && isFocused ? '> ' : '  '}[{item.selected ? 'x' : ' '}] {item.category.padEnd(7)} {item.name}
                            </Text>
                        </Box>
                        <Text color={statusColor as any}>{statusLabel}</Text>
                    </Box>
                );
            })}
        </Box>
    );
};
