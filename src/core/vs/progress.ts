import type { VsProgressReporter } from './types.js';

export class PercentProgressReporter implements VsProgressReporter {
    private done = 0;
    private last = -1;
    private total = 1;

    public constructor(private readonly write: (line: string) => void) {}

    public start(total: number, label: string): void {
        this.done = 0;
        this.last = -1;
        this.total = Math.max(1, total);
        this.emit(0, label);
    }

    public step(label: string): void {
        this.done += 1;
        this.emit(Math.floor((this.done / this.total) * 100), label);
    }

    public rollback(label: string): void {
        this.write(`Rollback: ${label}`);
    }

    private emit(percent: number, label: string): void {
        const next = Math.max(this.last, Math.min(100, percent));
        if (next === this.last && next !== 100) return;
        this.last = next;
        this.write(`✓ ${label}`);
    }
}
