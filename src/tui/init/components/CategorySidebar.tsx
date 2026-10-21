import React, { FC } from 'react';
import { Box, Text } from 'ink';
import type { AssetCategory, WizardFocusArea } from '../types.js';

export type CategoryMeta = {
    id: AssetCategory;
    label: string;
};

export const ASSET_CATEGORIES: CategoryMeta[] = [
    { id: 'combo', label: 'Combos' },
    { id: 'skill', label: 'Skills' },
    { id: 'rule', label: 'Rules' },
    { id: 'package', label: 'Packages' },
    { id: 'config', label: 'Configs' },
    { id: 'mcp', label: 'MCPs' },
    { id: 'git', label: 'Git' },
    { id: 'vs', label: 'VS Code' },
    { id: 'ignore', label: 'Ignore' },
];

type CategorySidebarProps = {
    categories: CategoryMeta[];
    activeCategory: AssetCategory;
    focusArea: WizardFocusArea;
    counts: Record<AssetCategory, { selected: number; total: number }>;
};

export const CategorySidebar: FC<CategorySidebarProps> = ({ categories, activeCategory, focusArea, counts }) => {
    const isFocused = focusArea === 'sidebar';

    return (
        <Box flexDirection="column" width={24} borderStyle="round" borderColor={isFocused ? 'yellow' : 'gray'} paddingX={1}>
            <Box marginBottom={1}>
                <Text bold color="white">
                    ASSETS ({categories.length})
                </Text>
            </Box>
            {categories.map((cat, idx) => {
                const isActive = cat.id === activeCategory;
                const count = counts[cat.id] || { selected: 0, total: 0 };
                const prefix = isActive ? (isFocused ? '> ' : '● ') : '  ';
                const label = `${String(idx + 1).padStart(2, '0')}. ${cat.label.padEnd(8)} [${count.selected}/${count.total}]`;
                return (
                    <Text key={cat.id} color={isActive ? (isFocused ? 'yellow' : 'cyan') : 'white'} bold={isActive}>
                        {prefix}
                        {label}
                    </Text>
                );
            })}
        </Box>
    );
};
