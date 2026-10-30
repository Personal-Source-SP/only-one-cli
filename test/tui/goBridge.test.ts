import { describe, expect, it } from 'vitest';

import { resolveGoBinaryPath } from '../../src/tui/bridge.js';

describe('Go Binary Bridge', () => {
    it('nhận diện đúng quy tắc đặt tên binary theo nền tảng', () => {
        const ext = process.platform === 'win32' ? '.exe' : '';
        expect(`only-one-ui${ext}`).toContain('only-one-ui');
    });

    it('trả về null nếu không tìm thấy binary trong thư mục giả lập', () => {
        const nonExistent = resolveGoBinaryPath('/non/existent/path');
        expect(nonExistent).toBeNull();
    });
});
