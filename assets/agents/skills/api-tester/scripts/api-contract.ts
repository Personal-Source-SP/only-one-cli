import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

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

export function calculateLatencyMetrics(latencies: number[]): { p50: number; p95: number } {
    if (latencies.length === 0) return { p50: 0, p95: 0 };
    const sorted = [...latencies].sort((a, b) => a - b);
    const p50Idx = Math.floor(sorted.length * 0.5);
    const p95Idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
    return {
        p50: Math.round(sorted[p50Idx]),
        p95: Math.round(sorted[p95Idx]),
    };
}

export function saveApiEvidence(taskSlug: string, endpointName: string, payload: any, baseDir = process.cwd()): string {
    const safeEndpoint = endpointName.replace(/[^a-z0-9_-]/gi, '_');
    const targetDir = join(baseDir, 'only-one/tasks', taskSlug, 'evidence/api');
    mkdirSync(targetDir, { recursive: true });
    const filePath = join(targetDir, `${safeEndpoint}.json`);
    writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    const normalizedPath = resolve(filePath).replace(/\\/g, '/');
    return `file:///${normalizedPath.replace(/^\//, '')}`;
}
