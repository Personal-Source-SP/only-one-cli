export interface ConcurrencyScriptOptions {
    url: string;
    concurrency: number;
    method?: string;
    payload?: Record<string, any>;
    headers?: Record<string, string>;
}

export function buildConcurrencyScript(options: ConcurrencyScriptOptions): string {
    const { url, concurrency, method = 'GET', payload, headers = {} } = options;
    const payloadStr = payload ? JSON.stringify(payload) : 'null';
    const headersStr = JSON.stringify(headers);

    return `
const promises = Array.from({ length: ${concurrency} }).map(() =>
    fetch('${url}', {
        method: '${method}',
        headers: Object.assign({ 'Content-Type': 'application/json' }, ${headersStr}),
        body: ${method !== 'GET' ? payloadStr : 'undefined'}
    }).then(res => res.status)
);
Promise.all(promises).then(statuses => console.log(JSON.stringify(statuses)));
`.trim();
}

export interface ApiDigestValidationResult {
    valid: boolean;
    errors: string[];
}

export function validateApiDigest(content: string): ApiDigestValidationResult {
    const errors: string[] = [];

    if (!/status:\s*(?:pass|fail)/i.test(content)) {
        errors.push('Missing Status in API Digest');
    }

    const jsonBlockRegex = /```(?:json)?\s*[\r\n]+([\s\S]*?)```/g;
    let match: RegExpExecArray | null;
    while ((match = jsonBlockRegex.exec(content)) !== null) {
        const lines = match[1].split(/\r?\n/).filter((l) => l.trim().length > 0).length;
        if (lines > 20) {
            errors.push('Excessive JSON echo (> 20 lines) detected in API Digest');
            break;
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

