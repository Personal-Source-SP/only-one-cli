export type InitCategory = 'package' | 'config' | 'mcp' | 'skill' | 'workflow' | 'plugin' | 'rule' | 'gitignore';

export type ItemOrigin = 'selected' | 'auto-required';

export type ItemState = 'new' | 'existing' | 'action-only';

export interface PlannedItem {
    /** Unique immutable key for the planned item e.g. "skill:antigravity:grill-me" */
    key: string;
    category: InitCategory;
    name: string;
    target?: string;
    destination?: string;
    origin: ItemOrigin;
    state: ItemState;
    /** Human-readable reason if auto-required by dependency */
    reason?: string;
    /** Extra metadata specific to category */
    meta?: Record<string, any>;
}

export interface InitPlan {
    projectDir: string;
    selectedTools: string[];
    items: PlannedItem[];
}

export type ExecutionStatus = 'installed' | 'overwritten' | 'action-required' | 'skipped' | 'failed';

export interface ExecutedItemResult {
    item: PlannedItem;
    status: ExecutionStatus;
    error?: string;
    details?: string;
}

export interface InitResult {
    plan: InitPlan;
    results: ExecutedItemResult[];
    summary: {
        installedCount: number;
        overwrittenCount: number;
        actionRequiredCount: number;
        skippedCount: number;
        failedCount: number;
    };
}
