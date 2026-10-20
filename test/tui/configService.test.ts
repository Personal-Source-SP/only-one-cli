import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadGlobalConfig, saveGlobalConfig } from '@/tui/services/configService.js';
import { DEFAULT_GLOBAL_CONFIG } from '@/tui/types/config.js';

describe('Config Service (~/.only-one/config.json)', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'only-one-cfg-test-'));
    });

    afterEach(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    it('tải cấu hình mặc định khi file chưa tồn tại', async () => {
        const config = await loadGlobalConfig(tempDir);
        expect(config.schemaVersion).toBe(1);
        expect(config.cleanPolicy.thresholdCount).toBe(5);
        expect(config.agentRouting.plan).toBe('antigravity');
    });

    it('lưu trữ và tải lại chính xác giá trị đã sửa đổi', async () => {
        const updated = {
            ...DEFAULT_GLOBAL_CONFIG,
            cleanPolicy: { enabled: false, trigger: 'immediate' as const, thresholdCount: 10 },
            agentRouting: { ...DEFAULT_GLOBAL_CONFIG.agentRouting, plan: 'claudecode' },
        };
        await saveGlobalConfig(updated, tempDir);

        const loaded = await loadGlobalConfig(tempDir);
        expect(loaded.cleanPolicy.enabled).toBe(false);
        expect(loaded.cleanPolicy.thresholdCount).toBe(10);
        expect(loaded.agentRouting.plan).toBe('claudecode');
    });
});
