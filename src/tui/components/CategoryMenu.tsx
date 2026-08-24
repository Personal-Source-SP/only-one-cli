import React, { FC, useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { CategoryGroup } from '../router/routes.js';
import type { RouteItem } from '../router/types.js';

interface CategoryMenuProps {
    categories: CategoryGroup[];
    selectedItem: RouteItem;
    onHighlight: (item: RouteItem) => void;
    onSelect: (item: RouteItem) => void;
    isActive: boolean;
}

export const CategoryMenu: FC<CategoryMenuProps> = ({ categories, selectedItem, onHighlight, onSelect, isActive }) => {
    const allItems = categories.flatMap((c) => c.items);
    const currentIndex = Math.max(
        0,
        allItems.findIndex((item) => item.id === selectedItem?.id),
    );

    const [cursorIndex, setCursorIndex] = useState(currentIndex);

    useEffect(() => {
        const idx = allItems.findIndex((item) => item.id === selectedItem?.id);
        if (idx >= 0 && idx !== cursorIndex) {
            setCursorIndex(idx);
        }
    }, [selectedItem, allItems.length]);

    useInput(
        (input, key) => {
            if (!isActive || allItems.length === 0) return;

            if (key.upArrow) {
                const nextIndex = cursorIndex > 0 ? cursorIndex - 1 : allItems.length - 1;
                setCursorIndex(nextIndex);
                const nextItem = allItems[nextIndex];
                if (nextItem) onHighlight(nextItem);
            } else if (key.downArrow) {
                const nextIndex = cursorIndex < allItems.length - 1 ? cursorIndex + 1 : 0;
                setCursorIndex(nextIndex);
                const nextItem = allItems[nextIndex];
                if (nextItem) onHighlight(nextItem);
            } else if (key.return) {
                const current = allItems[cursorIndex];
                if (current) {
                    onSelect(current);
                }
            }
        },
        { isActive },
    );

    if (allItems.length === 0) {
        return (
            <Box marginY={1}>
                <Text color="gray" italic>
                    No matching actions found.
                </Text>
            </Box>
        );
    }

    return (
        <Box flexDirection="column">
            {categories.map((category) => {
                if (category.items.length === 0) return null;

                return (
                    <Box key={category.id} flexDirection="column" marginY={0}>
                        <Box marginTop={0} marginBottom={0}>
                            <Text bold color="yellow">
                                {category.icon} {category.name.toUpperCase()}
                            </Text>
                        </Box>
                        {category.items.map((item) => {
                            const isSelected = item.id === allItems[cursorIndex]?.id;

                            return (
                                <Box key={item.id} marginLeft={1}>
                                    <Text color={isSelected ? 'green' : 'gray'}>{isSelected ? '❯ ' : '  '}</Text>
                                    <Text bold={isSelected} color={isSelected ? 'green' : 'white'}>
                                        {item.icon} {item.label}
                                    </Text>
                                </Box>
                            );
                        })}
                    </Box>
                );
            })}
        </Box>
    );
};
