import { describe, expect, it } from 'vitest';

import {
    analyzeBump,
    calculateNewVersion,
    generateChangelogEntry,
} from '../../assets/agents/skills/only-one-publish/scripts/release-helper';

describe('release-helper: analyzeBump', () => {
    it('nhận diện major bump khi có BREAKING CHANGE', () => {
        const commits = ['fix: resolve minor bug', 'feat!: breaking api contract change'];

        expect(analyzeBump(commits)).toBe('major');
    });

    it('nhận diện major bump khi có dòng chữ BREAKING CHANGE trong commit', () => {
        const commits = ['chore: update deps', 'feat: new engine BREAKING CHANGE: removed old api'];

        expect(analyzeBump(commits)).toBe('major');
    });

    it('nhận diện minor bump khi có commit bắt đầu bằng feat', () => {
        const commits = ['fix: typo in readme', 'feat: support github packages private publishing'];

        expect(analyzeBump(commits)).toBe('minor');
    });

    it('nhận diện patch bump khi chỉ có fix hoặc refactor', () => {
        const commits = [
            'fix: resolve stream race condition',
            'refactor: cleanup unused helpers',
            'docs: update installation instructions',
        ];

        expect(analyzeBump(commits)).toBe('patch');
    });

    it('mặc định patch khi danh sách commits trống', () => {
        expect(analyzeBump([])).toBe('patch');
    });
});

describe('release-helper: calculateNewVersion', () => {
    it('tăng patch version chính xác', () => {
        expect(calculateNewVersion('1.0.5', 'patch')).toBe('1.0.6');
        expect(calculateNewVersion('0.1.9', 'patch')).toBe('0.1.10');
    });

    it('tăng minor version chính xác và reset patch về 0', () => {
        expect(calculateNewVersion('1.0.5', 'minor')).toBe('1.1.0');
        expect(calculateNewVersion('2.3.9', 'minor')).toBe('2.4.0');
    });

    it('tăng major version chính xác và reset minor, patch về 0', () => {
        expect(calculateNewVersion('1.0.5', 'major')).toBe('2.0.0');
        expect(calculateNewVersion('0.4.2', 'major')).toBe('1.0.0');
    });
});

describe('release-helper: generateChangelogEntry', () => {
    it('phân loại các commit thành mục Added, Fixed, Changed', () => {
        const commits = [
            'feat: add subagents sync command',
            'fix: prevent duplicate manifest entries',
            'refactor: optimize asset scanning latency',
            'chore: bump dev dependencies',
        ];
        const entry = generateChangelogEntry('1.1.0', '2026-11-01', commits);

        expect(entry).toContain('### [1.1.0] - 2026-11-01');
        expect(entry).toContain('#### Added');
        expect(entry).toContain('- add subagents sync command');
        expect(entry).toContain('#### Fixed');
        expect(entry).toContain('- prevent duplicate manifest entries');
        expect(entry).toContain('#### Changed');
        expect(entry).toContain('- optimize asset scanning latency');
    });

    it('tạo mục Changed mặc định khi không có tiền tố Conventional Commits chuẩn', () => {
        const commits = ['update readme file and links'];
        const entry = generateChangelogEntry('1.0.6', '2026-11-01', commits);

        expect(entry).toContain('### [1.0.6] - 2026-11-01');
        expect(entry).toContain('#### Changed');
        expect(entry).toContain('- update readme file and links');
    });
});
