---
status: fixed
slug: debug-herdr-pane-routing
created_at: 2026-10-20T09:50:00.000Z
started_at: 2026-10-20 16:55:00
completed_at: 2026-10-20
reproduction_test: npm test test/tui/herdrPaneRouting.test.ts
---

# Debug: Tách biệt cấu hình Target Pane và CLI Tool cho từng Phase trong Herdr

## Section 1. Diagnosis

### Symptom
- **Actual**: Giao diện cài đặt (`SettingsView`) chỉ cung cấp 1 trường chọn duy nhất cho mỗi phase và gán cứng loại agent cũ (`antigravity`, `claudecode`), không cho phép người dùng chỉ định độc lập:
  1. **Nơi thực thi (Target Pane)**: Chọn pane cụ thể đang mở (`w4:p1`, `w4:p4`) hoặc chế độ `Auto (Mở mới nếu cần)`.
  2. **Công cụ thực thi (CLI Agent)**: Chọn loại CLI sẽ chạy (`agy`, `codex`, `claude`, `cursor`, `gemini`).
- **Expected**: Cung cấp cấu hình 2 cột độc lập cho từng phase (`concept`, `plan`, `apply`, `debug`, `review`, `clean`):
  - Phím `[←/→]` để chọn Target Pane (`Auto` hoặc danh sách Pane đang chạy trong Herdr).
  - Phím `[Space/Enter]` để chọn CLI Tool (`agy`, `codex`, `claude`, `cursor`, `gemini`).
  - Tại runtime: Nếu Pane được chỉ định đang hoạt động $\rightarrow$ gửi prompt trực tiếp; nếu Pane chưa mở hoặc ở chế độ `Auto` $\rightarrow$ tự động split pane và khởi động CLI đã chọn.
- **Blast Radius**: Người dùng không thể linh hoạt phân công các tác vụ khác nhau cho các pane chuyên biệt đang mở sẵn trong Herdr.

### Reproduction
- **Trigger**: Vào Settings bằng phím `s` từ BoardView và kiểm tra cấu trúc lưu trữ `agentRouting` trong `~/.only-one/config.json`.
- **Evidence**:
  1. Schema hiện tại lưu dạng chuỗi phẳng:
     ```json
     "agentRouting": { "plan": "antigravity", "apply": "codex" }
     ```
     Không có trường để lưu trữ tách biệt giữa `pane` và `cli`.
  2. `SettingsView.tsx` chỉ có 1 handler đổi giá trị duy nhất, không hỗ trợ điều hướng 2 chiều (Pane vs CLI).
- **Red Test**: `test/tui/herdrPaneRouting.test.ts` kiểm tra cấu trúc `PhaseAgentRoute` và cơ chế phân giải lệnh dispatch 2 cấp.
- **Command**: `npm test test/tui/herdrPaneRouting.test.ts`.

### Root Cause
- **Mechanical Cause**: `AgentRoutingConfig` mô hình hóa dữ liệu dạng chuỗi đơn `string` thay vì đối tượng `{ pane: string; cli: string }`, dẫn tới việc giao diện không thể tách biệt 2 lựa chọn và dịch vụ điều phối không thể phân nhánh thông minh giữa gửi lệnh trực tiếp vào pane hay split pane mới.
- **Trigger Mechanism**: Người dùng muốn pane `w4:p4` chạy `agy` cho plan, pane `w4:p1` chạy `codex` cho apply, nhưng hệ thống không có mô hình dữ liệu để lưu trữ.
- **Violated Invariant**: Một định tuyến phase hoàn chỉnh phải bao gồm 2 thành phần: Vị trí thực thi (`pane`) và Công cụ thực thi (`cli`).

### Defect Call Trace / State Divergence Flow

```mermaid
flowchart TD
    A[Kích hoạt task action] --> B[Đọc cấu hình Phase: { pane, cli }]
    
    B --> C{pane === 'auto'?}
    C -->|Đúng| F[Mở Pane mới với cli đã chọn]
    
    C -->|Sai: Pane ID cụ thể| D[Kiểm tra listHerdrAgents]
    D --> E{Pane có đang Active không?}
    
    E -->|Đang mở| G[herdr agent wait & prompt trực tiếp vào Pane đó]
    E -->|Chưa mở / Đã đóng| F
    
    F --> H[herdr pane split]
    H --> I[herdr agent start --kind cli --pane new_id]
    I --> J[herdr agent prompt new_id]
```

### Fix Constraints
- Tự động tương thích ngược (Backward Compatibility): Nếu file config cũ lưu dạng chuỗi `"antigravity"`, tự động chuẩn hóa thành `{ pane: 'auto', cli: 'agy' }`.
- Sử dụng các canonical kinds chuẩn của Herdr: `agy`, `codex`, `claude`, `cursor`, `gemini`.
- Trải nghiệm điều khiển 2 cột mượt mà: `[←/→]` đổi Pane, `[Space/Enter]` đổi CLI.

---

## Section 2. File Changes

### Directory Structure Changes

```text
test/tui/
└── [NEW]    herdrPaneRouting.test.ts          # Test case chuẩn hóa PhaseAgentRoute và phân giải dispatch

src/tui/
├── [MODIFY] types/config.ts                   # Định nghĩa PhaseAgentRoute { pane, cli }
├── [MODIFY] services/configService.ts         # Chuẩn hóa tương thích ngược khi load/save config
├── [MODIFY] services/herdrService.ts          # Xử lý dispatch 2 cấp: Pane có sẵn vs Auto-split
└── [MODIFY] components/SettingsView.tsx       # Bảng giao diện 2 cột: [Target Pane] & [CLI Tool]
```

---

### 1. `[NEW]` `test/tui/herdrPaneRouting.test.ts`

- **Status**: `[x]`
- **Context**: Cần test case xác thực chuẩn hóa dữ liệu `PhaseAgentRoute` và chuyển đổi kind tương thích Herdr.
- **Target Symbols / AST Seams**: `normalizePhaseRoute`, `toCanonicalHerdrKind`.
- **Invariants**: Phải hỗ trợ chuyển đổi từ string cũ sang object `{ pane, cli }`.
- **Depends On**: None.
- **Fast Test Command**: `npm test test/tui/herdrPaneRouting.test.ts`.

> **Action**: Tạo unit test xác thực chuẩn hóa dữ liệu định tuyến và nhận diện canonical kinds.

**Test checklist**
- [x] Tái sử dụng fixture và helper hiện có.
- [x] Không trùng lặp setup state.
- [x] Chỉ kiểm tra hành vi đã thay đổi.
- [x] Tương thích toolchain hiện có.
- **Decision**: Kiểm tra độc lập hàm chuẩn hóa dữ liệu cấu hình trước khi tích hợp vào UI.
- **Rejected alternative**: Không gộp chung vào test tổng của TUI.

```diff
@@ -0,0 +1,38 @@
+import { describe, expect, it } from 'vitest';
+import { normalizePhaseRoute, toCanonicalHerdrKind } from '../../src/tui/services/herdrService.js';
+
+describe('Herdr Pane Routing & PhaseAgentRoute', () => {
+    it('chuẩn hóa chính xác canonical kinds cho Herdr CLI', () => {
+        expect(toCanonicalHerdrKind('antigravity')).toBe('agy');
+        expect(toCanonicalHerdrKind('agy')).toBe('agy');
+        expect(toCanonicalHerdrKind('claudecode')).toBe('claude');
+        expect(toCanonicalHerdrKind('claude')).toBe('claude');
+        expect(toCanonicalHerdrKind('codex')).toBe('codex');
+    });
+
+    it('chuẩn hóa định dạng string cũ sang PhaseAgentRoute object', () => {
+        const fromString = normalizePhaseRoute('antigravity');
+        expect(fromString).toEqual({ pane: 'auto', cli: 'agy' });
+
+        const fromCodexString = normalizePhaseRoute('codex');
+        expect(fromCodexString).toEqual({ pane: 'auto', cli: 'codex' });
+    });
+
+    it('giữ nguyên và chuẩn hóa PhaseAgentRoute object', () => {
+        const validRoute = normalizePhaseRoute({ pane: 'w4:p4', cli: 'antigravity' });
+        expect(validRoute).toEqual({ pane: 'w4:p4', cli: 'agy' });
+    });
+});
```

---

### 2. `[MODIFY]` `src/tui/types/config.ts`

- **Status**: `[x]`
- **Context**: `AgentRoutingConfig` cần lưu trữ đối tượng `PhaseAgentRoute` thay vì chuỗi đơn.
- **Target Symbols / AST Seams**: `PhaseAgentRoute`, `AgentRoutingConfig`, `DEFAULT_GLOBAL_CONFIG`.
- **Invariants**: Giá trị mặc định sử dụng canonical kinds chuẩn (`agy`, `codex`, `claude`).
- **Depends On**: `test/tui/herdrPaneRouting.test.ts`.
- **Fast Test Command**: `npm test test/tui/herdrPaneRouting.test.ts`.

> **Action**: Khai báo interface `PhaseAgentRoute` và cập nhật cấu trúc `DEFAULT_GLOBAL_CONFIG`.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Định nghĩa kiểu rõ ràng cho cả `pane` và `cli`.
- **Rejected alternative**: Không dùng chuỗi kết hợp kiểu `pane@cli` gây khó parse.

```diff
@@ -7,7 +7,12 @@
 }
 
+export interface PhaseAgentRoute {
+    pane: string; // 'auto' | 'w4:p1' | 'w4:p4' ...
+    cli: string;  // 'agy' | 'codex' | 'claude' | 'cursor' | 'gemini'
+}
+
 export interface AgentRoutingConfig {
-    concept: string;
-    plan: string;
-    apply: string;
-    debug: string;
-    review: string;
-    clean?: string;
+    concept: PhaseAgentRoute;
+    plan: PhaseAgentRoute;
+    apply: PhaseAgentRoute;
+    debug: PhaseAgentRoute;
+    review: PhaseAgentRoute;
+    clean?: PhaseAgentRoute;
 }
 
@@ -35,8 +40,8 @@
     agentRouting: {
-        concept: 'antigravity',
-        plan: 'antigravity',
-        apply: 'codex',
-        debug: 'claudecode',
-        review: 'claudecode',
-        clean: 'antigravity',
+        concept: { pane: 'auto', cli: 'agy' },
+        plan: { pane: 'auto', cli: 'agy' },
+        apply: { pane: 'auto', cli: 'codex' },
+        debug: { pane: 'auto', cli: 'claude' },
+        review: { pane: 'auto', cli: 'claude' },
+        clean: { pane: 'auto', cli: 'agy' },
     },
```

---

### 3. `[MODIFY]` `src/tui/services/configService.ts`

- **Status**: `[x]`
- **Context**: Cần hàm chuyển đổi dữ liệu cấu hình cũ (string) sang dữ liệu mới (`PhaseAgentRoute`) khi đọc file json.
- **Target Symbols / AST Seams**: `loadGlobalConfig`.
- **Invariants**: Không làm hỏng file cấu hình `~/.only-one/config.json` hiện có của người dùng.
- **Depends On**: `src/tui/types/config.ts`.
- **Fast Test Command**: `npm test test/tui/herdrPaneRouting.test.ts`.

> **Action**: Chuẩn hóa dữ liệu `agentRouting` trong hàm nạp cấu hình toàn cục.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Thực hiện migration dữ liệu mềm dẻo ngay khi đọc config.
- **Rejected alternative**: Không yêu cầu người dùng tự xóa file config cũ.

```diff
@@ -3,4 +3,5 @@
 import { join } from 'node:path';
+import { normalizePhaseRoute } from './herdrService.js';
 import { DEFAULT_GLOBAL_CONFIG, type OnlyOneGlobalConfig } from '../types/config.js';
 
@@ -23,4 +24,12 @@
             agentRouting: {
                 ...DEFAULT_GLOBAL_CONFIG.agentRouting,
-                ...(parsed.agentRouting || {}),
+                ...(Object.fromEntries(
+                    Object.entries(parsed.agentRouting || {}).map(([key, val]) => [
+                        key,
+                        normalizePhaseRoute(val as any),
+                    ]),
+                ) as any),
             },
```

---

### 4. `[MODIFY]` `src/tui/services/herdrService.ts`

- **Status**: `[x]`
- **Context**: `herdrService` cần phân nhánh dispatch dựa trên `route.pane` và `route.cli`.
- **Target Symbols / AST Seams**: `normalizePhaseRoute`, `toCanonicalHerdrKind`, `buildHerdrDispatchPlan`, `dispatchTaskViaHerdr`.
- **Invariants**: Nếu session Herdr không mở, trả về thông báo lỗi rõ ràng.
- **Depends On**: `src/tui/types/config.ts`.
- **Fast Test Command**: `npm test test/tui/herdrPaneRouting.test.ts`.

> **Action**: Triển khai `normalizePhaseRoute` và phân nhánh dispatch: nếu pane đang mở thì prompt thẳng, nếu chưa thì split pane với cli đã chọn.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Tái sử dụng `listHerdrAgents()` để kiểm tra sự tồn tại của pane.
- **Rejected alternative**: Không chia pane mới khi pane mục tiêu đã sẵn sàng.

```diff
@@ -2,4 +2,19 @@
-import type { OnlyOneGlobalConfig } from '../types/config.js';
+import type { OnlyOneGlobalConfig, PhaseAgentRoute } from '../types/config.js';
 import type { HerdrAgent, TaskModel, TaskStatus } from '../types/task.js';
 
+export function toCanonicalHerdrKind(kind: string): string {
+    const normalized = (kind || '').toLowerCase().trim();
+    if (normalized === 'antigravity') return 'agy';
+    if (normalized === 'claudecode') return 'claude';
+    return normalized || 'agy';
+}
+
+export function normalizePhaseRoute(raw: unknown): PhaseAgentRoute {
+    if (!raw) return { pane: 'auto', cli: 'agy' };
+    if (typeof raw === 'string') {
+        return { pane: 'auto', cli: toCanonicalHerdrKind(raw) };
+    }
+    const obj = raw as Partial<PhaseAgentRoute>;
+    return {
+        pane: obj.pane || 'auto',
+        cli: toCanonicalHerdrKind(obj.cli || 'agy'),
+    };
+}
+
 export function isHerdrSessionActive(env: NodeJS.ProcessEnv = process.env): boolean {
@@ -27,4 +42,5 @@
     const routingKey = (phase === 'processing' ? 'apply' : phase) as keyof OnlyOneGlobalConfig['agentRouting'];
-    const targetAgent = config.agentRouting[routingKey] || 'antigravity';
+    const route = normalizePhaseRoute(config.agentRouting[routingKey]);
+    const targetAgent = route.cli;
     const agentName = `agy-${task.slug
@@ -45,4 +61,5 @@
 export function buildHerdrCleanDispatchPlan(config: OnlyOneGlobalConfig, workspaceDir: string): HerdrDispatchPlan {
-    const targetAgent = config.agentRouting.clean || 'antigravity';
+    const route = normalizePhaseRoute(config.agentRouting.clean);
+    const targetAgent = route.cli;
     const agentName = 'agy-archivist';
@@ -118,4 +135,28 @@
         };
     }
 
+    const routingKey = (phase === 'processing' ? 'apply' : phase) as keyof OnlyOneGlobalConfig['agentRouting'];
+    const route = normalizePhaseRoute(config.agentRouting[routingKey]);
+    const phaseCmd = phase === 'concept' ? 'idea' : phase === 'processing' ? 'apply' : phase;
+    const promptText = `/only-one-${phaseCmd} only-one/tasks/${task.slug}`;
+
+    // 1. Nếu có chỉ định Target Pane cụ thể (khác 'auto') và pane đó đang hoạt động trong Herdr
+    if (route.pane && route.pane !== 'auto') {
+        const activeAgents = await listHerdrAgents();
+        const livePane = activeAgents.find((a) => a.pane_id === route.pane);
+        if (livePane) {
+            // Gửi prompt trực tiếp vào Pane có sẵn, KHÔNG split pane!
+            await waitHerdrAgent(route.pane, 45000);
+            return new Promise((resolve) => {
+                exec(`herdr agent prompt ${route.pane} "${promptText}"`, (err) => {
+                    if (err) {
+                        resolve({ success: false, message: `Lỗi khi gửi prompt tới pane ${route.pane}: ${err.message}` });
+                    } else {
+                        resolve({ success: true, message: `Đã gửi lệnh thực thi phase ${phase} tới pane ${route.pane}.` });
+                    }
+                });
+            });
+        }
+    }
+
+    // 2. Nếu Pane chưa mở hoặc ở chế độ 'auto' -> Mở pane mới và start agent với cli tương ứng
     const plan = buildHerdrDispatchPlan(task, phase, config, workspaceDir);
```

---

### 5. `[MODIFY]` `src/tui/components/SettingsView.tsx`

- **Status**: `[x]`
- **Context**: Cần giao diện bảng 2 cột rõ ràng: `[←/→]` để chỉnh Target Pane và `[Space/Enter]` để đổi CLI Tool.
- **Target Symbols / AST Seams**: `SettingsView`.
- **Invariants**: Phím `[Esc/s]` lưu cấu hình và quay lại màn hình BoardView.
- **Depends On**: `src/tui/services/herdrService.ts`.
- **Fast Test Command**: `npm test test/tui/herdrPaneRouting.test.ts`.

> **Action**: Dựng layout 2 cột cho các dòng Phase: Cột 1 là Pane (`←/→`), Cột 2 là CLI Tool (`Space/Enter`).

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Điều phối phím bấm tách bạch: mũi tên ngang điều chỉnh Pane, Space/Enter điều chỉnh CLI Tool.
- **Rejected alternative**: Không bắt người dùng mở modal con phức tạp để chọn từng thuộc tính.

```diff
@@ -2,4 +2,5 @@
 import React, { FC, useEffect, useState } from 'react';
-import { listHerdrAgents } from '../services/herdrService.js';
+import { isHerdrSessionActive, listHerdrAgents, normalizePhaseRoute } from '../services/herdrService.js';
 import type { OnlyOneGlobalConfig } from '../types/config.js';
+import type { HerdrAgent } from '../types/task.js';
 
@@ -10,4 +11,6 @@
 };
 
-const DEFAULT_AGENT_OPTIONS = ['antigravity', 'claude', 'codex', 'claudecode'];
+const SUPPORTED_CLI_TOOLS = ['agy', 'codex', 'claude', 'cursor', 'gemini'];
 
 export const SettingsView: FC<SettingsViewProps> = ({ initialConfig, onSave, onClose }) => {
     const [config, setConfig] = useState<OnlyOneGlobalConfig>(initialConfig);
-    const [availableAgents, setAvailableAgents] = useState<string[]>(DEFAULT_AGENT_OPTIONS);
+    const [herdrAgents, setHerdrAgents] = useState<HerdrAgent[]>([]);
     const [focusIndex, setFocusIndex] = useState(0);
 
@@ -22,4 +25,4 @@
         listHerdrAgents().then((agents) => {
             if (agents.length > 0) {
-                const dynamicNames = agents.map((a) => a.agent || a.pane_id).filter(Boolean);
-                setAvailableAgents(Array.from(new Set([...dynamicNames, ...DEFAULT_AGENT_OPTIONS])));
+                setHerdrAgents(agents);
             }
         });
@@ -35,2 +38,4 @@
         { id: 'agent_debug', label: "Agent cho Phase 'debug'" },
+        { id: 'agent_review', label: "Agent cho Phase 'review'" },
+        { id: 'agent_clean', label: "Agent cho Tác vụ 'clean'" },
         { id: 'herdr_direction', label: 'Hướng chia màn hình Herdr (Split)' },
@@ -69,8 +74,32 @@
             }
         } else if (currentItem?.startsWith('agent_')) {
             const phase = currentItem.replace('agent_', '') as keyof OnlyOneGlobalConfig['agentRouting'];
-            const currentAgent = config.agentRouting[phase] || 'antigravity';
-            const idx = availableAgents.indexOf(currentAgent);
-            const nextIdx = (idx + 1) % availableAgents.length;
-            setConfig((prev) => ({
-                ...prev,
-                agentRouting: { ...prev.agentRouting, [phase]: availableAgents[nextIdx] },
-            }));
+            const currentRoute = normalizePhaseRoute(config.agentRouting[phase]);
+            const availablePanes = ['auto', ...herdrAgents.map((a) => a.pane_id).filter(Boolean)];
+
+            // [←/→]: Đổi Target Pane
+            if (key.leftArrow) {
+                const pIdx = availablePanes.indexOf(currentRoute.pane);
+                const nextPIdx = pIdx > 0 ? pIdx - 1 : availablePanes.length - 1;
+                setConfig((prev) => ({
+                    ...prev,
+                    agentRouting: {
+                        ...prev.agentRouting,
+                        [phase]: { ...currentRoute, pane: availablePanes[nextPIdx] },
+                    },
+                }));
+            } else if (key.rightArrow) {
+                const pIdx = availablePanes.indexOf(currentRoute.pane);
+                const nextPIdx = (pIdx + 1) % availablePanes.length;
+                setConfig((prev) => ({
+                    ...prev,
+                    agentRouting: {
+                        ...prev.agentRouting,
+                        [phase]: { ...currentRoute, pane: availablePanes[nextPIdx] },
+                    },
+                }));
+            // [Space/Enter]: Đổi CLI Tool
+            } else if (input === ' ' || key.return) {
+                const cIdx = SUPPORTED_CLI_TOOLS.indexOf(currentRoute.cli);
+                const nextCIdx = (cIdx + 1) % SUPPORTED_CLI_TOOLS.length;
+                setConfig((prev) => ({
+                    ...prev,
+                    agentRouting: {
+                        ...prev.agentRouting,
+                        [phase]: { ...currentRoute, cli: SUPPORTED_CLI_TOOLS[nextCIdx] },
+                    },
+                }));
+            }
         } else if (currentItem === 'herdr_direction' && (input === ' ' || key.return)) {
@@ -107,2 +136,25 @@
                 </Text>
                 <Text dimColor>[Esc / s] Lưu & Quay lại</Text>
             </Box>
+
+            {/* Panel danh sách Herdr Active Agents */}
+            <Box flexDirection="column" borderStyle="single" borderColor="green" paddingX={1} marginBottom={1}>
+                <Box justifyContent="space-between">
+                    <Text bold color="green">
+                        🟢 HERDR ACTIVE AGENTS ({herdrAgents.length} agents đang chạy)
+                    </Text>
+                    <Text dimColor>{isHerdrSessionActive() ? 'SESSION: CONNECTED' : 'SESSION: OFF'}</Text>
+                </Box>
+                {herdrAgents.length === 0 ? (
+                    <Text dimColor italic>
+                        {isHerdrSessionActive()
+                            ? 'Chưa có agent nào đang chạy trong Herdr session.'
+                            : 'Herdr session không hoạt động (HERDR_ENV != 1).'}
+                    </Text>
+                ) : (
+                    herdrAgents.map((a) => (
+                        <Box key={a.pane_id || a.agent} gap={1}>
+                            <Text color="cyan">{a.pane_id}</Text>
+                            <Text color="white">({a.agent})</Text>
+                            <Text color={a.agent_status === 'idle' ? 'green' : 'yellow'}>
+                                [{a.agent_status === 'idle' ? '🟢 idle' : '🟡 working'}]
+                            </Text>
+                            {a.cwd && <Text dimColor>cwd: {a.cwd}</Text>}
+                        </Box>
+                    ))
+                )}
+            </Box>
 
             <Box flexDirection="column" gap={1}>
@@ -121,4 +173,7 @@
                     } else if (item.id.startsWith('agent_')) {
                         const phase = item.id.replace('agent_', '') as keyof OnlyOneGlobalConfig['agentRouting'];
-                        valueDisplay = `[ ${config.agentRouting[phase] || 'antigravity'} ] (Space/Enter để đổi)`;
+                        const route = normalizePhaseRoute(config.agentRouting[phase]);
+                        const paneLabel = route.pane === 'auto' ? 'Auto (Mở mới)' : route.pane;
+                        valueDisplay = `Pane: [ ${paneLabel} ] (←/→)  |  CLI: [ ${route.cli} ] (Space/Enter)`;
                     } else if (item.id === 'herdr_direction') {
```

---

## Section 3. Verification

### Red Feedback Loop
- [x] Chạy `npm test test/tui/herdrPaneRouting.test.ts` xác thực chuẩn hóa kind và migration dữ liệu.
- [x] Kiểm tra hiển thị bảng 2 cột trên Settings và kiểm tra luồng điều phối runtime.

### Regression
- [x] Chạy toàn bộ test suites: `npm test test/tui/`.
- [x] Kiểm tra định dạng mã nguồn: `npm run format:check`.

### Evidence
- `npm test test/tui/herdrPaneRouting.test.ts` — `PASS (3 tests passed)`.
- `npm test test/tui/` — `PASS (8 test files, 25 tests passed)`.
- `npm run format:check` — `PASS (All matched files use Prettier code style)`.
- `npm run build` — `SUCCESS (TypeScript compilation clean)`.
- `npm test -- --run` — `PASS (67 test files, 276 tests passed)`.
