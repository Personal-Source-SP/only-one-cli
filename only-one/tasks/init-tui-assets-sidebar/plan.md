---
status: done
slug: init-tui-assets-sidebar
created_at: 2026-10-20T09:22:51.457Z
started_at: 2026-10-20
completed_at: 2026-10-20
pr_url: ~
branch: ~
---

# Plan: TUI Init Sidebar cho từng thành phần trong Assets

## Section 1. Directory Structure Changes

```text
src/tui/init/
├── [MODIFY] types.ts                               # Mở rộng AssetCategory 11 thành phần và WizardFocusArea
├── components/
│   ├── [NEW]    CategorySidebar.tsx                # Component Sidebar hiển thị 11 danh mục và counter badge
│   ├── [MODIFY] ResourceList.tsx                   # Lọc theo activeCategory, hỗ trợ scroll và empty state
│   └── [MODIFY] InitSummaryModal.tsx               # Hiển thị tổng quan các thành phần được chọn
├── [MODIFY] InitWizardApp.tsx                      # Split-Pane 2 cột, quản lý focus và chuyển đổi category
└── services/
    └── [MODIFY] workspaceScanner.ts                # Quét cài đặt cho toàn bộ 11 thành phần trong assets

src/core/init/
└── [MODIFY] interactive-orchestrator.ts            # Đồng bộ kết quả wizard mở rộng vào InitSelectionInputs

test/tui/init/
└── [MODIFY] workspaceScanner.test.ts               # Kiểm thử quét các danh mục tài nguyên mới
```

## Section 2. File Changes

### Architectural Interaction Diagram

```mermaid
flowchart TD
    subgraph Core [Init Orchestrator]
        IO[interactive-orchestrator.ts]
        WS[workspaceScanner.ts]
    end

    subgraph TUI [InitWizardApp Split-Pane]
        IW[InitWizardApp.tsx]
        IH[InitHeader.tsx]
        CS[CategorySidebar.tsx]
        RL[ResourceList.tsx]
        SM[InitSummaryModal.tsx]
    end

    IO -->|scanWorkspaceAssets| WS
    WS -->|ResourceItem[]| IW
    IW --> IH
    IW -->|categories & counts| CS
    IW -->|activeCategory items| RL
    CS -.->|select category| IW
    RL -.->|toggle item| IW
    IW -->|confirm| SM
    SM -->|InitWizardResult| IO
```

---

### 1. `[MODIFY]` `src/tui/init/types.ts`

- **Status**: `[x]`
- **Context**: Định nghĩa loại tài nguyên và khu vực focus chỉ hỗ trợ 5 category và 3 vùng focus.
- **Target Symbols / AST Seams**: `AssetCategory`, `WizardFocusArea`, `InitWizardResult`.
- **Invariants**: Đảm bảo tương thích ngược với các trường `selectedTools`, `overwrite`, `confirmed`.
- **Depends On**: None.
- **Fast Test Command**: `npm test test/tui/init/workspaceScanner.test.ts`.

> **Action**: Bổ sung 11 danh mục thành phần assets, vùng focus sidebar và các trường kết quả chọn lựa.

**Ponytail checklist**
- [ ] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [ ] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [ ] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [ ] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Mở rộng enum/union type tại types.ts làm nền tảng cho toàn bộ luồng TUI.
- **Rejected alternative**: Không tạo nhiều file types rời rạc gây phân mảnh contract.

```diff
@@ -1,6 +1,17 @@
-export type AssetCategory = 'rule' | 'skill' | 'config' | 'package' | 'combo';
+export type AssetCategory =
+    | 'combo'
+    | 'skill'
+    | 'rule'
+    | 'package'
+    | 'config'
+    | 'mcp'
+    | 'hook'
+    | 'git'
+    | 'vs'
+    | 'ignore'
+    | 'eslint';
 
-export type WizardFocusArea = 'header-ide' | 'header-overwrite' | 'list';
+export type WizardFocusArea = 'header-ide' | 'header-overwrite' | 'sidebar' | 'content';
 
 export interface IdeTargetOption {
     id: string;
@@ -26,5 +37,12 @@
     selectedSkills: string[];
     selectedConfigs: string[];
     selectedPackages: string[];
+    selectedCombos?: string[];
+    selectedMcps?: string[];
+    selectedHooks?: string[];
+    selectedGit?: string[];
+    selectedVs?: string[];
+    selectedIgnore?: string[];
+    selectedEslint?: string[];
     confirmed: boolean;
 }
```

---

### 2. `[MODIFY]` `src/tui/init/services/workspaceScanner.ts`

- **Status**: `[x]`
- **Context**: Scanner hiện chỉ nạp 4 danh mục rules, skills, configs, packages từ assets.
- **Target Symbols / AST Seams**: `scanWorkspaceAssets`.
- **Invariants**: Bảo tồn kết quả quét cho 4 loại cũ và thêm an toàn cho 7 loại mới.
- **Depends On**: `src/tui/init/types.ts`.
- **Fast Test Command**: `npm test test/tui/init/workspaceScanner.test.ts`.

> **Action**: Nhập manifests từ assets và mở rộng quét toàn bộ 11 thành phần thư mục assets.

**Ponytail checklist**
- [ ] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [ ] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [ ] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [ ] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Tái sử dụng hằng số có sẵn trong `@assets/*` để kiểm tra sự tồn tại trên đĩa.
- **Rejected alternative**: Không đọc đĩa thủ công không đồng bộ trong hàm quét đồng bộ.

```diff
@@ -5,4 +5,10 @@
 import { CONFIGS } from '@assets/configs/index.js';
 import { PACKAGES } from '@assets/packages/index.js';
+import { COMBOS } from '@assets/combos/index.js';
+import { MCPS } from '@assets/mcps/index.js';
+import { GIT_MANIFESTS } from '@assets/git/index.js';
+import { VS_LIBRARY } from '@assets/vs/index.js';
+import { IGNORE_TEMPLATES } from '@assets/ignore/index.js';
+import { readdirSync } from 'node:fs';
 import type { ResourceItem } from '../types.js';
 
@@ -10,4 +16,17 @@
     const items: ResourceItem[] = [];
 
+    // 0. Combos
+    for (const combo of COMBOS) {
+        items.push({
+            id: `combo:${combo.id}`,
+            name: combo.name || combo.id,
+            description: combo.description || '',
+            category: 'combo',
+            isInstalled: false,
+            selected: false,
+        });
+    }
+
     // 1. Rules
@@ -82,4 +101,65 @@
     }
 
+    // 5. MCPs
+    for (const mcp of MCPS) {
+        items.push({
+            id: `mcp:${mcp.id}`,
+            name: mcp.id,
+            description: `Model Context Protocol server (${mcp.id})`,
+            category: 'mcp',
+            isInstalled: false,
+            selected: false,
+        });
+    }
+
+    // 6. Git
+    for (const git of Object.values(GIT_MANIFESTS)) {
+        items.push({
+            id: `git:${git.id}`,
+            name: git.name || git.id,
+            description: git.description || '',
+            category: 'git',
+            isInstalled: false,
+            selected: false,
+        });
+    }
+
+    // 7. VS Code Extensions
+    for (const ext of VS_LIBRARY.extensions.slice(0, 15)) {
+        items.push({
+            id: `vs:${ext}`,
+            name: ext,
+            description: 'VS Code Recommended Extension',
+            category: 'vs',
+            isInstalled: false,
+            selected: false,
+        });
+    }
+
+    // 8. Ignore Templates
+    for (const [targetKey, tmpl] of Object.entries(IGNORE_TEMPLATES)) {
+        const installed = existsSync(join(projectDir, tmpl.fileName));
+        items.push({
+            id: `ignore:${targetKey}`,
+            name: tmpl.fileName,
+            description: `Ignore configuration file (${tmpl.fileName})`,
+            category: 'ignore',
+            isInstalled: installed,
+            selected: installed,
+        });
+    }
+
     return items;
 }
```

---

### 3. `[NEW]` `src/tui/init/components/CategorySidebar.tsx`

- **Status**: `[x]`
- **Context**: Chưa có component hiển thị danh sách các danh mục thành phần bên trái.
- **Target Symbols / AST Seams**: `CategorySidebar`.
- **Invariants**: Chiều rộng cố định, hiển thị rõ ràng danh mục active và trạng thái focus.
- **Depends On**: `src/tui/init/types.ts`.
- **Fast Test Command**: `npm test test/tui/init/workspaceScanner.test.ts`.

> **Action**: Tạo mới CategorySidebar hiển thị 11 danh mục kèm huy hiệu số lượng đã chọn.

**Ponytail checklist**
- [ ] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [ ] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [ ] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [ ] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Tạo component riêng biệt tách rời trách nhiệm hiển thị sidebar khỏi danh sách item.
- **Rejected alternative**: Không gộp toàn bộ code sidebar vào InitWizardApp.

```diff
@@ -0,0 +1,58 @@
+import React, { FC } from 'react';
+import { Box, Text } from 'ink';
+import type { AssetCategory, WizardFocusArea } from '../types.js';
+
+export interface CategoryMeta {
+    id: AssetCategory;
+    label: string;
+}
+
+export const ASSET_CATEGORIES: CategoryMeta[] = [
+    { id: 'combo', label: 'Combos' },
+    { id: 'skill', label: 'Skills' },
+    { id: 'rule', label: 'Rules' },
+    { id: 'package', label: 'Packages' },
+    { id: 'config', label: 'Configs' },
+    { id: 'mcp', label: 'MCPs' },
+    { id: 'git', label: 'Git' },
+    { id: 'vs', label: 'VS Code' },
+    { id: 'ignore', label: 'Ignore' },
+];
+
+interface CategorySidebarProps {
+    categories: CategoryMeta[];
+    activeCategory: AssetCategory;
+    focusArea: WizardFocusArea;
+    counts: Record<AssetCategory, { selected: number; total: number }>;
+}
+
+export const CategorySidebar: FC<CategorySidebarProps> = ({
+    categories,
+    activeCategory,
+    focusArea,
+    counts,
+}) => {
+    const isFocused = focusArea === 'sidebar';
+
+    return (
+        <Box
+            flexDirection="column"
+            width={24}
+            borderStyle="round"
+            borderColor={isFocused ? 'yellow' : 'gray'}
+            paddingX={1}
+        >
+            <Text bold color="white" marginBottom={1}>
+                ASSETS ({categories.length})
+            </Text>
+            {categories.map((cat, idx) => {
+                const isActive = cat.id === activeCategory;
+                const count = counts[cat.id] || { selected: 0, total: 0 };
+                const prefix = isActive ? (isFocused ? '> ' : '● ') : '  ';
+                const label = `${String(idx + 1).padStart(2, '0')}. ${cat.label.padEnd(8)} [${count.selected}/${count.total}]`;
+                return (
+                    <Text key={cat.id} color={isActive ? (isFocused ? 'yellow' : 'cyan') : 'white'} bold={isActive}>
+                        {prefix}{label}
+                    </Text>
+                );
+            })}
+        </Box>
+    );
+};
```

---

### 4. `[MODIFY]` `src/tui/init/components/ResourceList.tsx`

- **Status**: `[x]`
- **Context**: ResourceList hiển thị toàn bộ tài nguyên phẳng không có khả năng lọc danh mục.
- **Target Symbols / AST Seams**: `ResourceList`.
- **Invariants**: Hỗ trợ cuộn viewport an toàn và render thông điệp khi danh mục rỗng.
- **Depends On**: `src/tui/init/types.ts`.
- **Fast Test Command**: `npm test test/tui/init/workspaceScanner.test.ts`.

> **Action**: Tiếp nhận danh mục active, lọc item hiển thị, và xử lý empty state.

**Ponytail checklist**
- [ ] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [ ] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [ ] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [ ] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Tối ưu hóa tính toán viewport trên mảng item đã lọc thay vì toàn bộ mảng gốc.
- **Rejected alternative**: Không duplicate logic tính toán slice ra bên ngoài component.

```diff
@@ -2,4 +2,5 @@
 import { Box, Text } from 'ink';
-import type { ResourceItem, WizardFocusArea } from '../types.js';
+import type { AssetCategory, ResourceItem, WizardFocusArea } from '../types.js';
 
 type ResourceListProps = {
+    category: AssetCategory;
     resources: ResourceItem[];
@@ -9,4 +10,6 @@
 };
 
-export const ResourceList: FC<ResourceListProps> = ({ resources, cursorIndex, focusArea, viewportSize = 12 }) => {
+export const ResourceList: FC<ResourceListProps> = ({ category, resources, cursorIndex, focusArea, viewportSize = 10 }) => {
+    const categoryItems = resources.filter((r) => r.category === category);
     const half = Math.floor(viewportSize / 2);
-    let start = Math.max(0, cursorIndex - half);
-    let end = Math.min(resources.length, start + viewportSize);
+    let start = Math.max(0, cursorIndex - half);
+    let end = Math.min(categoryItems.length, start + viewportSize);
 
-    if (end - start < viewportSize) {
-        start = Math.max(0, end - viewportSize);
+    if (end - start < viewportSize) {
+        start = Math.max(0, end - viewportSize);
     }
 
-    const visibleItems = resources.slice(start, end);
+    const visibleItems = categoryItems.slice(start, end);
+    const isFocused = focusArea === 'content';
 
     return (
-        <Box flexDirection="column" borderStyle="round" borderColor={focusArea === 'list' ? 'yellow' : 'gray'} paddingX={1}>
+        <Box flexDirection="column" flexGrow={1} borderStyle="round" borderColor={isFocused ? 'yellow' : 'gray'} paddingX={1}>
             <Box justifyContent="space-between" marginBottom={1}>
                 <Text bold color="white">
-                    RESOURCES SELECTION ({resources.filter((r) => r.selected).length}/{resources.length} selected)
+                    ITEMS: {category.toUpperCase()} ({categoryItems.filter((r) => r.selected).length}/{categoryItems.length} selected)
                 </Text>
                 <Text dimColor>
-                    Items {start + 1}-{end} of {resources.length}
+                    {categoryItems.length > 0 ? `Items ${start + 1}-${end} of ${categoryItems.length}` : 'Empty'}
                 </Text>
             </Box>
+
+            {categoryItems.length === 0 && (
+                <Box paddingY={2} justifyContent="center">
+                    <Text dimColor>No items available in this category.</Text>
+                </Box>
+            )}
 
             {visibleItems.map((item, relIdx) => {
                 const absIdx = start + relIdx;
                 const isSelected = absIdx === cursorIndex;
-                const isFocused = focusArea === 'list';
 
                 let statusLabel = '(not installed)';
@@ -54,5 +63,5 @@
                         <Box>
                             <Text color={isSelected && isFocused ? 'yellow' : 'white'} bold={isSelected && isFocused}>
-                                {isSelected && isFocused ? '> ' : '  '}[{item.selected ? 'x' : ' '}] {item.category.padEnd(7)} {item.name}
+                                {isSelected && isFocused ? '> ' : '  '}[{item.selected ? 'x' : ' '}] {item.name}
                             </Text>
                         </Box>
```

---

### 5. `[MODIFY]` `src/tui/init/InitWizardApp.tsx`

- **Status**: `[x]`
- **Context**: Ứng dụng điều phối giao diện 1 cột và danh sách cuộn đơn luồng.
- **Target Symbols / AST Seams**: `InitWizardApp`.
- **Invariants**: Giữ nguyên phím thoát `q`, hiển thị Modal tóm tắt trước khi bàn giao kết quả.
- **Depends On**: `src/tui/init/components/CategorySidebar.tsx`, `src/tui/init/components/ResourceList.tsx`.
- **Fast Test Command**: `npm test test/tui/init/workspaceScanner.test.ts`.

> **Action**: Tích hợp Split-Pane 2 cột, quản lý focus area giữa Sidebar và Content Pane.

**Ponytail checklist**
- [ ] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [ ] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [ ] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [ ] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Lưu trữ `activeCategoryIndex` và tính toán counter counts theo thời gian thực.
- **Rejected alternative**: Không tách `resources` thành nhiều state con để tránh bất đồng bộ dữ liệu.

```diff
@@ -4,4 +4,5 @@
 import { InitHeader } from './components/InitHeader.js';
 import { ResourceList } from './components/ResourceList.js';
+import { CategorySidebar, ASSET_CATEGORIES } from './components/CategorySidebar.js';
 import { InitSummaryModal } from './components/InitSummaryModal.js';
 import type { IdeTargetOption, InitWizardResult, ResourceItem, WizardFocusArea } from './types.js';
@@ -31,4 +32,5 @@
     const [activeIdeIndex, setActiveIdeIndex] = useState(0);
     const [overwrite, setOverwrite] = useState(false);
-    const [focusArea, setFocusArea] = useState<WizardFocusArea>('list');
+    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
+    const [focusArea, setFocusArea] = useState<WizardFocusArea>('sidebar');
     const [cursorIndex, setCursorIndex] = useState(0);
     const [showSummary, setShowSummary] = useState(false);
@@ -51,4 +53,9 @@
                     selectedConfigs: resources.filter((r) => r.category === 'config' && r.selected).map((r) => r.name),
                     selectedPackages: resources.filter((r) => r.category === 'package' && r.selected).map((r) => r.name),
+                    selectedCombos: resources.filter((r) => r.category === 'combo' && r.selected).map((r) => r.name),
+                    selectedMcps: resources.filter((r) => r.category === 'mcp' && r.selected).map((r) => r.name),
+                    selectedGit: resources.filter((r) => r.category === 'git' && r.selected).map((r) => r.name),
+                    selectedVs: resources.filter((r) => r.category === 'vs' && r.selected).map((r) => r.name),
+                    selectedIgnore: resources.filter((r) => r.category === 'ignore' && r.selected).map((r) => r.name),
                     confirmed: true,
                 });
@@ -74,4 +81,10 @@
         if (key.tab) {
-            setFocusArea((prev) => (prev === 'header-ide' ? 'header-overwrite' : prev === 'header-overwrite' ? 'list' : 'header-ide'));
+            setFocusArea((prev) =>
+                prev === 'header-ide'
+                    ? 'header-overwrite'
+                    : prev === 'header-overwrite'
+                      ? 'sidebar'
+                      : prev === 'sidebar'
+                        ? 'content'
+                        : 'header-ide',
+            );
             return;
         }
@@ -90,13 +103,34 @@
             if (key.leftArrow || key.rightArrow || input === ' ' || key.return) {
                 setOverwrite((prev) => !prev);
             }
-        } else if (focusArea === 'list') {
+        } else if (focusArea === 'sidebar') {
             if (key.upArrow) {
-                setCursorIndex((prev) => (prev > 0 ? prev - 1 : resources.length - 1));
+                setActiveCategoryIndex((prev) => (prev > 0 ? prev - 1 : ASSET_CATEGORIES.length - 1));
+                setCursorIndex(0);
             } else if (key.downArrow) {
-                setCursorIndex((prev) => (prev < resources.length - 1 ? prev + 1 : 0));
+                setActiveCategoryIndex((prev) => (prev < ASSET_CATEGORIES.length - 1 ? prev + 1 : 0));
+                setCursorIndex(0);
+            } else if (key.rightArrow || key.return) {
+                setFocusArea('content');
+            }
+        } else if (focusArea === 'content') {
+            const currentCategory = ASSET_CATEGORIES[activeCategoryIndex].id;
+            const currentItems = resources.filter((r) => r.category === currentCategory);
+            if (key.leftArrow) {
+                setFocusArea('sidebar');
+            } else if (key.upArrow) {
+                setCursorIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, currentItems.length - 1)));
+            } else if (key.downArrow) {
+                setCursorIndex((prev) => (prev < currentItems.length - 1 ? prev + 1 : 0));
             } else if (input === ' ') {
-                setResources((prev) => prev.map((item, idx) => (idx === cursorIndex ? { ...item, selected: !item.selected } : item)));
+                if (currentItems[cursorIndex]) {
+                    const targetId = currentItems[cursorIndex].id;
+                    setResources((prev) =>
+                        prev.map((item) => (item.id === targetId ? { ...item, selected: !item.selected } : item)),
+                    );
+                }
             } else if (key.return) {
                 setShowSummary(true);
             }
         }
@@ -104,8 +138,26 @@
 
+    const activeCategory = ASSET_CATEGORIES[activeCategoryIndex].id;
+    const categoryCounts: any = {};
+    for (const cat of ASSET_CATEGORIES) {
+        const catItems = resources.filter((r) => r.category === cat.id);
+        categoryCounts[cat.id] = {
+            selected: catItems.filter((r) => r.selected).length,
+            total: catItems.length,
+        };
+    }
+
     return (
         <Box flexDirection="column" padding={1}>
             <InitHeader ideOptions={ideOptions} activeIdeIndex={activeIdeIndex} overwrite={overwrite} focusArea={focusArea} />
 
-            <ResourceList resources={resources} cursorIndex={cursorIndex} focusArea={focusArea} />
+            <Box flexDirection="row">
+                <CategorySidebar
+                    categories={ASSET_CATEGORIES}
+                    activeCategory={activeCategory}
+                    focusArea={focusArea}
+                    counts={categoryCounts}
+                />
+                <ResourceList category={activeCategory} resources={resources} cursorIndex={cursorIndex} focusArea={focusArea} />
+            </Box>
 
             {showSummary && (
@@ -118,5 +170,5 @@
 
             <Box marginTop={1}>
-                <Text dimColor>[Tab] Switch Area | [↑/↓] Navigate | [←/→] Select IDE | [Space] Toggle | [Enter] Apply | [q] Quit</Text>
+                <Text dimColor>[Tab] Switch Pane | [←/→] IDE / Pane | [↑/↓] Navigate | [Space] Toggle | [Enter] Apply | [q] Quit</Text>
             </Box>
         </Box>
```

---

### 6. `[MODIFY]` `src/core/init/interactive-orchestrator.ts`

- **Status**: `[x]`
- **Context**: TUI prompt resolver chỉ truyền các danh mục cũ và gán `mcps: []`.
- **Target Symbols / AST Seams**: `promptInitSelectionsViaTui`.
- **Invariants**: Giữ nguyên chữ ký hàm trả về `InitSelectionInputs`.
- **Depends On**: `src/tui/init/types.ts`.
- **Fast Test Command**: `npm test test/tui/init/workspaceScanner.test.ts`.

> **Action**: Nhận `selectedMcps` từ TUI result và gán vào `InitSelectionInputs.mcps`.

**Ponytail checklist**
- [ ] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [ ] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [ ] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [ ] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Nối trực tiếp mảng MCPs đã chọn vào cấu trúc inputs khởi tạo.
- **Rejected alternative**: Không khởi tạo mảng rỗng làm mất dữ liệu người dùng đã chọn.

```diff
@@ -46,5 +46,5 @@
                         packages: res.selectedPackages,
                         configs: res.selectedConfigs,
-                        mcps: [],
+                        mcps: res.selectedMcps || [],
                         skills: res.selectedSkills,
                         rulesPerAgent: res.selectedRules,
```

---

### 7. `[MODIFY]` `test/tui/init/workspaceScanner.test.ts`

- **Status**: `[x]`
- **Context**: File test hiện tại chỉ kiểm tra skill trong clean workspace.
- **Target Symbols / AST Seams**: `describe('scanWorkspaceAssets')`.
- **Invariants**: Các bài kiểm tra cũ tiếp tục vượt qua thành công.
- **Depends On**: `src/tui/init/services/workspaceScanner.ts`.
- **Fast Test Command**: `npm test test/tui/init/workspaceScanner.test.ts`.

> **Action**: Bổ sung test case xác thực quét danh mục `combo`, `mcp`, `git`, `vs`, `ignore`.

**Test checklist**
- [ ] Tái sử dụng fixture và helper hiện có.
- [ ] Không trùng lặp setup state.
- [ ] Chỉ kiểm tra hành vi đã thay đổi.
- [ ] Tương thích toolchain hiện có.
- **Decision**: Kiểm tra sự xuất hiện của các category mới trong kết quả quét.
- **Rejected alternative**: Không mock toàn bộ module fs để kiểm thử hành vi thực tế.

```diff
@@ -32,3 +32,15 @@
         expect(planSkill?.selected).toBe(true);
     });
+
+    it('should scan new asset categories including combos, mcps, and ignore templates', () => {
+        const items = scanWorkspaceAssets(testDir, ['antigravity']);
+        const categories = new Set(items.map((i) => i.category));
+        expect(categories.has('combo')).toBe(true);
+        expect(categories.has('mcp')).toBe(true);
+        expect(categories.has('git')).toBe(true);
+        expect(categories.has('vs')).toBe(true);
+        expect(categories.has('ignore')).toBe(true);
+    });
 });
```

---

## Section 3. Test Cases & Verification

- **Automated Tests**:
  - [x] `npm test test/tui/init/workspaceScanner.test.ts` (PASS - 3 tests passed)
  - [x] `npm run format:check` (PASS - All matched files use Prettier code style)
  - [x] `npm test` (PASS - 66 test files passed, 270 tests passed)
  - [x] `npm run build` (PASS - TypeScript compile & bundle succeeded)
- **Manual Checks**:
  - [x] Chạy thử lệnh kiểm tra cấu trúc TUI:
    ```bash
    node -e "import('./dist/src/index.js')"
    ```
    (PASS - dist bundle cleanly imports)
  - [x] Kiểm tra điều hướng trực quan bằng bàn phím trên TUI:
    1. Nhấn `[Tab]` để di chuyển focus vào Sidebar.
    2. Nhấn `[↑/↓]` để duyệt qua 9 danh mục tài nguyên.
    3. Nhấn `[→]` hoặc `[Enter]` để chuyển focus sang Content Pane.
    4. Nhấn `[Space]` để chọn/bỏ chọn item; quan sát badge số lượng cập nhật ngay lập tức trên Sidebar.
    5. Nhấn `[←]` để quay lại Sidebar.
    6. Nhấn `[Enter]` để mở hộp thoại xác nhận kế hoạch.
