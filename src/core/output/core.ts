import type { BulkDryRunEntry, BulkSummaryStats, IndexVersionRow } from './types.js';

const padCell = (value: string, width: number): string => {
    if (value.length >= width) {
        return value.slice(0, width);
    }
    return value.padEnd(width);
};

export const printIndexVersions = (entries: IndexVersionRow[], write: (line: string) => void): void => {
    if (!entries?.length) {
        write('No uploaded index versions found.');
        return;
    }

    write(
        [
            padCell('PROJECT', 14),
            padCell('NAME', 18),
            padCell('VERSION', 10),
            padCell('COMMIT', 10),
            padCell('CREATED', 24),
            padCell('BY', 14),
            padCell('TAGS', 16),
            'LATEST',
        ].join(' '),
    );

    for (const entry of entries) {
        write(
            [
                padCell(entry.projectId, 14),
                padCell(entry.projectName, 18),
                padCell(entry.indexVersionId.slice(0, 8), 10),
                padCell(entry.commitSha.slice(0, 8), 10),
                padCell(entry.createdAt, 24),
                padCell(entry.createdBy, 14),
                padCell(entry.tags.length ? entry.tags.join(',') : '-', 16),
                entry.isLatest ? 'yes' : 'no',
            ].join(' '),
        );
    }
};

export const printJson = (value: unknown, write: (line: string) => void): void => {
    write(JSON.stringify(value, null, 2));
};

export const printProjects = (value: unknown, write: (line: string) => void): void => {
    const projects = Array.isArray(value) ? value : [];
    if (!projects.length) {
        write('No projects found.');
        return;
    }

    for (const project of projects as Array<Record<string, unknown>>) {
        write(`${project.id ?? '-'}  ${project.name ?? '-'}  ${project.status ?? '-'}`);
    }
};

export const printProjectStatus = (value: unknown, write: (line: string) => void): void => {
    const project = value as Record<string, unknown>;
    write(`Project: ${project.name ?? project.id ?? '-'}`);
    write(`Status: ${project.status ?? '-'}`);
    write(`Files: ${project.fileCount ?? project.file_count ?? 0}`);
    const indexingJob = project.indexingJob as Record<string, unknown> | undefined;
    if (indexingJob?.id) {
        write(`Indexing job: ${indexingJob.id}`);
    }
    if (project.lastIndexedAt ?? project.last_indexed_at) {
        write(`Last indexed: ${project.lastIndexedAt ?? project.last_indexed_at}`);
    }
};

export const printJobs = (value: unknown, write: (line: string) => void): void => {
    const jobs = Array.isArray(value) ? value : value && typeof value === 'object' ? [value] : [];
    if (!jobs.length) {
        write('No jobs found.');
        return;
    }

    for (const job of jobs as Array<Record<string, unknown>>) {
        write(
            `${job.id ?? '-'}  ${job.projectId ?? job.project_id ?? '-'}  ${job.kind ?? '-'}  ${job.status ?? '-'}  ${job.progress ?? 0}%`,
        );
    }
};

export const printSearchResults = (value: unknown, write: (line: string) => void, query = ''): void => {
    const response = value as {
        results?: Array<Record<string, unknown>>;
        total?: number;
        structural?: {
            processes?: Array<Record<string, unknown>>;
            error?: { code: string; message: string };
        };
    };
    const results = response.results ?? [];
    if (!results.length) {
        write(query ? `No results for "${query}".` : 'No results found.');
    } else {
        for (const result of results) {
            const filePath = String(result.filePath ?? result.file_path ?? '-');
            const startLine = result.startLine ?? result.start_line ?? '-';
            const projectName = String(result.projectName ?? result.project_name ?? '-');
            const language = String(result.language ?? '-');
            const score = formatScore(result.score);
            write(`${filePath}:${startLine}`);
            write(`Score: ${score}  ${projectName} — ${language}`);
            write(String(result.content ?? '').slice(0, 520));
            write('');
        }
    }

    printStructuralSearch(response.structural, write);
};

export const printStructuralError = (error: { code: string; message: string }, write: (line: string) => void): void => {
    write(`Structural error: ${error.code}`);
    write(error.message);
};

export const hasQueryBodyError = (value: unknown): boolean => {
    const payload = value as { error?: { code?: string; message?: string } };
    return Boolean(payload.error?.code && payload.error?.message);
};

export const printImpact = (value: unknown, write: (line: string) => void): void => {
    const impact = value as {
        target?: { id?: string; name?: string; type?: string; filePath?: string };
        risk?: string;
        impactedCount?: number;
        summary?: { direct?: number; processes_affected?: number; modules_affected?: number };
        affected_processes?: Array<{
            name?: string;
            type?: string;
            filePath?: string;
            affected_process_count?: number;
            total_hits?: number;
            earliest_broken_step?: number;
        }>;
        affected_modules?: Array<{ name?: string; hits?: number; impact?: string }>;
        byDepth?: Record<
            string,
            Array<{ depth?: number; id?: string; name?: string; filePath?: string; relationType?: string; confidence?: number }>
        >;
        error?: { code: string; message: string };
    };

    if (impact.error) {
        write(`${impact.error.code}: ${impact.error.message}`);
        return;
    }

    // Target
    if (impact.target) {
        const t = impact.target;
        write(`Target: ${t.name ?? '-'} [${t.type ?? '-'}]`);
        write(`  File: ${t.filePath ?? '-'}`);
    }

    // Summary
    write('');
    const summary = impact.summary ?? {};
    write(`Risk:             ${impact.risk ?? 'UNKNOWN'}`);
    write(`Impacted symbols: ${impact.impactedCount ?? 0}`);
    write(`Direct callers:   ${summary.direct ?? 0}`);
    write(`Flows affected:   ${summary.processes_affected ?? 0}`);
    write(`Modules affected: ${summary.modules_affected ?? 0}`);

    // Affected processes
    const processes = impact.affected_processes ?? [];
    if (processes.length) {
        write('');
        write('Affected Flows:');
        for (const p of processes) {
            write(`  ${p.name ?? '-'} (${p.type ?? '-'})  hits: ${p.total_hits ?? 0}  broken at step: ${p.earliest_broken_step ?? '-'}`);
            write(`    ${p.filePath ?? '-'}`);
        }
    }

    // Affected modules
    const modules = impact.affected_modules ?? [];
    if (modules.length) {
        write('');
        write('Affected Modules:');
        for (const m of modules) {
            write(`  ${m.name ?? '-'}  hits: ${m.hits ?? 0}  impact: ${m.impact ?? '-'}`);
        }
    }

    // By depth
    const byDepth = impact.byDepth ?? {};
    const depthKeys = Object.keys(byDepth).sort((a, b) => Number(a) - Number(b));
    if (depthKeys.length) {
        write('');
        write('Call Chain (by depth):');
        for (const key of depthKeys) {
            const nodes = byDepth[key] ?? [];
            for (const node of nodes) {
                const conf = typeof node.confidence === 'number' ? ` (conf: ${node.confidence.toFixed(2)})` : '';
                write(`  [depth ${node.depth ?? key}] ${node.name ?? '-'} — ${node.relationType ?? '-'}${conf}`);
                write(`    ${node.filePath ?? '-'}`);
            }
        }
    }
};

type CallGraphNode = { uid?: string; id?: string; name?: string; filePath?: string; kind?: string };
type CallGraphProcess = { id?: string; name?: string; step_index?: number; step_count?: number };

export const printCallGraph = (value: unknown, write: (line: string) => void): void => {
    const graph = value as {
        root?: { uid?: string; name?: string; kind?: string; filePath?: string; startLine?: number; endLine?: number };
        direction?: string;
        nodes?: CallGraphNode[];
        edges?: Array<{ source?: string; target?: string }>;
        raw?: {
            status?: string;
            incoming?: {
                calls?: CallGraphNode[];
                has_method?: CallGraphNode[];
            };
            outgoing?: {
                calls?: CallGraphNode[];
                accesses?: CallGraphNode[];
            };
            processes?: CallGraphProcess[];
        };
        error?: { code: string; message: string };
    };

    if (graph.error) {
        write(`${graph.error.code}: ${graph.error.message}`);
        return;
    }

    // Root symbol
    const root = graph.root;
    if (root) {
        write(`Symbol: ${root.name ?? '-'} [${root.kind ?? '-'}]`);
        if (root.filePath) {
            const loc = root.startLine != null ? `:${root.startLine}–${root.endLine ?? root.startLine}` : '';
            write(`  File: ${root.filePath}${loc}`);
        }
    }

    write(`Direction: ${graph.direction ?? '-'}`);

    // Graph summary
    const uniqueNodes = graph.nodes?.length ?? 0;
    const totalEdges = graph.edges?.length ?? 0;
    write('');
    write(`Nodes: ${uniqueNodes}   Edges: ${totalEdges}`);

    // Incoming callers (deduplicated by uid)
    const incomingCalls = graph.raw?.incoming?.calls ?? [];
    const uniqueCallers = dedupByUid(incomingCalls);
    if (uniqueCallers.length) {
        write('');
        write(`Callers (${uniqueCallers.length}):`);
        for (const c of uniqueCallers) {
            write(`  ← ${c.name ?? '-'}${c.kind ? ` [${c.kind}]` : ''}`);
            write(`    ${c.filePath ?? '-'}`);
        }
    }

    // Owning class
    const ownerClass = graph.raw?.incoming?.has_method ?? [];
    if (ownerClass.length) {
        write('');
        write('Defined in:');
        for (const cls of ownerClass) {
            write(`  ${cls.name ?? '-'} [${cls.kind ?? 'Class'}]`);
            write(`    ${cls.filePath ?? '-'}`);
        }
    }

    // Outgoing calls (deduplicated)
    const outgoingCalls = graph.raw?.outgoing?.calls ?? [];
    const uniqueCallees = dedupByUid(outgoingCalls);
    if (uniqueCallees.length) {
        write('');
        write(`Calls (${uniqueCallees.length}):`);
        for (const c of uniqueCallees) {
            write(`  → ${c.name ?? '-'}${c.kind ? ` [${c.kind}]` : ''}`);
            write(`    ${c.filePath ?? '-'}`);
        }
    }

    // Property accesses (deduplicated)
    const accesses = graph.raw?.outgoing?.accesses ?? [];
    const uniqueAccesses = dedupByUid(accesses);
    if (uniqueAccesses.length) {
        write('');
        write(`Accesses (${uniqueAccesses.length}):`);
        for (const a of uniqueAccesses) {
            write(`  . ${a.name ?? '-'}`);
        }
    }

    // Related execution processes
    const processes = graph.raw?.processes ?? [];
    if (processes.length) {
        write('');
        write(`Execution Flows (${processes.length}):`);
        for (const p of processes) {
            write(`  ${p.name ?? p.id ?? '-'}  (step ${p.step_index ?? '-'} / ${p.step_count ?? '-'})`);
        }
    }
};

const dedupByUid = (nodes: CallGraphNode[]): CallGraphNode[] => {
    const seen = new Set<string>();
    return nodes.filter((n) => {
        const key = n.uid ?? n.id ?? n.name ?? '';
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const formatScore = (value: unknown): string => {
    return typeof value === 'number' ? value.toFixed(3) : '-';
};

const printStructuralSearch = (
    structural: { processes?: Array<Record<string, unknown>>; error?: { code: string; message: string } } | undefined,
    write: (line: string) => void,
): void => {
    if (!structural) return;
    if (structural.error) {
        printStructuralError(structural.error, write);
        return;
    }

    const processes = structural.processes ?? [];
    write(`Structural flows: ${processes.length}`);
    for (const process of processes.slice(0, 3)) {
        write(String(process.summary ?? process.name ?? process.id ?? '-'));
    }
};

export const printBulkDryRun = (repos: BulkDryRunEntry[], write: (line: string) => void): void => {
    write('Discovered Repositories (Dry Run):');
    write('----------------------------------');
    for (const repo of repos) {
        const status = repo.excluded ? '[EXCLUDE]' : repo.skip ? '[SKIP]' : '[INDEX]';
        write(`${status.padEnd(10)} ${repo.name.padEnd(30)} ${repo.path} (tags: ${repo.tags.join(', ')})`);
    }
    write('----------------------------------');
    write(`Total discovered: ${repos.length}`);
};

export const printBulkSummary = (stats: BulkSummaryStats, write: (line: string) => void): void => {
    write('Bulk Indexing Summary:');
    write('----------------------');
    write(`Indexed:  ${stats.indexed}`);
    write(`Skipped:  ${stats.skipped}`);
    write(`Excluded: ${stats.excluded}`);
    write(`Failed:   ${stats.failed}`);
    write('----------------------');
};

export const printProjectsWithStructure = (entries: any[], write: (line: string) => void): void => {
    if (!entries?.length) {
        write('No projects with structural blueprints found.');
        return;
    }

    write([padCell('ORGANIZATION', 16), padCell('PROJECT', 16), padCell('NAME', 24), padCell('FILENAME', 40), 'SIZE'].join(' '));

    for (const entry of entries) {
        const sizeStr = `${(entry.structuralFileSize / 1024).toFixed(1)} KB`;
        write(
            [
                padCell(entry.organization || '-', 16),
                padCell(entry.project || '-', 16),
                padCell(entry.name || '-', 24),
                padCell(entry.structuralFilename || '-', 40),
                sizeStr,
            ].join(' '),
        );
    }
};
