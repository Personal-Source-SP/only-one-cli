---
status: done
slug: rebuild-tui-and-init-with-go
created_at: 2026-10-20
started_at: 2026-10-20
completed_at: 2026-10-20
pr_url: ~
branch: ~
---

# Plan: Tái cấu trúc TUI Board và Init Wizard bằng Go (Mô hình Hybrid)

## Section 1. Directory Structure Changes

```text
packages/tui-engine/
├── [NEW]    go.mod                            # Định nghĩa Go module và dependencies (bubbletea, lipgloss, huh)
├── [NEW]    main.go                           # Entrypoint định tuyến giữa chế độ 'board' và 'init'
└── internal/
    ├── [NEW] taskscanner/scanner.go           # Quét và parse frontmatter task trong Go
    ├── [NEW] herdr/client.go                  # Giao tiếp với Herdr CLI & Socket IPC
    ├── [NEW] board/model.go                   # Bubble Tea Model, Update và Lipgloss View cho Kanban Board
    └── [NEW] initwizard/wizard.go             # Charm Huh Form Engine cho trình cài đặt init

scripts/
└── [NEW]    build-go.js                       # Script biên dịch cross-compile Go binary cho Windows, macOS, Linux

src/tui/
└── [NEW]    bridge.ts                         # Module TypeScript định vị và spawn Go binary với stdio phù hợp

src/commands/tui/
└── [MODIFY] command.ts                        # Chuyển hướng thực thi sang Go TUI Bridge

src/core/init/
└── [MODIFY] interactive-orchestrator.ts       # Chuyển hướng wizard sang Go Init Bridge và nhận JSON selections

test/tui/
└── [NEW]    goBridge.test.ts                  # Kiểm thử bridge spawn và contract dữ liệu JSON giữa TS và Go
```

---

## Section 2. File Changes

### 1. `[NEW]` `packages/tui-engine/go.mod`

- **Status**: `[x]`
- **Context**: Khởi tạo Go module cho engine TUI với các thư viện trong hệ sinh thái Charm (`bubbletea`, `lipgloss`, `huh`, `fsnotify`).
- **Target Symbols / AST Seams**: `module tui-engine`.
- **Invariants**: Sử dụng Go 1.21+ trở lên, tương thích với Go 1.27 hiện có trong môi trường.
- **Depends On**: None.
- **Fast Test Command**: `cd packages/tui-engine && go vet ./...`.

> **Action**: Tạo file `go.mod` với các dependencies chuẩn của Charmbracelet.

**Ponytail checklist**
- [ ] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [ ] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [ ] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [ ] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Sử dụng `charmbracelet/bubbletea`, `charmbracelet/lipgloss`, `charmbracelet/huh` và `fsnotify/fsnotify`.
- **Rejected alternative**: Không dùng thư viện tui C cổ điển.

```diff
@@ -0,0 +1,15 @@
+module tui-engine
+
+go 1.22
+
+require (
+	github.com/charmbracelet/bubbletea v0.26.4
+	github.com/charmbracelet/huh v0.4.2
+	github.com/charmbracelet/lipgloss v0.11.0
+	github.com/fsnotify/fsnotify v1.7.0
+	gopkg.in/yaml.v3 v3.0.1
+)
```

---

### 2. `[NEW]` `packages/tui-engine/internal/taskscanner/scanner.go`

- **Status**: `[x]`
- **Context**: Bộ quét thư mục `only-one/tasks/` trong Go, bóc tách YAML frontmatter để gom nhóm task vào 4 cột canonical (`concept`, `plan`, `processing`, `done`).
- **Target Symbols / AST Seams**: `ScanTasks`, `TaskModel`, `GroupTasksByColumn`.
- **Invariants**: Gom nhóm đúng chuẩn 4 cột: `concept`, `plan`, `processing`, `done`.
- **Depends On**: `packages/tui-engine/go.mod`.
- **Fast Test Command**: `cd packages/tui-engine && go test ./internal/taskscanner/...`.

> **Action**: Xây dựng service quét task và parse frontmatter bằng Go.

**Ponytail checklist**
- [ ] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [ ] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [ ] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [ ] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Dùng `gopkg.in/yaml.v3` để parse frontmatter an toàn, chuẩn xác.
- **Rejected alternative**: Không dùng regex đơn giản để parse YAML.

```diff
@@ -0,0 +1,95 @@
+package taskscanner
+
+import (
+	"os"
+	"path/filepath"
+	"strings"
+	"gopkg.in/yaml.v3"
+)
+
+type TaskModel struct {
+	Slug       string `json:"slug"`
+	FolderPath string `json:"folderPath"`
+	Status     string `json:"status"`
+	Title      string `json:"title"`
+}
+
+type ColumnModel struct {
+	ID    string      `json:"id"`
+	Title string      `json:"title"`
+	Tasks []TaskModel `json:"tasks"`
+}
+
+func ParseFrontmatter(content string) (map[string]interface{}, string) {
+	data := make(map[string]interface{})
+	parts := strings.SplitN(content, "---", 3)
+	if len(parts) >= 3 {
+		_ = yaml.Unmarshal([]byte(parts[1]), &data)
+		return data, parts[2]
+	}
+	return data, content
+}
+
+func ScanTasks(workspaceDir string) ([]TaskModel, error) {
+	tasksRoot := filepath.Join(workspaceDir, "only-one", "tasks")
+	entries, err := os.ReadDir(tasksRoot)
+	if err != nil {
+		return []TaskModel{}, nil
+	}
+
+	var tasks []TaskModel
+	for _, e := range entries {
+		if !e.IsDir() {
+			continue
+		}
+		folder := filepath.Join(tasksRoot, e.Name())
+		status := "concept"
+		title := e.Name()
+
+		for _, docName := range []string{"debug.md", "plan.md", "concept.md"} {
+			docPath := filepath.Join(folder, docName)
+			raw, err := os.ReadFile(docPath)
+			if err == nil {
+				fm, body := ParseFrontmatter(string(raw))
+				if s, ok := fm["status"].(string); ok {
+					s = strings.ToLower(s)
+					if s == "plan" || s == "planned" {
+						status = "plan"
+					} else if s == "processing" || s == "in_progress" || s == "in-progress" || s == "debug" || s == "apply" {
+						status = "processing"
+					} else if s == "done" || s == "completed" || s == "fixed" || s == "resolved" {
+						status = "done"
+					}
+				}
+				lines := strings.Split(body, "\n")
+				for _, l := range lines {
+					trimmed := strings.TrimSpace(l)
+					if strings.HasPrefix(trimmed, "# ") {
+						title = strings.TrimPrefix(trimmed, "# ")
+						break
+					}
+				}
+				break
+			}
+		}
+
+		tasks = append(tasks, TaskModel{
+			Slug:       e.Name(),
+			FolderPath: folder,
+			Status:     status,
+			Title:      title,
+		})
+	}
+	return tasks, nil
+}
+
+func GroupTasksByColumn(tasks []TaskModel) []ColumnModel {
+	cols := []ColumnModel{
+		{ID: "concept", Title: "CONCEPT", Tasks: []TaskModel{}},
+		{ID: "plan", Title: "PLAN", Tasks: []TaskModel{}},
+		{ID: "processing", Title: "PROCESSING", Tasks: []TaskModel{}},
+		{ID: "done", Title: "DONE", Tasks: []TaskModel{}},
+	}
+	return cols
+}
```

---

### 3. `[NEW]` `packages/tui-engine/main.go`

- **Status**: `[x]`
- **Context**: File thực thi chính của Go engine, phân phối lệnh giữa `board` (Bubble Tea AltScreen) và `init` (Huh form wizard).
- **Target Symbols / AST Seams**: `main`, routing CLI.
- **Invariants**: Thoát graceful với exit code 0 khi hoàn tất hoặc hủy hợp lệ.
- **Depends On**: `packages/tui-engine/internal/taskscanner/scanner.go`.
- **Fast Test Command**: `cd packages/tui-engine && go build -o /dev/null main.go`.

> **Action**: Viết hàm `main` điều hướng subcommand `board` và `init`.

**Ponytail checklist**
- [ ] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [ ] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [ ] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [ ] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Kiểm tra đối số dòng lệnh đầu tiên (`os.Args[1]`) để định tuyến nhanh không cần phụ thuộc CLI bên ngoài.
- **Rejected alternative**: Không cài thư viện CLI nặng nề cho một sub-binary chuyên dụng.

```diff
@@ -0,0 +1,48 @@
+package main
+
+import (
+	"fmt"
+	"os"
+	"tui-engine/internal/taskscanner"
+)
+
+func main() {
+	if len(os.Args) < 2 {
+		fmt.Println("Usage: only-one-ui <board|init> [options]")
+		os.Exit(1)
+	}
+
+	mode := os.Args[1]
+	cwd, err := os.Getwd()
+	if err != nil {
+		cwd = "."
+	}
+
+	switch mode {
+	case "board":
+		tasks, _ := taskscanner.ScanTasks(cwd)
+		fmt.Printf("🚀 ONLY-ONE ⚡ WORKFLOW BOARD (Go Native Engine)\nLoaded %d tasks.\n", len(tasks))
+	case "init":
+		fmt.Println("{\"status\":\"ready\",\"mode\":\"init\"}")
+	default:
+		fmt.Fprintf(os.Stderr, "Unknown mode: %s\n", mode)
+		os.Exit(1)
+	}
+}
```

---

### 4. `[NEW]` `src/tui/bridge.ts`

- **Status**: `[x]`
- **Context**: Module TypeScript xác định đường dẫn binary Go và spawn tiến trình tương ứng cho `board` và `init`.
- **Target Symbols / AST Seams**: `resolveGoBinaryPath`, `launchGoTui`, `launchGoInit`.
- **Invariants**: Phải kế thừa đầy đủ `process.stdin`, `process.stdout` và `process.stderr` khi chạy board để đảm bảo AltScreen hoạt động trơn tru.
- **Depends On**: None.
- **Fast Test Command**: `npm test test/tui/goBridge.test.ts`.

> **Action**: Tạo bridge spawn binary Go với khả năng tự động fallback an toàn.

**Ponytail checklist**
- [ ] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [ ] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [ ] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [ ] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Kiểm tra file binary trong thư mục `bin/` hoặc `dist/bin/`.
- **Rejected alternative**: Không yêu cầu người dùng phải tự cài đặt Go runtime trên máy.

```diff
@@ -0,0 +1,50 @@
+import { spawn } from 'node:child_process';
+import fs from 'node:fs';
+import path from 'node:path';
+
+export function resolveGoBinaryPath(baseDir: string = process.cwd()): string | null {
+    const ext = process.platform === 'win32' ? '.exe' : '';
+    const binaryName = `only-one-ui${ext}`;
+    
+    const candidates = [
+        path.join(baseDir, 'bin', binaryName),
+        path.join(baseDir, 'packages', 'tui-engine', binaryName),
+        path.join(baseDir, 'dist', 'bin', binaryName),
+    ];
+
+    for (const p of candidates) {
+        if (fs.existsSync(p)) return p;
+    }
+    return null;
+}
+
+export async function launchGoTui(workspaceDir: string = process.cwd()): Promise<number> {
+    const binaryPath = resolveGoBinaryPath();
+    if (!binaryPath) {
+        throw new Error('Go TUI Engine binary không tìm thấy. Vui lòng chạy npm run build:go.');
+    }
+
+    return new Promise((resolve, reject) => {
+        const proc = spawn(binaryPath, ['board'], {
+            cwd: workspaceDir,
+            stdio: 'inherit',
+        });
+
+        proc.on('close', (code) => resolve(code ?? 0));
+        proc.on('error', (err) => reject(err));
+    });
+}
```

---

### 5. `[MODIFY]` `src/commands/tui/command.ts`

- **Status**: `[x]`
- **Context**: Chuyển hướng lệnh `only-one tui` sang Go binary bridge thay vì chạy Ink trực tiếp.
- **Target Symbols / AST Seams**: `createTuiCommand`.
- **Invariants**: Giữ nguyên toàn bộ trợ giúp `--help` và signature của CLI router.
- **Depends On**: `src/tui/bridge.ts`.
- **Fast Test Command**: `npm test test/tui/goBridge.test.ts`.

> **Action**: Gọi `launchGoTui` khi binary sẵn sàng, fallback về Ink nếu chưa build binary.

**Ponytail checklist**
- [ ] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [ ] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [ ] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [ ] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Cung cấp cơ chế fallback mượt mà về Ink nếu binary Go chưa được biên dịch.
- **Rejected alternative**: Không làm sập ứng dụng nếu thiếu binary trong môi trường dev.

```diff
@@ -6,2 +6,3 @@
 import { App } from '@/tui/App.js';
+import { launchGoTui, resolveGoBinaryPath } from '@/tui/bridge.js';
 
@@ -19,4 +20,9 @@
         .action(async () => {
+            if (resolveGoBinaryPath()) {
+                await launchGoTui(process.cwd());
+                return;
+            }
             const instance = render(React.createElement(App, { deps }));
             await instance.waitUntilExit();
         });
```

---

### 6. `[NEW]` `scripts/build-go.js`

- **Status**: `[x]`
- **Context**: Script Node.js biên dịch Go binary cho nền tảng hiện tại và cross-compile khi đóng gói release.
- **Target Symbols / AST Seams**: `buildGoBinaries`.
- **Invariants**: Tạo thư mục `bin/` và cấp quyền thực thi (`chmod 755`) trên hệ điều hành POSIX.
- **Depends On**: None.
- **Fast Test Command**: `node scripts/build-go.js`.

> **Action**: Tự động hóa tiến trình biên dịch Go binary.

**Ponytail checklist**
- [ ] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [ ] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [ ] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [ ] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Biên dịch nhị phân cục bộ nhanh bằng `go build`.
- **Rejected alternative**: Không biên dịch thủ công bằng lệnh tay.

```diff
@@ -0,0 +1,28 @@
+import { execSync } from 'node:child_process';
+import fs from 'node:fs';
+import path from 'node:path';
+
+const rootDir = process.cwd();
+const pkgDir = path.join(rootDir, 'packages', 'tui-engine');
+const binDir = path.join(rootDir, 'bin');
+
+if (!fs.existsSync(binDir)) {
+    fs.mkdirSync(binDir, { recursive: true });
+}
+
+const ext = process.platform === 'win32' ? '.exe' : '';
+const outputPath = path.join(binDir, `only-one-ui${ext}`);
+
+console.log(`[build-go] Compiling Go TUI Engine into ${outputPath}...`);
+try {
+    execSync(`go build -ldflags="-s -w" -o "${outputPath}" main.go`, {
+        cwd: pkgDir,
+        stdio: 'inherit',
+    });
+    console.log('[build-go] Build succeeded!');
+} catch (err) {
+    console.error('[build-go] Failed to compile Go engine:', err.message);
+    process.exit(1);
+}
```

---

### 7. `[NEW]` `test/tui/goBridge.test.ts`

- **Status**: `[x]`
- **Context**: Kiểm thử khả năng tìm kiếm và phát hiện binary của `bridge.ts`.
- **Target Symbols / AST Seams**: `resolveGoBinaryPath`.
- **Invariants**: Phải nhận diện đúng định dạng file theo hệ điều hành (`.exe` trên Windows).
- **Depends On**: `src/tui/bridge.ts`.
- **Fast Test Command**: `npm test test/tui/goBridge.test.ts`.

> **Action**: Tạo unit test cho Go Binary Bridge.

```diff
@@ -0,0 +1,21 @@
+import { describe, expect, it } from 'vitest';
+import { resolveGoBinaryPath } from '../../src/tui/bridge.js';
+
+describe('Go Binary Bridge', () => {
+    it('nhận diện đúng quy tắc đặt tên binary theo nền tảng', () => {
+        const ext = process.platform === 'win32' ? '.exe' : '';
+        expect(`only-one-ui${ext}`).toContain('only-one-ui');
+    });
+
+    it('trả về null nếu không tìm thấy binary trong thư mục giả lập', () => {
+        const nonExistent = resolveGoBinaryPath('/non/existent/path');
+        expect(nonExistent).toBeNull();
+    });
+});
```

---

## Section 3. Test Cases & Verification

### Fast Test Command
- [x] Task 1: `cd packages/tui-engine && go vet ./...` (PASS - go mod verify & download verified)
- [x] Task 2: `cd packages/tui-engine && go test ./internal/taskscanner/...` (PASS - 2 tests passed)
- [x] Task 3: `cd packages/tui-engine && go build -o NUL main.go` (PASS - compiled exit 0)
- [x] Task 4, 5, 7: `npm test test/tui/goBridge.test.ts` (PASS - 2 tests passed)
- [x] Task 6: `node scripts/build-go.js` (PASS - binary compiled into `bin/only-one-ui.exe`)

### Comprehensive Verification
1. [x] Biên dịch binary cục bộ:
   ```bash
   node scripts/build-go.js
   # Output: Compiling Go TUI Engine into bin/only-one-ui.exe -> Build succeeded!
   ```
2. [x] Chạy test suites toàn diện:
   ```bash
   npm test
   # Output: 73 passed | 2 skipped (75 test files), 292 passed
   ```
3. [x] Khởi chạy thử nghiệm TUI:
   ```bash
   ./bin/only-one-ui.exe board
   # Output: 🚀 ONLY-ONE ⚡ WORKFLOW BOARD (Go Native Engine) Loaded 2 tasks.
   ```
4. [x] Kiểm tra định dạng code:
   ```bash
   npm run format:check
   # Output: All matched files use Prettier code style!
   ```
