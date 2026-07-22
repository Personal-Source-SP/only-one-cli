import type { PromptDeps } from '@/cli/deps.js';

export type TargetChoice<T extends string> = {
    name: string;
    value: T;
};

export type TargetSelectionRequest<T extends string> = {
    choices: readonly TargetChoice<T>[];
    message: string;
    automatic: boolean;
    emptyMessage?: string;
    explicit?: string;
    preselected?: readonly T[];
    prompts?: Pick<PromptDeps, 'checkbox'>;
};

const parseCsv = (value: string): string[] => [
    ...new Set(
        value
            .split(',')
            .map((entry) => entry.trim().toLowerCase())
            .filter(Boolean),
    ),
];

const getValidIds = <T extends string>(choices: readonly TargetChoice<T>[]): string => choices.map((choice) => choice.value).join(', ');

const resolveExplicit = <T extends string>(choices: readonly TargetChoice<T>[], explicit: string): T[] => {
    const values = parseCsv(explicit);
    if (values.includes('all')) return choices.map((choice) => choice.value);

    const validValues = new Set(choices.map((choice) => choice.value));
    const invalid = values.filter((value) => !validValues.has(value as T));
    if (invalid.length) throw new Error(`Unsupported target '${invalid[0]}'. Valid targets: ${getValidIds(choices)}`);

    return values as T[];
};

export const selectTargets = async <T extends string>(request: TargetSelectionRequest<T>): Promise<T[]> => {
    const { choices, explicit, preselected = [] } = request;
    if (!choices.length) throw new Error('No supported targets are available');
    if (explicit?.trim()) return resolveExplicit(choices, explicit);
    if (request.automatic || !request.prompts?.checkbox) return choices.map((choice) => choice.value);

    const selected = await request.prompts.checkbox({
        message: request.message,
        choices: choices.map((choice) => ({ ...choice, checked: preselected.includes(choice.value) })),
    });
    if (!selected.length) throw new Error(request.emptyMessage ?? 'Select at least one target');
    return [...new Set(selected)];
};
