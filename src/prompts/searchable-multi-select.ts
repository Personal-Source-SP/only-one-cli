/**
 * Ported from open-spec-source/src/prompts/searchable-multi-select.ts
 * (chalk removed — plain terminal output)
 */

import { COLORS } from '@/constants/index.js';

interface Choice {
    configured?: boolean;
    detected?: boolean;
    name: string;
    preSelected?: boolean;
    value: string;
}

interface Config {
    choices: Choice[];
    message: string;
    pageSize?: number;
    validate?: (selected: string[]) => boolean | string;
}

async function createSearchableMultiSelect(): Promise<(config: Config) => Promise<string[]>> {
    const { createPrompt, useState, useKeypress, useMemo, usePrefix, isEnterKey, isBackspaceKey, isUpKey, isDownKey } =
        await import('@inquirer/core');

    return createPrompt((config: Config, done: (value: string[]) => void): string => {
        const { choices, message, pageSize = 15, validate } = config;

        const [searchText, setSearchText] = useState('');
        const [selectedValues, setSelectedValues] = useState<string[]>(() => choices.filter((c) => c.preSelected).map((c) => c.value));
        const [cursor, setCursor] = useState(0);
        const [status, setStatus] = useState<'done' | 'idle'>('idle');
        const [error, setError] = useState<string | null>(null);

        const prefix = usePrefix({ status });

        const filteredChoices = useMemo(() => {
            if (!searchText.trim()) {
                return choices;
            }
            const term = searchText.toLowerCase();
            return choices.filter((c) => c.name.toLowerCase().includes(term) || c.value.toLowerCase().includes(term));
        }, [searchText, choices]);

        const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);
        const choiceMap = useMemo(() => new Map(choices.map((c) => [c.value, c])), [choices]);

        useKeypress((key) => {
            if (status === 'done') {
                return;
            }

            if (isEnterKey(key)) {
                if (validate) {
                    const result = validate(selectedValues);
                    if (result !== true) {
                        setError(typeof result === 'string' ? result : 'Invalid');
                        return;
                    }
                }
                setStatus('done');
                done(selectedValues);
                return;
            }

            if (key.name === 'space') {
                const choice = filteredChoices[cursor];
                if (choice) {
                    if (selectedSet.has(choice.value)) {
                        setSelectedValues(selectedValues.filter((v) => v !== choice.value));
                    } else {
                        setSelectedValues([...selectedValues, choice.value]);
                    }
                }
                return;
            }

            if (isBackspaceKey(key)) {
                if (searchText === '' && selectedValues.length > 0) {
                    setSelectedValues(selectedValues.slice(0, -1));
                } else {
                    setSearchText(searchText.slice(0, -1));
                    setCursor(0);
                }
                return;
            }

            if (isUpKey(key)) {
                setCursor(Math.max(0, cursor - 1));
                return;
            }
            if (isDownKey(key)) {
                setCursor(Math.min(filteredChoices.length - 1, cursor + 1));
                return;
            }

            if (key.name && key.name.length === 1 && !key.ctrl) {
                setSearchText(searchText + key.name);
                setCursor(0);
            }
        });

        if (status === 'done') {
            const names = selectedValues.map((v) => choiceMap.get(v)?.name ?? v).join(', ');
            return `${prefix} ${message} ${COLORS.success(names || '(none)')}`;
        }

        const lines: string[] = [];
        lines.push(`${prefix} ${message}`);
        const chips =
            selectedValues.length > 0
                ? selectedValues.map((v) => COLORS.success(`[${choiceMap.get(v)?.name ?? v}]`)).join(' ')
                : COLORS.dim('(none selected)');
        lines.push(`  ${COLORS.primary('Selected:')} ${chips}`);
        lines.push(`  ${COLORS.primary('Search:')} ${COLORS.cli.accent(`[${searchText || 'type to filter'}]`)}`);
        lines.push(COLORS.dim(`  ↑↓ navigate • Space toggle • Backspace remove • Enter confirm`));

        if (!filteredChoices.length) {
            lines.push(COLORS.dim('  No matches'));
        } else {
            const startIndex = Math.max(0, Math.min(cursor - Math.floor(pageSize / 2), filteredChoices.length - pageSize));
            const endIndex = Math.min(startIndex + pageSize, filteredChoices.length);
            const visibleChoices = filteredChoices.slice(startIndex, endIndex);

            for (let i = 0; i < visibleChoices.length; i++) {
                const item = visibleChoices[i];
                const actualIndex = startIndex + i;
                const isActive = actualIndex === cursor;
                const selected = selectedSet.has(item.value);
                const itemColor = isActive ? COLORS.primary : selected ? COLORS.success : COLORS.dim;
                const iconColor = selected ? COLORS.success : COLORS.dim;
                const icon = selected ? iconColor('◉') : iconColor('○');
                const arrow = isActive ? COLORS.cli.accent('›') : ' ';
                const statusLabel = !selected ? (item.configured ? ' (configured)' : item.detected ? ' (detected)' : '') : '';
                const suffix = selected ? (item.configured ? ' (refresh)' : ' (selected)') : statusLabel;
                lines.push(`  ${arrow} ${icon} ${itemColor(item.name)}${COLORS.dim(suffix)}`);
            }
        }

        if (error) {
            lines.push(`  ${COLORS.error(error)}`);
        }
        return lines.join('\n');
    });
}

export const searchableMultiSelect = async (config: Config): Promise<string[]> => {
    const prompt = await createSearchableMultiSelect();
    return prompt(config);
};
