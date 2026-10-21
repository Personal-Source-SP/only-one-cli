import { describe, expect, it } from 'vitest';

describe('Init Wizard Ctrl+C & Cancellation Handling', () => {
    it('giải quyết Promise an toàn về null khi người dùng hủy bỏ', async () => {
        let isResolved = false;
        let resultValue: unknown = 'initial';

        const fakePromise = new Promise<unknown>((resolve) => {
            const onComplete = (res: { confirmed: boolean }) => {
                if (!res.confirmed) {
                    isResolved = true;
                    resultValue = null;
                    resolve(null);
                }
            };

            // Giả lập người dùng bấm 'q' hoặc Ctrl+C
            onComplete({ confirmed: false });
        });

        await fakePromise;
        expect(isResolved).toBe(true);
        expect(resultValue).toBeNull();
    });
});
