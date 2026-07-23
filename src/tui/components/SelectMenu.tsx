import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

export interface MenuItem {
    label: string;
    value: string;
    description?: string;
    icon?: string;
}

interface SelectMenuProps {
    items: MenuItem[];
    onSelect: (item: MenuItem) => void;
}

export const SelectMenu: React.FC<SelectMenuProps> = ({ items, onSelect }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useInput((input, key) => {
        if (key.upArrow) {
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        } else if (key.downArrow) {
            setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        } else if (key.return) {
            if (items[selectedIndex]) {
                onSelect(items[selectedIndex]);
            }
        }
    });

    return (
        <Box flexDirection="column" marginY={1}>
            {items.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                    <Box key={item.value} flexDirection="column" marginY={0}>
                        <Box>
                            <Text color={isSelected ? 'green' : 'gray'}>{isSelected ? '❯ ' : '  '}</Text>
                            <Text bold={isSelected} color={isSelected ? 'green' : 'white'}>
                                {item.icon ? `${item.icon} ` : ''}
                                {item.label}
                            </Text>
                        </Box>
                        {isSelected && item.description && (
                            <Box marginLeft={4}>
                                <Text color="gray" italic>
                                    {item.description}
                                </Text>
                            </Box>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
};
