import React, { FC, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { InitHeader } from './components/InitHeader.js';
import { ResourceList } from './components/ResourceList.js';
import { CategorySidebar, ASSET_CATEGORIES } from './components/CategorySidebar.js';
import { InitSummaryModal } from './components/InitSummaryModal.js';
import type { AssetCategory, IdeTargetOption, InitWizardResult, ResourceItem, WizardFocusArea } from './types.js';

type InitWizardAppProps = {
    initialResources: ResourceItem[];
    initialTools?: string[];
    onComplete: (result: InitWizardResult) => void;
};

const DEFAULT_IDES: IdeTargetOption[] = [
    { id: 'antigravity', label: 'Antigravity', selected: true },
    { id: 'cursor', label: 'Cursor', selected: false },
    { id: 'claude', label: 'Claude', selected: false },
    { id: 'codex', label: 'Codex', selected: false },
];

export const InitWizardApp: FC<InitWizardAppProps> = ({ initialResources, initialTools, onComplete }) => {
    const { exit } = useApp();
    const [resources, setResources] = useState<ResourceItem[]>(initialResources);
    const [ideOptions, setIdeOptions] = useState<IdeTargetOption[]>(() =>
        DEFAULT_IDES.map((ide) => ({
            ...ide,
            selected: initialTools ? initialTools.includes(ide.id) : ide.selected,
        })),
    );
    const [activeIdeIndex, setActiveIdeIndex] = useState(0);
    const [overwrite, setOverwrite] = useState(false);
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
    const [focusArea, setFocusArea] = useState<WizardFocusArea>('sidebar');
    const [cursorIndex, setCursorIndex] = useState(0);
    const [showSummary, setShowSummary] = useState(false);

    useInput((input, key) => {
        if (showSummary) {
            if (input === 'y' || key.return) {
                const selectedTools = ideOptions.filter((i) => i.selected).map((i) => i.id);
                const selectedRules: Record<string, string[]> = {};
                for (const tool of selectedTools) {
                    selectedRules[tool] = resources.filter((r) => r.category === 'rule' && r.selected).map((r) => r.name);
                }
                onComplete({
                    selectedTools,
                    overwrite,
                    selectedRules,
                    selectedSkills: resources.filter((r) => r.category === 'skill' && r.selected).map((r) => r.name),
                    selectedConfigs: resources.filter((r) => r.category === 'config' && r.selected).map((r) => r.name),
                    selectedPackages: resources.filter((r) => r.category === 'package' && r.selected).map((r) => r.name),
                    selectedCombos: resources.filter((r) => r.category === 'combo' && r.selected).map((r) => r.name),
                    selectedMcps: resources.filter((r) => r.category === 'mcp' && r.selected).map((r) => r.name),
                    selectedGit: resources.filter((r) => r.category === 'git' && r.selected).map((r) => r.name),
                    selectedVs: resources.filter((r) => r.category === 'vs' && r.selected).map((r) => r.name),
                    selectedIgnore: resources.filter((r) => r.category === 'ignore' && r.selected).map((r) => r.name),
                    confirmed: true,
                });
                exit();
            } else if (input === 'n' || key.escape) {
                setShowSummary(false);
            }
            return;
        }

        if (input === 'q' || (key.ctrl && input === 'c')) {
            onComplete({
                selectedTools: [],
                overwrite: false,
                selectedRules: {},
                selectedSkills: [],
                selectedConfigs: [],
                selectedPackages: [],
                confirmed: false,
            });
            exit();
            return;
        }

        if (key.tab) {
            setFocusArea((prev) =>
                prev === 'header-ide'
                    ? 'header-overwrite'
                    : prev === 'header-overwrite'
                      ? 'sidebar'
                      : prev === 'sidebar'
                        ? 'content'
                        : 'header-ide',
            );
            return;
        }

        if (focusArea === 'header-ide') {
            if (key.leftArrow) {
                setActiveIdeIndex((prev) => (prev > 0 ? prev - 1 : ideOptions.length - 1));
            } else if (key.rightArrow) {
                setActiveIdeIndex((prev) => (prev < ideOptions.length - 1 ? prev + 1 : 0));
            } else if (input === ' ' || key.return) {
                setIdeOptions((prev) => prev.map((opt, idx) => (idx === activeIdeIndex ? { ...opt, selected: !opt.selected } : opt)));
            }
        } else if (focusArea === 'header-overwrite') {
            if (key.leftArrow || key.rightArrow || input === ' ' || key.return) {
                setOverwrite((prev) => !prev);
            }
        } else if (focusArea === 'sidebar') {
            if (key.upArrow) {
                setActiveCategoryIndex((prev) => (prev > 0 ? prev - 1 : ASSET_CATEGORIES.length - 1));
                setCursorIndex(0);
            } else if (key.downArrow) {
                setActiveCategoryIndex((prev) => (prev < ASSET_CATEGORIES.length - 1 ? prev + 1 : 0));
                setCursorIndex(0);
            } else if (key.rightArrow || key.return) {
                setFocusArea('content');
            }
        } else if (focusArea === 'content') {
            const currentCategory = ASSET_CATEGORIES[activeCategoryIndex].id;
            const currentItems = resources.filter((r) => r.category === currentCategory);
            if (key.leftArrow) {
                setFocusArea('sidebar');
            } else if (key.upArrow) {
                setCursorIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, currentItems.length - 1)));
            } else if (key.downArrow) {
                setCursorIndex((prev) => (prev < currentItems.length - 1 ? prev + 1 : 0));
            } else if (input === ' ') {
                if (currentItems[cursorIndex]) {
                    const targetId = currentItems[cursorIndex].id;
                    setResources((prev) => prev.map((item) => (item.id === targetId ? { ...item, selected: !item.selected } : item)));
                }
            } else if (key.return) {
                setShowSummary(true);
            }
        }
    });

    const activeCategory = ASSET_CATEGORIES[activeCategoryIndex].id;
    const categoryCounts = ASSET_CATEGORIES.reduce(
        (acc, cat) => {
            const catItems = resources.filter((r) => r.category === cat.id);
            acc[cat.id] = {
                selected: catItems.filter((r) => r.selected).length,
                total: catItems.length,
            };
            return acc;
        },
        {} as Record<AssetCategory, { selected: number; total: number }>,
    );

    return (
        <Box flexDirection="column" padding={1}>
            <InitHeader ideOptions={ideOptions} activeIdeIndex={activeIdeIndex} overwrite={overwrite} focusArea={focusArea} />

            <Box flexDirection="row">
                <CategorySidebar
                    categories={ASSET_CATEGORIES}
                    activeCategory={activeCategory}
                    focusArea={focusArea}
                    counts={categoryCounts}
                />
                <ResourceList category={activeCategory} resources={resources} cursorIndex={cursorIndex} focusArea={focusArea} />
            </Box>

            {showSummary && (
                <InitSummaryModal
                    resources={resources}
                    selectedTools={ideOptions.filter((i) => i.selected).map((i) => i.id)}
                    overwrite={overwrite}
                />
            )}

            <Box marginTop={1}>
                <Text dimColor>[Tab] Switch Pane | [←/→] IDE / Pane | [↑/↓] Navigate | [Space] Toggle | [Enter] Apply | [q] Quit</Text>
            </Box>
        </Box>
    );
};
