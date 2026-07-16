const stripJsonComments = (input: string): string => {
    let output = '';
    let inString = false;
    let escaped = false;

    for (let index = 0; index < input.length; index += 1) {
        const current = input[index];
        const next = input[index + 1];

        if (inString) {
            output += current;
            escaped = current === '\\' && !escaped;
            if (current === '"' && !escaped) inString = false;
            if (current !== '\\') escaped = false;
            continue;
        }

        if (current === '"') {
            inString = true;
            output += current;
            continue;
        }

        if (current === '/' && next === '/') {
            while (index < input.length && input[index] !== '\n') index += 1;
            output += '\n';
            continue;
        }

        if (current === '/' && next === '*') {
            index += 2;
            while (index < input.length && !(input[index] === '*' && input[index + 1] === '/')) index += 1;
            index += 1;
            continue;
        }

        output += current;
    }

    return output;
};

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const parseJsoncObject = (content: string): Record<string, unknown> => {
    const parsed = JSON.parse(stripJsonComments(content)) as unknown;
    if (!isRecord(parsed)) throw new Error('Expected JSON object');
    return parsed;
};

export const mergeSettings = (target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = { ...target };

    for (const [key, sourceValue] of Object.entries(source)) {
        const targetValue = result[key];
        result[key] = isRecord(targetValue) && isRecord(sourceValue) ? mergeSettings(targetValue, sourceValue) : sourceValue;
    }

    return result;
};

export const stringifySettings = (value: Record<string, unknown>): string => `${JSON.stringify(value, null, 2)}\n`;
