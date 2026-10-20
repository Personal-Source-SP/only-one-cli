import React, { FC } from 'react';
import { Box, Text } from 'ink';
import type { AssetCategory, ResourceItem, WizardFocusArea } from '../types.js';

type ResourceListProps = {
    category: AssetCategory;
    resources: ResourceItem[];
    cursorIndex: number;
    focusArea: WizardFocusArea;
    viewportSize?: number;
};

export const ResourceList: FC<ResourceListProps> = ({ category, resources, cursorIndex, focusArea, viewportSize = 10 }) => {
    const categoryItems = resources.filter((r) => r.category === category);
    const half = Math.floor(viewportSize / 2);
    let start = Math.max(0, cursorIndex - half);
    let end = Math.min(categoryItems.length, start + viewportSize);

    if (end - start < viewportSize) {
        start = Math.max(0, end - viewportSize);
    }

    const visibleItems = categoryItems.slice(start, end);
    const isFocused = focusArea === 'content';

    return (
        <Box flexDirection="column" flexGrow={1} borderStyle="round" borderColor={isFocused ? 'yellow' : 'gray'} paddingX={1}>
            <Box justifyContent="space-between" marginBottom={1}>
                <Text bold color="white">
                    ITEMS: {category.toUpperCase()} ({categoryItems.filter((r) => r.selected).length}/{categoryItems.length} selected)
                </Text>
                <Text dimColor>{categoryItems.length > 0 ? `Items ${start + 1}-${end} of ${categoryItems.length}` : 'Empty'}</Text>
            </Box>

            {categoryItems.length === 0 && (
                <Box paddingY={2} justifyContent="center">
                    <Text dimColor>No items available in this category.</Text>
                </Box>
            )}

            {visibleItems.map((item, relIdx) => {
                const absIdx = start + relIdx;
                const isSelected = absIdx === cursorIndex;

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
                                {isSelected && isFocused ? '> ' : '  '}[{item.selected ? 'x' : ' '}] {item.name}
                            </Text>
                        </Box>
                        <Text color={statusColor as any}>{statusLabel}</Text>
                    </Box>
                );
            })}
        </Box>
    );
};
