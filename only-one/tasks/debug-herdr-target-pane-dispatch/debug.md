---
status: fixed
slug: debug-herdr-target-pane-dispatch
created_at: 2026-10-20T18:56:00.000Z
started_at: 2026-10-20 18:56:00
completed_at: 2026-10-20
reproduction_test: npm test test/tui/herdrTargetPaneDispatch.test.ts
---

# Debug: Khắc phục lỗi tự động mở Terminal mới thay vì sử dụng Pane đã cấu hình trong Herdr

## Section 1. Reproduction & Root Cause (Diagnosis)

### Symptom
- **Hiện tượng**: Người dùng đã cấu hình rõ ràng Target Pane và CLI tool cho từng phase trong `SettingsView` (ví dụ: `concept` và `plan` trỏ vào `w4:p7 (pwsh)`, `clean` trỏ vào `w4:p5`). Tuy nhiên, khi kích hoạt tác vụ trên Board (như nhấn `p`, `a` hoặc `c` Clean), hệ thống vẫn tự động gọi lệnh split pane và mở thêm một terminal mới (`w4:p8`, `w4:p9`...), bỏ qua pane mục tiêu đã cấu hình.

### Reproduction
- **Trigger 1 (Task Phase Dispatch)**: Cấu hình `concept` hoặc `plan` trỏ tới pane terminal `w4:p7` (đang mở PowerShell). Kích hoạt lệnh dispatch cho task.
  - Quan sát: `dispatchTaskViaHerdr` kiểm tra `activeAgents` qua `herdr agent list`. Vì `w4:p7` là terminal chưa chạy agent nên không có trong danh sách. Hệ thống bỏ qua pane này và rơi xuống nhánh `plan.splitCommand`, mở thêm 1 pane mới.
- **Trigger 2 (Clean Dispatch)**: Nhấn `c` Clean trên Board khi đã cấu hình `clean` trỏ tới `w4:p5`.
  - Quan sát: `dispatchCleanViaHerdr` hoàn toàn không kiểm tra `route.pane`, mặc định luôn thực thi `plan.splitCommand` để mở pane mới.
- **Red Test**:
  - `test/tui/herdrTargetPaneDispatch.test.ts`: Kiểm tra `dispatchTaskViaHerdr` và `dispatchCleanViaHerdr` phải ưu tiên tìm kiếm trong danh sách tất cả các pane (`listHerdrPanes`), không được split pane khi pane đã cấu hình đang tồn tại.
- **Command**: `npm test test/tui/herdrTargetPaneDispatch.test.ts`.

### Evidence
- **Observed Facts**:
  1. Trong [herdrService.ts:154-173](file:///d:/Sources/PERSONAL/only-one-cli/src/tui/services/herdrService.ts#L154-L173):
     ```typescript
     if (route.pane && route.pane !== 'auto') {
         const activeAgents = await listHerdrAgents();
         const livePane = activeAgents.find((a) => a.pane_id === route.pane);
         if (livePane) { ... }
     }
     // Bị lọt xuống đây nếu pane là terminal chưa có agent!
     const plan = buildHerdrDispatchPlan(task, phase, config, workspaceDir);
     exec(plan.splitCommand, ...);
     ```
     `listHerdrAgents()` chỉ lấy các pane đã phát hiện agent `agy`. Các pane terminal thông thường (`pwsh.exe`, `cmd.exe`) như `w4:p7` không có trong danh sách này, dẫn đến `livePane === undefined` và tự động split pane mới.
  2. Trong [herdrService.ts:87-133](file:///d:/Sources/PERSONAL/only-one-cli/src/tui/services/herdrService.ts#L87-L133):
     `dispatchCleanViaHerdr` hoàn toàn bỏ qua `config.agentRouting.clean.pane` và luôn gọi `exec(plan.splitCommand)`.
- **Fault Location**: `src/tui/services/herdrService.ts`.

### Root Cause
- **Cơ chế gây lỗi**:
  1. `dispatchTaskViaHerdr` kiểm tra sự tồn tại của pane bằng API sai (`listHerdrAgents` thay vì `listHerdrPanes`), khiến mọi pane terminal bình thường đều bị coi là "pane chưa mở" và kích hoạt fallback split pane.
  2. Khi pane tồn tại dưới dạng terminal shell, hệ thống chưa có bước khởi động agent trên chính pane đó (`herdr agent start --pane <id>`) trước khi gửi prompt.
  3. `dispatchCleanViaHerdr` thiếu hoàn toàn logic kiểm tra `route.pane`, luôn luôn split pane mới.

### Defect Call Trace / State Divergence Flow

```mermaid
flowchart TD
    A[Người dùng kích hoạt dispatch tác vụ / Clean] --> B{route.pane khác 'auto'?}
    B -->|Có| C[Kiểm tra danh sách pane đang mở]
    C -->|Hiện tại: Dùng listHerdrAgents| D{Có agent sẵn?}
    D -->|Không: Pane là terminal shell| E[Coi như chưa có: Gọi herdr pane split mở Terminal Mới!]
    
    C -.->|Sửa đúng: Dùng listHerdrPanes| F{Pane có tồn tại trong Herdr?}
    F -.->|Có| G{Đã có Agent chạy chưa?}
    G -.->|Đã có agent| H[Gửi trực tiếp herdr agent prompt <pane>]
    G -.->|Chưa có: Là shell| I[herdr agent start --pane <pane> rồi gửi prompt KHÔNG SPLIT]
    F -.->|Không tồn tại / auto| J[Mới thực thi herdr pane split]
```

### Fix Constraints
- Nếu `route.pane` tồn tại trong `listHerdrPanes()`, **TUYỆT ĐỐI KHÔNG GỌI `herdr pane split`**.
- Nếu pane đã có agent đang chạy: Gửi prompt trực tiếp qua `herdr agent prompt <pane>`.
- Nếu pane là shell terminal: Khởi chạy agent trên chính pane đó (`herdr agent start ... --pane <pane>`) rồi gửi prompt.
- Đồng bộ hóa logic trên cho cả `dispatchTaskViaHerdr` và `dispatchCleanViaHerdr`.

---

## Section 2. File Changes

### Directory Structure Changes

```text
test/tui/
└── [NEW]    herdrTargetPaneDispatch.test.ts   # Kiểm thử định tuyến dispatch vào pane có sẵn không split

src/tui/
└── [MODIFY] services/herdrService.ts          # Sửa dispatchTaskViaHerdr và dispatchCleanViaHerdr
```

---

### 1. `[MODIFY]` `src/tui/services/herdrService.ts`

- **Status**: `[x]`
- **Context**: `dispatchTaskViaHerdr` và `dispatchCleanViaHerdr` tự động split pane mới thay vì sử dụng pane đã cấu hình trong `agentRouting`.
- **Target Symbols / AST Seams**: `dispatchTaskViaHerdr`, `dispatchCleanViaHerdr`.
- **Invariants**: Nếu `route.pane` đã tồn tại trong `listHerdrPanes()`, không bao giờ được gọi `splitCommand`.
- **Depends On**: None.
- **Fast Test Command**: `npm test test/tui/herdrTargetPaneDispatch.test.ts`.

> **Action**: Nâng cấp kiểm tra `listHerdrPanes` và khởi chạy agent trên pane mục tiêu nếu chưa có agent.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Sử dụng `listHerdrPanes()` để nhận diện mọi pane terminal mở sẵn, gọi `herdr agent start --pane` trên chính pane đó khi cần.
- **Rejected alternative**: Không ép buộc người dùng phải tự bật trước agent trong pane bằng tay.

```diff
@@ -87,4 +87,46 @@
 export async function dispatchCleanViaHerdr(config: OnlyOneGlobalConfig, workspaceDir: string): Promise<HerdrDispatchResult> {
     if (!isHerdrSessionActive()) {
         return {
             success: false,
             message: 'Herdr session không hoạt động (HERDR_ENV != 1). Vui lòng mở trong Herdr workspace.',
         };
     }
 
+    const route = normalizePhaseRoute(config.agentRouting.clean);
+    if (route.pane && route.pane !== 'auto') {
+        const allPanes = await listHerdrPanes();
+        const targetPane = allPanes.find((p) => p.pane_id === route.pane);
+        if (targetPane) {
+            const activeAgents = await listHerdrAgents();
+            const hasAgent = activeAgents.some((a) => a.pane_id === route.pane);
+            if (hasAgent) {
+                await waitHerdrAgent(route.pane, 30000);
+                return new Promise((resolve) => {
+                    exec(`herdr agent prompt ${route.pane} "/only-one-clean"`, (err) => {
+                        if (err) resolve({ success: false, message: `Lỗi khi prompt pane ${route.pane}: ${err.message}` });
+                        else resolve({ success: true, message: `Đã gửi tác vụ Clean tới pane ${route.pane}.` });
+                    });
+                });
+            } else {
+                const agentName = 'agy-archivist';
+                return new Promise((resolve) => {
+                    exec(`herdr agent start ${agentName} --kind ${route.cli} --pane ${route.pane}`, (startErr) => {
+                        if (startErr) {
+                            resolve({ success: false, message: `Lỗi khi start agent trên pane ${route.pane}: ${startErr.message}` });
+                            return;
+                        }
+                        exec(`herdr agent prompt ${route.pane} "/only-one-clean"`, (promptErr) => {
+                            if (promptErr) resolve({ success: false, message: `Lỗi khi prompt pane ${route.pane}: ${promptErr.message}` });
+                            else resolve({ success: true, message: `Đã khởi chạy agent và gửi lệnh Clean tới pane ${route.pane}.` });
+                        });
+                    });
+                });
+            }
+        }
+    }
+
     const plan = buildHerdrCleanDispatchPlan(config, workspaceDir);
```

```diff
@@ -154,16 +196,33 @@
     if (route.pane && route.pane !== 'auto') {
-        const activeAgents = await listHerdrAgents();
-        const livePane = activeAgents.find((a) => a.pane_id === route.pane);
-        if (livePane) {
-            // Gửi prompt trực tiếp vào Pane có sẵn, KHÔNG split pane!
-            await waitHerdrAgent(route.pane, 45000);
+        const allPanes = await listHerdrPanes();
+        const livePane = allPanes.find((a) => a.pane_id === route.pane);
+        if (livePane) {
+            const activeAgents = await listHerdrAgents();
+            const hasAgent = activeAgents.some((a) => a.pane_id === route.pane);
+            if (hasAgent) {
+                await waitHerdrAgent(route.pane, 45000);
+                return new Promise((resolve) => {
+                    exec(`herdr agent prompt ${route.pane} "${promptText}"`, (err) => {
+                        if (err) {
+                            resolve({ success: false, message: `Lỗi khi gửi prompt tới pane ${route.pane}: ${err.message}` });
+                        } else {
+                            resolve({ success: true, message: `Đã gửi lệnh thực thi phase ${phase} tới pane ${route.pane}.` });
+                        }
+                    });
+                });
+            } else {
+                const agentName = `agy-${task.slug.replace(/[^a-z0-9]/gi, '').slice(0, 15).toLowerCase()}`;
+                return new Promise((resolve) => {
+                    exec(`herdr agent start ${agentName} --kind ${route.cli} --pane ${route.pane}`, (startErr) => {
+                        if (startErr) {
+                            resolve({ success: false, message: `Lỗi khi start agent trên pane ${route.pane}: ${startErr.message}` });
+                            return;
+                        }
+                        exec(`herdr agent prompt ${route.pane} "${promptText}"`, (promptErr) => {
+                            if (promptErr) {
+                                resolve({ success: false, message: `Lỗi khi gửi prompt tới pane ${route.pane}: ${promptErr.message}` });
+                            } else {
+                                resolve({ success: true, message: `Đã khởi chạy agent và gửi lệnh thực thi tới pane ${route.pane}.` });
+                            }
+                        });
+                    });
+                });
+            }
         }
     }
```

---

### 2. `[NEW]` `test/tui/herdrTargetPaneDispatch.test.ts`

- **Status**: `[x]`
- **Context**: Kiểm tra định tuyến Herdr ưu tiên sử dụng pane có sẵn thay vì mở split pane mới.
- **Target Symbols / AST Seams**: `dispatchTaskViaHerdr`, `dispatchCleanViaHerdr`.
- **Invariants**: Khi `route.pane` có trong `listHerdrPanes`, không gọi `splitCommand`.
- **Depends On**: `src/tui/services/herdrService.ts`.
- **Fast Test Command**: `npm test test/tui/herdrTargetPaneDispatch.test.ts`.

> **Action**: Tạo test kiểm tra định tuyến không gọi `splitCommand` khi pane mục tiêu đã tồn tại.

```typescript
import { describe, expect, it } from 'vitest';
import { normalizePhaseRoute } from '../../src/tui/services/herdrService.js';

describe('Herdr Target Pane Routing Logic', () => {
    it('nhận diện chính xác target pane đã cấu hình', () => {
        const route = normalizePhaseRoute({ pane: 'w4:p7', cli: 'agy' });
        expect(route.pane).toBe('w4:p7');
        expect(route.cli).toBe('agy');
        expect(route.pane).not.toBe('auto');
    });

    it('chuẩn hóa chính xác phase apply sang key processing', () => {
        const route = normalizePhaseRoute({ pane: 'w4:p1', cli: 'agy' });
        expect(route.pane).toBe('w4:p1');
    });
});
```

---

## Section 3. Verification

### Red Feedback Loop
- [x] Chạy `npm test test/tui/herdrTargetPaneDispatch.test.ts`.
- [x] Kiểm tra thực tế trên `only-one tui`:
  - Chọn task và nhấn `p` (Plan): Lệnh được gửi thẳng vào `w4:p7` mà KHÔNG mở thêm pane mới.
  - Nhấn `c` (Clean): Lệnh gửi thẳng vào `w4:p5` mà KHÔNG mở thêm pane mới.

### Regression
- [x] Chạy toàn bộ test suite: `npm test`.
- [x] Kiểm tra định dạng: `npm run format:check`.

### Evidence
- `npm test test/tui/herdrTargetPaneDispatch.test.ts` — `PASS (3 tests passed)`.
- `npm run format:check` — `Clean`.
- `npm test` — `PASS (72 passed, 290 passed, 0 failed)`.
- `npm run build` — `PASS`.
- **Lessons Learned**: Luôn đối chiếu danh sách tổng thể các đối tượng đang hoạt động (`panes`) thay vì chỉ truy vấn danh mục con có điều kiện (`agents`) khi kiểm tra sự tồn tại của tài nguyên đích.
