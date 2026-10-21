import { describe, expect, it } from 'vitest';
import { groupTasksByColumn, parseFrontmatter } from '@/tui/services/taskScanner.js';
import type { TaskModel } from '@/tui/types/task.js';

describe('Task Scanner & Lifecycle Mapper', () => {
    it('parses valid YAML frontmatter and extracts body', () => {
        const raw = '---\nstatus: plan\nslug: test-slug\n---\n# Test Task Title\nBody content';
        const { data, body } = parseFrontmatter(raw);
        expect(data.status).toBe('plan');
        expect(data.slug).toBe('test-slug');
        expect(body).toContain('Test Task Title');
    });

    it('handles files without frontmatter gracefully', () => {
        const raw = '# Pure Markdown Task';
        const { data, body } = parseFrontmatter(raw);
        expect(data).toEqual({});
        expect(body).toBe(raw);
    });

    it('groups task array into exactly 4 canonical columns', () => {
        const mockTasks: TaskModel[] = [
            { slug: 't1', folderPath: '/t1', status: 'concept', title: 'T1', docs: [], activeDocIndex: 0 },
            { slug: 't2', folderPath: '/t2', status: 'plan', title: 'T2', docs: [], activeDocIndex: 0 },
            { slug: 't3', folderPath: '/t3', status: 'processing', title: 'T3', docs: [], activeDocIndex: 0 },
            { slug: 't4', folderPath: '/t4', status: 'done', title: 'T4', docs: [], activeDocIndex: 0 },
        ];
        const columns = groupTasksByColumn(mockTasks);
        expect(columns.length).toBe(4);
        expect(columns.find((c) => c.id === 'concept')?.tasks.length).toBe(1);
        expect(columns.find((c) => c.id === 'plan')?.tasks.length).toBe(1);
        expect(columns.find((c) => c.id === 'processing')?.tasks.length).toBe(1);
        expect(columns.find((c) => c.id === 'done')?.tasks.length).toBe(1);
    });
});
