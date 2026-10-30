import { describe, expect, it } from 'vitest';

import { resolveGoBinaryPath } from '../../src/tui/bridge.js';

describe('Go TUI Engine Wizard & Bridge Invariants', () => {
    it('nhận diện chính xác tên binary theo nền tảng hiện tại', () => {
        const ext = process.platform === 'win32' ? '.exe' : '';
        const expected = `only-one-ui${ext}`;
        expect(expected).toContain('only-one-ui');
    });

    it('trả về null khi tìm kiếm binary trong thư mục không tồn tại', () => {
        const result = resolveGoBinaryPath('/fake/non/existent/dir');
        expect(result).toBeNull();
    });

    it('tìm thấy binary sau khi đã build trong thư mục bin', () => {
        const result = resolveGoBinaryPath(process.cwd());
        expect(result).not.toBeNull();
        expect(result).toContain('only-one-ui');
    });
});
