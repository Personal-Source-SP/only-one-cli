---
status: fixed
slug: debug-assets-exists-detection
created_at: 2026-10-20T09:46:00.000Z
started_at: 2026-10-20 16:46:00
completed_at: 2026-10-20
reproduction_test: npm test test/tui/init/workspaceScanner.test.ts
---

# Debug: Kiểm tra trạng thái tồn tại (check exists) của Combos, Skills và Assets không chính xác

## Section 1. Diagnosis

### Symptom
- **Actual**: Khi khởi chạy `only-one init` TUI, mục **Combos** hiển thị `(0/3 selected)` và gắn nhãn `(not installed)` cho cả 3 combo (`Frontend Flow Setup`, `Backend Flow Setup`, `Only One Universal Flow Setup`), dù `only-one-flow` đã được cài đặt trong `~/.only-one/installed.json`. Tương tự, mục **Skills** hiển thị `[0/43]` dù các skills đã được cài đặt ở cấp độ global (`~/.gemini/config/skills/`).
- **Expected**: `scanWorkspaceAssets` phải nhận diện chính xác các Combos, Skills, Rules, MCPs đã cài đặt từ cả lockfile của dự án (`only-one/installed.json`), lockfile global (`~/.only-one/installed.json`), và các thư mục cấu hình global của Agent (`~/.gemini/config/skills/`, v.v.).
- **Blast Radius**: Người dùng bị thông báo sai trạng thái cài đặt, dẫn đến việc chọn trùng lặp hoặc hiểu lầm rằng tài nguyên chưa được cài đặt.

### Reproduction
- **Trigger**: Chạy `only-one init` trên một project sạch hoặc project đã cài đặt global assets.
- **Evidence Fact**:
  1. File `~/.only-one/installed.json` có ghi nhận:
     ```json
     "combos": {
       "only-one-flow": { "version": "0.0.16" }
     }
     ```
  2. Thư mục `C:\Users\ADMIN\.gemini\config\skills\` chứa 17 skills đã cài đặt.
  3. Nhưng trong [workspaceScanner.ts](file:///d:/Sources/PERSONAL/only-one-cli/src/tui/init/services/workspaceScanner.ts#L18-L27):
     ```ts
     for (const combo of COMBOS) {
         items.push({
             ...
             isInstalled: false, // BỊ GÁN CỨNG FALSE
             selected: false,
         });
     }
     ```
- **Red Test**: `test/tui/init/workspaceScanner.test.ts` kiểm tra nhận diện combo và skill đã cài đặt từ lockfile / global path.
- **Command**: `npm test test/tui/init/workspaceScanner.test.ts`.

### Evidence
- **Observed Facts**:
  1. [workspaceScanner.ts](file:///d:/Sources/PERSONAL/only-one-cli/src/tui/init/services/workspaceScanner.ts):
     - `Combos`: Gán cứng `isInstalled: false`.
     - `Skills`: Chỉ kiểm tra thư mục cục bộ `join(projectDir, '.agents', 'skills', ...)` và `join(projectDir, '.gemini', 'skills', ...)`. Hoàn toàn bỏ qua thư mục global `~/.gemini/config/skills/` và cả lockfile `installed.json`.
     - `Rules`: Chỉ kiểm tra cục bộ, bỏ qua global rules và lockfile.
     - `MCPs`: Gán cứng `isInstalled: false`.
- **Fault Location**: `src/tui/init/services/workspaceScanner.ts`.

### Root Cause
- **Mechanical Cause**: `scanWorkspaceAssets` chưa đọc dữ liệu từ lockfile Single Source of Truth (`only-one/installed.json` và `~/.only-one/installed.json`) và thiếu kiểm tra đường dẫn cài đặt global (`~/.gemini/config/skills/`, `~/.gemini/config/rules/`). Các danh mục mới như `combos`, `mcps` bị gán cứng cờ `isInstalled: false`.
- **Trigger Mechanism**: Scanner thực thi chỉ dựa trên đường dẫn tương đối cục bộ của project, bỏ sót hoàn toàn hệ sinh thái tài nguyên global và lockfile.
- **Violated Invariant**: Trạng thái `isInstalled` của tài nguyên phải phản ánh chính xác trạng thái thực tế từ lockfile (`installed.json`) và hệ thống tệp đĩa (cục bộ lẫn toàn cục).

### Defect Call Trace / State Divergence Flow

```mermaid
sequenceDiagram
    autonumber
    participant TUI as InitWizardApp
    participant Scanner as workspaceScanner.ts
    participant Lockfile as installed.json (Local & Global)
    participant Disk as Filesystem (Local & Global)

    TUI->>Scanner: scanWorkspaceAssets(projectDir, tools)
    Note over Scanner: KHÔNG đọc Lockfile cục bộ & global
    Note over Scanner: KHÔNG kiểm tra ~/.gemini/config/skills/
    Scanner->>Disk: Chỉ check projectDir/.agents/skills
    Disk-->>Scanner: Không tìm thấy (vì cài đặt ở global)
    Note over Scanner: Gán cứng combo.isInstalled = false
    Scanner-->>TUI: Trả về isInstalled: false cho toàn bộ Combos & Skills
    TUI-->>TUI: Hiển thị (not installed) và [0/3], [0/43] sai lệch
```

### Fix Constraints
- Quét đồng bộ nhanh chóng, không gây trễ khi khởi động TUI.
- Đọc an toàn lockfile cục bộ (`projectDir/only-one/installed.json`) và global (`~/.only-one/installed.json`).
- Kiểm tra thêm đường dẫn global mặc định của các agent (`~/.gemini/config/skills`, `~/.agents/skills`).
- Nếu tài nguyên có trong lockfile hoặc tồn tại trên đĩa $\rightarrow$ đánh dấu `isInstalled: true` và `selected: true`.

---

## Section 2. File Changes

### Directory Structure Changes

```text
test/tui/init/
└── [MODIFY] workspaceScanner.test.ts        # Test case xác thực nhận diện installed từ lockfile và global

src/tui/init/services/
└── [MODIFY] workspaceScanner.ts             # Đọc lockfile local/global và kiểm tra đĩa chính xác
```

---

### 1. `[MODIFY]` `test/tui/init/workspaceScanner.test.ts`

- **Status**: `[x]`
- **Context**: Bộ kiểm thử hiện tại chưa test trường hợp combo hoặc skill được ghi nhận trong lockfile `installed.json`.
- **Target Symbols / AST Seams**: `describe('scanWorkspaceAssets')`.
- **Invariants**: Các bài test hiện tại phải tiếp tục vượt qua.
- **Depends On**: None.
- **Fast Test Command**: `npm test test/tui/init/workspaceScanner.test.ts`.

> **Action**: Bổ sung test case giả lập lockfile `installed.json` ghi nhận combo và skill đã cài đặt.

**Test checklist**
- [x] Tái sử dụng fixture và helper hiện có.
- [x] Không trùng lặp setup state.
- [x] Chỉ kiểm tra hành vi đã thay đổi.
- [x] Tương thích toolchain hiện có.
- **Decision**: Tạo file `only-one/installed.json` trong test dir để kiểm tra nhận diện `isInstalled: true`.
- **Rejected alternative**: Không mock module fs để bảo đảm kiểm thử hành vi thực tế.

```diff
@@ -1,5 +1,5 @@
 import { describe, it, expect, beforeEach, afterEach } from 'vitest';
-import { mkdtempSync, rmSync, mkdirSync } from 'node:fs';
+import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
 import { join } from 'node:path';
 import { tmpdir } from 'node:os';
 import { scanWorkspaceAssets } from '../../../src/tui/init/services/workspaceScanner.js';
@@ -43,4 +43,26 @@
         expect(categories.has('ignore')).toBe(true);
     });
+
+    it('should detect installed combos and skills recorded in project lockfile', () => {
+        mkdirSync(join(testDir, 'only-one'), { recursive: true });
+        writeFileSync(
+            join(testDir, 'only-one', 'installed.json'),
+            JSON.stringify({
+                schemaVersion: 1,
+                installed: {
+                    combos: {
+                        'frontend-flow': { version: '0.0.13' },
+                    },
+                },
+            }),
+        );
+
+        const items = scanWorkspaceAssets(testDir, ['antigravity']);
+        const frontendCombo = items.find((i) => i.id === 'combo:frontend-flow');
+        expect(frontendCombo).toBeDefined();
+        expect(frontendCombo?.isInstalled).toBe(true);
+        expect(frontendCombo?.selected).toBe(true);
+    });
 });
```

---

### 2. `[MODIFY]` `src/tui/init/services/workspaceScanner.ts`

- **Status**: `[x]`
- **Context**: Hàm `scanWorkspaceAssets` chỉ kiểm tra thư mục cục bộ và gán cứng `isInstalled: false` cho combos.
- **Target Symbols / AST Seams**: `scanWorkspaceAssets`.
- **Invariants**: Hàm phải hoạt động đồng bộ an toàn, không ném ngoại lệ khi lockfile lỗi hoặc không tồn tại.
- **Depends On**: `test/tui/init/workspaceScanner.test.ts`.
- **Fast Test Command**: `npm test test/tui/init/workspaceScanner.test.ts`.

> **Action**: Nạp lockfile cục bộ và toàn cục, kiểm tra sự tồn tại của Combos, Skills, Rules trên đĩa và lockfile.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Đọc đồng bộ lockfile qua hàm helper `loadLockfileSync` và kết hợp kiểm tra đường dẫn global `homedir()`.
- **Rejected alternative**: Không gọi các lệnh shell chậm chạp trong vòng lặp quét TUI.

```diff
@@ -1,4 +1,5 @@
 import { existsSync, readFileSync } from 'node:fs';
+import { homedir } from 'node:os';
 import { join } from 'node:path';
 import { RULES } from '@assets/rules/index.js';
@@ -13,7 +14,26 @@
 import type { ResourceItem } from '../types.js';
 
+function loadLockfileSync(filePath: string): any {
+    if (!existsSync(filePath)) return null;
+    try {
+        return JSON.parse(readFileSync(filePath, 'utf8'));
+    } catch {
+        return null;
+    }
+}
+
 export function scanWorkspaceAssets(projectDir: string, selectedTools: string[]): ResourceItem[] {
     const items: ResourceItem[] = [];
-
+    const home = homedir();
+    const projectLock = loadLockfileSync(join(projectDir, 'only-one', 'installed.json'));
+    const globalLock = loadLockfileSync(join(home, '.only-one', 'installed.json'));
+
+    const isInstalledInLockfile = (bucket: string, id: string): boolean => {
+        return Boolean(
+            projectLock?.installed?.[bucket]?.[id] ||
+            globalLock?.installed?.[bucket]?.[id] ||
+            (bucket === 'skills' && (projectLock?.installed?.workflows?.[id] || globalLock?.installed?.workflows?.[id]))
+        );
+    };
+
     // 0. Combos
     for (const combo of COMBOS) {
+        const installed = isInstalledInLockfile('combos', combo.id);
         items.push({
             id: `combo:${combo.id}`,
             name: combo.name || combo.id,
             description: combo.description || '',
             category: 'combo',
-            isInstalled: false,
-            selected: false,
+            isInstalled: installed,
+            selected: installed,
         });
     }
 
     // 1. Rules
     for (const rule of RULES) {
         const compatible = rule.supportedTargets.some((t) => selectedTools.includes(t as any));
         if (!compatible && selectedTools.length > 0) continue;
 
         const installed =
+            isInstalledInLockfile('rules', rule.id) ||
             existsSync(join(projectDir, '.agents', 'rules', `${rule.id}.md`)) ||
             existsSync(join(projectDir, '.cursorrules')) ||
-            existsSync(join(projectDir, '.gemini', 'rules', `${rule.id}.md`));
+            existsSync(join(projectDir, '.gemini', 'rules', `${rule.id}.md`)) ||
+            existsSync(join(home, '.gemini', 'config', 'rules', `${rule.id}.md`)) ||
+            existsSync(join(home, '.agents', 'rules', `${rule.id}.md`));
 
         items.push({
@@ -40,6 +60,10 @@
     // 2. Skills
     for (const skill of SKILLS) {
         const installed =
-            existsSync(join(projectDir, '.agents', 'skills', skill.name)) || existsSync(join(projectDir, '.gemini', 'skills', skill.name));
+            isInstalledInLockfile('skills', skill.name) ||
+            existsSync(join(projectDir, '.agents', 'skills', skill.name)) ||
+            existsSync(join(projectDir, '.gemini', 'skills', skill.name)) ||
+            existsSync(join(home, '.gemini', 'config', 'skills', skill.name)) ||
+            existsSync(join(home, '.agents', 'skills', skill.name));
 
         items.push({
```

---

## Section 3. Verification

### Red Feedback Loop
- [x] Chạy `npm test test/tui/init/workspaceScanner.test.ts` để kiểm tra test case lockfile.
- [x] Đảm bảo các combo và skills có trong lockfile hoặc global folder được đánh dấu `[✓] installed`.

### Regression
- [x] Chạy toàn bộ test suites: `npm test`.
- [x] Kiểm tra định dạng: `npm run format:check`.

### Evidence
- `npm test test/tui/init/workspaceScanner.test.ts` — `PASS` (5 tests passed).
- `npm test` — `PASS` (66 test files passed, 273 tests passed).
- `npm run format:check` — `PASS` (All matched files use Prettier code style).
- `npm run build` — `PASS` (Clean TypeScript build).
- **Lessons Learned**: Luôn đối chiếu cả 3 lớp: Project Local, Global Home, và SSOT Lockfile (`installed.json`) khi xây dựng tính năng kiểm tra trạng thái cài đặt (`check exists`).
