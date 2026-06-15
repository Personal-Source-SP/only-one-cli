export interface IndexVersionRow {
    commitSha: string;
    createdAt: string;
    createdBy: string;
    indexVersionId: string;
    isLatest: boolean;
    projectId: string;
    projectName: string;
    tags: string[];
}

export interface BulkDryRunEntry {
    name: string;
    path: string;
    tags: string[];
    skip: boolean;
    excluded?: boolean;
}

export interface BulkSummaryStats {
    indexed: number;
    skipped: number;
    excluded: number;
    failed: number;
}
