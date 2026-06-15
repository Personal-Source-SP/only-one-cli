import type { Fetcher } from './types.js';

export abstract class BaseApiClient {
    constructor(
        protected readonly baseUrl: string,
        protected readonly apiKey?: string,
        protected readonly fetcher: Fetcher = fetch,
    ) {}

    protected async requestJson<T>(path: string, init: RequestInit): Promise<T> {
        const response = await this.fetcher(`${this.baseUrl}${path}`, init);
        if (!response.ok) {
            throw new Error(await this.formatError(response));
        }
        return response.json() as Promise<T>;
    }

    protected async requestText(path: string, init: RequestInit): Promise<string> {
        const response = await this.fetcher(`${this.baseUrl}${path}`, init);
        if (!response.ok) {
            throw new Error(await this.formatError(response));
        }
        return response.text();
    }

    protected formatHeaders(options: { json?: boolean } = {}): Record<string, string> {
        const headers: Record<string, string> = {};
        if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;
        if (options.json) headers['Content-Type'] = 'application/json';
        return headers;
    }

    protected parseSseLines(payload: string): string[] {
        return payload
            .split(/\r?\n/)
            .filter((line) => line.startsWith('data:'))
            .map((line) => line.slice('data:'.length).trim())
            .map((raw) => {
                try {
                    const event = JSON.parse(raw) as { line?: unknown };
                    return typeof event.line === 'string' ? event.line : raw;
                } catch {
                    return raw;
                }
            });
    }

    private async formatError(response: Response): Promise<string> {
        const body = await response.text().catch(() => '');
        if (!body) return `API request failed with ${response.status}`;

        try {
            const parsed = JSON.parse(body) as { error?: { code?: unknown; message?: unknown } };
            const code = typeof parsed.error?.code === 'string' ? parsed.error.code : undefined;
            const message = typeof parsed.error?.message === 'string' ? parsed.error.message : undefined;
            if (code && message) return `${code}: ${message}`;
            if (message) return message;
        } catch {
            return body;
        }

        return body;
    }
}
