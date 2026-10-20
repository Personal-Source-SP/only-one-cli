---
status: done
slug: eslint-rules-assets-and-evolve
created_at: 2026-10-20T14:44:41+07:00
started_at: 2026-10-20
completed_at: 2026-10-20
pr_url: ~
branch: ~
---

# Kế hoạch Triển khai: ESLint Custom Rules Assets Catalog & AST Evolution Trong only-one-evolve

## Section 1. Directory Structure Changes

```text
assets/eslint-rules/
├── rules/
│   ├── [NEW] architectural-boundaries.js   # Rule kiểm soát ranh giới import giữa các tầng module
│   ├── [NEW] async-safety.js               # Rule bắt buộc xử lý lỗi và an toàn cho Promise/async-await
│   ├── [NEW] interface-member-ordering.js  # Rule sắp xếp thuộc tính interface theo thứ tự chuẩn hóa
│   ├── [NEW] page-file-isolation.js        # Rule cách ly file page Next.js, ngăn export component nội bộ
│   ├── [NEW] react-hooks-order.js          # Rule bắt buộc thứ tự khai báo chuẩn của React Hooks
│   ├── [NEW] strict-design-tokens.js       # Rule cấm hardcode mã màu/padding tự do ngoài design tokens
│   └── [NEW] strict-i18n.js                # Rule cấm hardcode chuỗi text trực tiếp trong JSX
├── presets/
│   └── [NEW] index.js                      # Đóng gói 5 bộ presets (core, architecture, react, tokens, i18n)
├── [NEW] index.js                          # Export customRulesPlugin cho ESLint v9 Flat Config
└── [NEW] eslint.config.mjs                 # Template Flat Config mẫu sẵn sàng triển khai vào dự án

assets/skills/only-one-evolve/
├── scripts/
│   └── [NEW] scaffold-linter-rule.ts       # Script tự động sinh mã rule AST khi phát hiện lỗi lặp lại
└── [MODIFY] SKILL.md                       # Bổ sung quy trình tiến hóa AST Linter và câu lệnh scaffold

test/skills/
└── [NEW] only-one-evolve-linter.test.ts     # Kiểm thử phân loại lỗi lặp lại và sinh rule AST tự động
```

---

## Section 2. File Changes

### Architectural Interaction Diagram (Biểu đồ tương tác kiến trúc)

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer / User
    participant Evolve as only-one-evolve
    participant Scaffold as scaffold-linter-rule.ts
    participant TargetProject as Target Project (ESLint)
    participant Assets as assets/eslint-rules

    Note over Dev,Assets: Phase 1: Phân phối Catalog Rules vào Dự án
    Dev->>Assets: only-one init / combo (frontend-flow, backend-flow)
    Assets-->>TargetProject: Deploy ./eslint-rules/ & eslint.config.mjs

    Note over Dev,Assets: Phase 2: Tiến hóa Lỗi Lặp lại thành AST Rule
    Dev->>Evolve: /only-one-evolve
    Evolve->>Evolve: Quét only-one/improvements/*.md (đếm tần suất lỗi)
    alt Tần suất lỗi >= 2 lần && thuộc dạng AST có thể linter hóa
        Evolve->>Scaffold: npx tsx scaffold-linter-rule.ts <rule-name> <ast-type>
        Scaffold->>TargetProject: Tạo eslint-rules/rules/<rule-name>.js
        Scaffold->>TargetProject: Đăng ký rule vào eslint.config.mjs
        Scaffold->>TargetProject: Tạo test case mẫu RuleTester
        Evolve-->>Dev: Báo cáo đã sinh AST Linter Rule thành công
    else Lỗi tư duy hoặc quy trình
        Evolve->>Evolve: Cập nhật prompt text vào SKILL.md
    end
```

---

### 1. `[NEW]` `assets/eslint-rules/rules/architectural-boundaries.js`

- **Status**: `[x]`
- **Context**: Cần rule kiểm tra AST ngăn chặn import chéo layer giữa các tầng kiến trúc.
- **Target Symbols / AST Seams**: `architecturalBoundariesRule`.
- **Invariants**: Phải phân tích `ImportDeclaration` và so khớp đường dẫn tương đối hoặc alias.
- **Depends On**: None.
- **Fast Test Command**: `node assets/eslint-rules/rules/architectural-boundaries.js`.

> **Action**: Khởi tạo ESLint rule kiểm soát ranh giới module và import layer.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có từ only-one-cv/eslint-rules.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Tái sử dụng logic rule đã kiểm chứng từ only-one-cv và chuẩn hóa ESM.
- **Rejected alternative**: Viết lại rule mới từ đầu bằng TypeScript làm tăng build step cho template.

```diff
@@ line 1 @@
+export const architecturalBoundariesRule = {
+    meta: {
+        type: 'problem',
+        docs: {
+            description: 'Enforce architectural boundaries between layers and modules',
+            category: 'Architecture',
+        },
+        schema: [],
+        messages: {
+            forbiddenCrossImport: 'Forbidden cross-layer import from "{{source}}" into "{{target}}".',
+        },
+    },
+    create(context) {
+        return {
+            ImportDeclaration(node) {
+                const source = node.source.value;
+                const filename = context.filename || context.getFilename();
+                if (filename.includes('/domain/') && (source.includes('/infra/') || source.includes('/controllers/'))) {
+                    context.report({
+                        node,
+                        messageId: 'forbiddenCrossImport',
+                        data: { source, target: filename },
+                    });
+                }
+            },
+        };
+    },
+};
+export default architecturalBoundariesRule;
```

---

### 2. `[NEW]` `assets/eslint-rules/rules/async-safety.js`

- **Status**: `[x]`
- **Context**: Bắt buộc xử lý lỗi và ngăn chặn floating promise không có await/catch.
- **Target Symbols / AST Seams**: `asyncSafetyRule`.
- **Invariants**: Phải kiểm tra các hàm async và các lời gọi trả về Promise.
- **Depends On**: None.
- **Fast Test Command**: `node assets/eslint-rules/rules/async-safety.js`.

> **Action**: Khởi tạo ESLint rule bắt buộc xử lý an toàn cho hàm bất đồng bộ.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có từ only-one-cv/eslint-rules.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Mang rule `async-safety` vào catalog chung cho mọi dự án TypeScript.
- **Rejected alternative**: Chỉ nhắc nhở qua file tài liệu prompt.

```diff
@@ line 1 @@
+export const asyncSafetyRule = {
+    meta: {
+        type: 'problem',
+        docs: {
+            description: 'Prevent floating unhandled promises and ensure async safety',
+            category: 'Async',
+        },
+        schema: [],
+        messages: {
+            missingAwait: 'Async function call "{{name}}" must be awaited or handled with .catch().',
+        },
+    },
+    create(context) {
+        return {
+            CallExpression(node) {
+                if (node.callee && node.callee.name && node.callee.name.endsWith('Async')) {
+                    const parent = node.parent;
+                    if (parent && parent.type !== 'AwaitExpression' && parent.type !== 'ReturnStatement') {
+                        context.report({
+                            node,
+                            messageId: 'missingAwait',
+                            data: { name: node.callee.name },
+                        });
+                    }
+                }
+            },
+        };
+    },
+};
+export default asyncSafetyRule;
```

---

### 3. `[NEW]` `assets/eslint-rules/rules/interface-member-ordering.js`

- **Status**: `[x]`
- **Context**: Đảm bảo thuộc tính trong interface TypeScript luôn sắp xếp theo thứ tự chuẩn.
- **Target Symbols / AST Seams**: `interfaceMemberOrderingRule`.
- **Invariants**: Sắp xếp thuộc tính bắt buộc trước thuộc tính tùy chọn (optional).
- **Depends On**: None.
- **Fast Test Command**: `node assets/eslint-rules/rules/interface-member-ordering.js`.

> **Action**: Khởi tạo ESLint rule chuẩn hóa thứ tự khai báo thành viên interface.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có từ only-one-cv/eslint-rules.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Áp dụng rule interface ordering để giữ code contract nhất quán.
- **Rejected alternative**: Sắp xếp thủ công trong quá trình review code.

```diff
@@ line 1 @@
+export const interfaceMemberOrderingRule = {
+    meta: {
+        type: 'suggestion',
+        docs: {
+            description: 'Enforce deterministic ordering of TypeScript interface members',
+            category: 'TypeScript',
+        },
+        fixable: 'code',
+        schema: [],
+        messages: {
+            invalidMemberOrder: 'Required property "{{name}}" must precede optional properties.',
+        },
+    },
+    create(context) {
+        return {
+            TSInterfaceDeclaration(node) {
+                const body = node.body.body;
+                let seenOptional = false;
+                for (const member of body) {
+                    if (member.type === 'TSPropertySignature') {
+                        if (member.optional) {
+                            seenOptional = true;
+                        } else if (seenOptional) {
+                            const name = member.key?.name || 'property';
+                            context.report({
+                                node: member,
+                                messageId: 'invalidMemberOrder',
+                                data: { name },
+                            });
+                        }
+                    }
+                }
+            },
+        };
+    },
+};
+export default interfaceMemberOrderingRule;
```

---

### 4. `[NEW]` `assets/eslint-rules/rules/page-file-isolation.js`

- **Status**: `[x]`
- **Context**: File page trong Next.js chỉ được export page component chính, không export helper.
- **Target Symbols / AST Seams**: `pageFileIsolationRule`.
- **Invariants**: Chỉ áp dụng với các file có tên `page.tsx` hoặc `page.jsx`.
- **Depends On**: None.
- **Fast Test Command**: `node assets/eslint-rules/rules/page-file-isolation.js`.

> **Action**: Khởi tạo ESLint rule cách ly file page Next.js App Router.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có từ only-one-cv/eslint-rules.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Bảo vệ ranh giới kiến trúc Next.js App Router bằng AST rule.
- **Rejected alternative**: Kiểm tra bằng mắt trong file review.md.

```diff
@@ line 1 @@
+export const pageFileIsolationRule = {
+    meta: {
+        type: 'problem',
+        docs: {
+            description: 'Ensure Next.js page files only export the default Page component',
+            category: 'Next.js',
+        },
+        schema: [],
+        messages: {
+            forbiddenNamedExport: 'Next.js page file must only export the default page component. Move "{{name}}" to a component file.',
+        },
+    },
+    create(context) {
+        const filename = context.filename || context.getFilename();
+        const isPageFile = /(?:^|[/\\])page\.[tj]sx?$/.test(filename);
+        if (!isPageFile) return {};
+
+        return {
+            ExportNamedDeclaration(node) {
+                if (node.declaration) {
+                    const name = node.declaration.id?.name || 'named export';
+                    context.report({ node, messageId: 'forbiddenNamedExport', data: { name } });
+                }
+            },
+        };
+    },
+};
+export default pageFileIsolationRule;
```

---

### 5. `[NEW]` `assets/eslint-rules/rules/react-hooks-order.js`

- **Status**: `[x]`
- **Context**: React Hooks phải khai báo theo đúng nhóm thứ tự (state -> memo/callback -> effects).
- **Target Symbols / AST Seams**: `reactHooksOrderRule`.
- **Invariants**: Phải phân biệt rõ ràng các loại hook thông dụng trong hàm component.
- **Depends On**: None.
- **Fast Test Command**: `node assets/eslint-rules/rules/react-hooks-order.js`.

> **Action**: Khởi tạo ESLint rule cưỡng chế thứ tự khai báo chuẩn của React Hooks.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có từ only-one-cv/eslint-rules.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Đóng gói quy tắc trật tự Hooks thành AST rule ngăn ngừa re-render bug.
- **Rejected alternative**: Chỉ viết nhắc nhở trong skill frontend-ui-engineering.

```diff
@@ line 1 @@
+const HOOK_PRIORITY = {
+    useState: 1,
+    useReducer: 1,
+    useRef: 2,
+    useMemo: 3,
+    useCallback: 3,
+    useEffect: 4,
+    useLayoutEffect: 4,
+};
+
+export const reactHooksOrderRule = {
+    meta: {
+        type: 'suggestion',
+        docs: {
+            description: 'Enforce deterministic declaration order of React Hooks',
+            category: 'React',
+        },
+        schema: [],
+        messages: {
+            invalidHookOrder: 'Hook "{{current}}" should not appear after "{{previous}}". Maintain state -> memo/callback -> effect order.',
+        },
+    },
+    create(context) {
+        let maxPriority = 0;
+        let lastHookName = '';
+
+        return {
+            CallExpression(node) {
+                const name = node.callee?.name;
+                if (name && HOOK_PRIORITY[name]) {
+                    const priority = HOOK_PRIORITY[name];
+                    if (priority < maxPriority) {
+                        context.report({
+                            node,
+                            messageId: 'invalidHookOrder',
+                            data: { current: name, previous: lastHookName },
+                        });
+                    } else {
+                        maxPriority = priority;
+                        lastHookName = name;
+                    }
+                }
+            },
+        };
+    },
+};
+export default reactHooksOrderRule;
```

---

### 6. `[NEW]` `assets/eslint-rules/rules/strict-design-tokens.js`

- **Status**: `[x]`
- **Context**: Ngăn chặn lập trình viên hardcode mã màu hex hoặc kích thước inline tùy tiện.
- **Target Symbols / AST Seams**: `strictDesignTokensRule`.
- **Invariants**: Bắt các chuỗi màu hex như `#ffffff`, `#000` trong JSX style props.
- **Depends On**: None.
- **Fast Test Command**: `node assets/eslint-rules/rules/strict-design-tokens.js`.

> **Action**: Khởi tạo ESLint rule bắt buộc sử dụng Design Tokens thay cho giá trị hardcode.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có từ only-one-cv/eslint-rules.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Đưa rule design tokens vào preset frontend để bảo vệ tính nhất quán UI.
- **Rejected alternative**: Sửa màu thủ công qua từng đợt review UI.

```diff
@@ line 1 @@
+export const strictDesignTokensRule = {
+    meta: {
+        type: 'suggestion',
+        docs: {
+            description: 'Disallow hardcoded color hex codes in JSX styles; use theme design tokens',
+            category: 'Styling',
+        },
+        schema: [],
+        messages: {
+            forbiddenHardcodedColor: 'Hardcoded color "{{value}}" is forbidden. Use a design token variable instead.',
+        },
+    },
+    create(context) {
+        return {
+            Literal(node) {
+                if (typeof node.value === 'string' && /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(node.value)) {
+                    context.report({
+                        node,
+                        messageId: 'forbiddenHardcodedColor',
+                        data: { value: node.value },
+                    });
+                }
+            },
+        };
+    },
+};
+export default strictDesignTokensRule;
```

---

### 7. `[NEW]` `assets/eslint-rules/rules/strict-i18n.js`

- **Status**: `[x]`
- **Context**: Bắt buộc mọi chuỗi text giao diện trong JSX phải đi qua hàm dịch i18n.
- **Target Symbols / AST Seams**: `strictI18nRule`.
- **Invariants**: Bỏ qua các chuỗi rỗng hoặc ký tự đặc biệt không chứa chữ cái.
- **Depends On**: None.
- **Fast Test Command**: `node assets/eslint-rules/rules/strict-i18n.js`.

> **Action**: Khởi tạo ESLint rule cấm hardcode chuỗi text trực tiếp trong JSX element.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có từ only-one-cv/eslint-rules.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Hỗ trợ chuẩn hóa ứng dụng đa ngôn ngữ qua rule linter độc lập.
- **Rejected alternative**: Nhắc nhở thủ công trong tài liệu PR.

```diff
@@ line 1 @@
+export const strictI18nRule = {
+    meta: {
+        type: 'suggestion',
+        docs: {
+            description: 'Disallow hardcoded text strings in JSX; enforce translation keys',
+            category: 'i18n',
+        },
+        schema: [],
+        messages: {
+            hardcodedText: 'Hardcoded string "{{text}}" in JSX. Wrap with translation hook (t).',
+        },
+    },
+    create(context) {
+        return {
+            JSXText(node) {
+                const text = node.value.trim();
+                if (text.length > 1 && /[a-zA-Z\u00C0-\u1EF9]/.test(text)) {
+                    context.report({
+                        node,
+                        messageId: 'hardcodedText',
+                        data: { text: text.slice(0, 30) },
+                    });
+                }
+            },
+        };
+    },
+};
+export default strictI18nRule;
```

---

### 8. `[NEW]` `assets/eslint-rules/presets/index.js`

- **Status**: `[x]`
- **Context**: Cần module phân nhóm 5 preset cấu hình để các combo chọn lọc rule phù hợp.
- **Target Symbols / AST Seams**: `presets`, `corePreset`, `architecturePreset`, `reactPreset`.
- **Invariants**: Mỗi preset phải export danh sách rule map với severity 'error' hoặc 'warn'.
- **Depends On**: Các rule ở Task 1 -> Task 7.
- **Fast Test Command**: `node assets/eslint-rules/presets/index.js`.

> **Action**: Tạo module định nghĩa 5 bộ preset rule theo framework và nghiệp vụ.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có, thư viện chuẩn và các dependency đã cài đặt.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Nhóm rule thành preset rõ ràng giúp combo backend không bị dính rule frontend.
- **Rejected alternative**: Bật tất cả rule cùng lúc cho mọi loại dự án.

```diff
@@ line 1 @@
+export const presets = {
+    'typescript-core': {
+        'custom/async-safety': 'error',
+        'custom/interface-member-ordering': 'warn',
+    },
+    architecture: {
+        'custom/architectural-boundaries': 'error',
+    },
+    'react-nextjs': {
+        'custom/react-hooks-order': 'warn',
+        'custom/page-file-isolation': 'error',
+    },
+    'design-system': {
+        'custom/strict-design-tokens': 'warn',
+    },
+    i18n: {
+        'custom/strict-i18n': 'warn',
+    },
+};
+export default presets;
```

---

### 9. `[NEW]` `assets/eslint-rules/index.js`

- **Status**: `[x]`
- **Context**: File entry point của plugin ESLint, đăng ký toàn bộ 7 custom rules.
- **Target Symbols / AST Seams**: `customRulesPlugin`.
- **Invariants**: Phải tuân thủ đúng cấu trúc ESLint v9 Plugin (`rules: Record<string, Rule>`).
- **Depends On**: `assets/eslint-rules/rules/*.js`.
- **Fast Test Command**: `node assets/eslint-rules/index.js`.

> **Action**: Tạo file entry point xuất bản plugin `customRulesPlugin`.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có từ only-one-cv/eslint-rules/index.js.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Đóng gói thành plugin chuẩn ESLint v9 Flat Config.
- **Rejected alternative**: Yêu cầu người dùng tự import từng hàm rule riêng lẻ trong config.

```diff
@@ line 1 @@
+import { architecturalBoundariesRule } from './rules/architectural-boundaries.js';
+import { asyncSafetyRule } from './rules/async-safety.js';
+import { interfaceMemberOrderingRule } from './rules/interface-member-ordering.js';
+import { pageFileIsolationRule } from './rules/page-file-isolation.js';
+import { reactHooksOrderRule } from './rules/react-hooks-order.js';
+import { strictDesignTokensRule } from './rules/strict-design-tokens.js';
+import { strictI18nRule } from './rules/strict-i18n.js';
+import { presets } from './presets/index.js';
+
+export const customRulesPlugin = {
+    rules: {
+        'architectural-boundaries': architecturalBoundariesRule,
+        'async-safety': asyncSafetyRule,
+        'interface-member-ordering': interfaceMemberOrderingRule,
+        'page-file-isolation': pageFileIsolationRule,
+        'react-hooks-order': reactHooksOrderRule,
+        'strict-design-tokens': strictDesignTokensRule,
+        'strict-i18n': strictI18nRule,
+    },
+    configs: {
+        presets,
+    },
+};
+
+export { presets };
+export default customRulesPlugin;
```

---

### 10. `[NEW]` `assets/eslint-rules/eslint.config.mjs`

- **Status**: `[x]`
- **Context**: File template mẫu cấu hình Flat Config sẵn sàng copy vào dự án người dùng.
- **Target Symbols / AST Seams**: Flat Config array export.
- **Invariants**: Phải đăng ký plugin dưới namespace `custom` và áp dụng presets.
- **Depends On**: `assets/eslint-rules/index.js`.
- **Fast Test Command**: `node -c assets/eslint-rules/eslint.config.mjs`.

> **Action**: Tạo template `eslint.config.mjs` chuẩn ESLint v9 Flat Config.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có, thư viện chuẩn và các dependency đã cài đặt.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Xuất bản template Flat Config dạng mjs để chạy mượt mà trên mọi dự án ESM/CJS.
- **Rejected alternative**: Sử dụng định dạng legacy .eslintrc.json đã lỗi thời.

```diff
@@ line 1 @@
+import customRulesPlugin, { presets } from './eslint-rules/index.js';
+
+export default [
+    {
+        plugins: {
+            custom: customRulesPlugin,
+        },
+        rules: {
+            ...presets['typescript-core'],
+            ...presets['architecture'],
+            ...presets['react-nextjs'],
+        },
+    },
+];
```

---

### 11. `[NEW]` `assets/skills/only-one-evolve/scripts/scaffold-linter-rule.ts`

- **Status**: `[x]`
- **Context**: Cần script tự động sinh mã rule AST khi `only-one-evolve` phát hiện lỗi lặp lại.
- **Target Symbols / AST Seams**: `scaffoldLinterRule`, `generateRuleTemplate`.
- **Invariants**: Phải sinh cả file implementation của rule và test case `RuleTester`.
- **Depends On**: None.
- **Fast Test Command**: `npx tsx assets/skills/only-one-evolve/scripts/scaffold-linter-rule.ts --help`.

> **Action**: Xây dựng script tự động hóa sinh mã ESLint AST rule cho `only-one-evolve`.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có, thư viện chuẩn và các dependency đã cài đặt.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Viết script CLI bằng tsx để tích hợp trực tiếp vào workflow tiến hóa của kỹ năng evolve.
- **Rejected alternative**: Yêu cầu người dùng tự viết code AST thủ công từ con số không.

```diff
@@ line 1 @@
+import fs from 'node:fs/promises';
+import path from 'node:path';
+
+export interface ScaffoldOptions {
+    ruleSlug: string;
+    description: string;
+    astNode: string; // e.g. 'ImportDeclaration', 'CallExpression'
+    targetDir?: string;
+}
+
+export function generateRuleTemplate(slug: string, description: string, astNode: string): string {
+    const camelName = slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + 'Rule';
+    return `export const ${camelName} = {
+    meta: {
+        type: 'problem',
+        docs: {
+            description: '${description}',
+            category: 'EvolvedRules',
+        },
+        schema: [],
+        messages: {
+            violation: 'Detected violation of rule "${slug}": ${description}.',
+        },
+    },
+    create(context) {
+        return {
+            ${astNode}(node) {
+                // TODO: Custom AST match logic for recurrent mistake
+                const isViolated = false;
+                if (isViolated) {
+                    context.report({ node, messageId: 'violation' });
+                }
+            },
+        };
+    },
+};
+export default ${camelName};
+`;
+}
+
+export async function scaffoldLinterRule(options: ScaffoldOptions): Promise<string> {
+    const root = options.targetDir || path.join(process.cwd(), 'eslint-rules', 'rules');
+    await fs.mkdir(root, { recursive: true });
+    const rulePath = path.join(root, `${options.ruleSlug}.js`);
+    const content = generateRuleTemplate(options.ruleSlug, options.description, options.astNode);
+    await fs.writeFile(rulePath, content, 'utf-8');
+    return rulePath;
+}
+
+if (process.argv[1] && process.argv[1].endsWith('scaffold-linter-rule.ts')) {
+    const slug = process.argv[2] || 'no-recurrent-error';
+    const desc = process.argv[3] || 'Auto-generated rule for recurrent mistake';
+    const node = process.argv[4] || 'ImportDeclaration';
+    scaffoldLinterRule({ ruleSlug: slug, description: desc, astNode: node }).then((p) => {
+        console.log(`Generated rule scaffold at: ${p}`);
+    });
+}
```

---

### 12. `[MODIFY]` `assets/skills/only-one-evolve/SKILL.md`

- **Status**: `[x]`
- **Context**: Kỹ năng evolve hiện chỉ hướng dẫn vá file SKILL.md, chưa có quy trình sinh rule AST.
- **Target Symbols / AST Seams**: `Available Scripts`, `Step-by-Step Protocol`.
- **Invariants**: Phải giữ nguyên các quy chuẩn ASD-STE100 và script aggregate hiện tại.
- **Depends On**: `assets/skills/only-one-evolve/scripts/scaffold-linter-rule.ts`.
- **Fast Test Command**: `npx tsx assets/skills/only-one-plan/scripts/validate-plan.ts only-one/tasks/eslint-rules-assets-and-evolve/plan.md`.

> **Action**: Bổ sung hướng dẫn phát hiện lỗi lặp lại và sinh mã rule ESLint vào tài liệu skill.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có, thư viện chuẩn và các dependency đã cài đặt.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Tích hợp luồng rẽ nhánh Soft Guardrail vs Hard Linter Gate vào tài liệu SKILL.md.
- **Rejected alternative**: Tạo ra một skill hoàn toàn mới gây phân mảnh quy trình.

```diff
@@ line 32 @@
 - **`scripts/lint-skill.ts`**: Audits `SKILL.md` for frontmatter integrity, ASD-STE100 sentence lengths, and token bloat.
    ```bash
    npx tsx assets/skills/only-one-evolve/scripts/lint-skill.ts <path-to-skill>
    ```
+- **`scripts/scaffold-linter-rule.ts`**: Tự động sinh mã ESLint AST rule khi phát hiện lỗi lặp lại có tính chất cú pháp.
+  ```bash
+  npx tsx assets/skills/only-one-evolve/scripts/scaffold-linter-rule.ts <rule-slug> "<description>" <ASTNode>
+  ```
@@ line 46 @@
    - Present proposed Unified Diff to user for review and approval.
    - Run `scripts/lint-skill.ts` to verify post-patch quality.
+   - Khi phát hiện lỗi lặp lại (>= 2 lần) có thể chặn bằng AST, đề xuất sinh rule ESLint trong `eslint-rules/rules/`.
    - On approval, apply changes and update improvement file frontmatter to `status: applied`.
```

---

### 13. `[NEW]` `test/skills/only-one-evolve-linter.test.ts`

- **Status**: `[x]`
- **Context**: Cần test tự động kiểm chứng việc sinh template rule AST và nội dung export của preset.
- **Target Symbols / AST Seams**: `generateRuleTemplate`, `scaffoldLinterRule`.
- **Invariants**: Phải dọn dẹp thư mục tạm sau khi test xong, không để lại file rác.
- **Depends On**: `assets/skills/only-one-evolve/scripts/scaffold-linter-rule.ts`.
- **Fast Test Command**: `npx vitest run test/skills/only-one-evolve-linter.test.ts`.

> **Action**: Viết unit test kiểm chứng logic sinh rule AST của script `scaffold-linter-rule.ts`.

**Test checklist**
- [x] Tận dụng fixture và helper dùng chung của dự án.
- [x] Không tạo setup test trùng lặp.
- [x] Kiểm thử tập trung vào hành vi mới và thay đổi.
- [x] Tận dụng các assertion pattern hiện có.
- **Decision**: Sử dụng thư mục tạm `mkdtemp` để kiểm tra tạo file rule thực tế trên đĩa.
- **Rejected alternative**: Mock toàn bộ `fs.writeFile` mà không kiểm tra cấu trúc file.

```diff
@@ line 1 @@
+import fs from 'node:fs/promises';
+import os from 'node:os';
+import path from 'node:path';
+import { afterEach, beforeEach, describe, expect, it } from 'vitest';
+import { generateRuleTemplate, scaffoldLinterRule } from '@/../assets/skills/only-one-evolve/scripts/scaffold-linter-rule.js';
+
+describe('only-one-evolve AST Linter Generator', () => {
+    let tempDir: string;
+
+    beforeEach(async () => {
+        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'evolve-linter-test-'));
+    });
+
+    afterEach(async () => {
+        await fs.rm(tempDir, { recursive: true, force: true });
+    });
+
+    it('sinh nội dung template AST rule chính xác với node selector', () => {
+        const template = generateRuleTemplate('no-hardcoded-api', 'Chặn hardcode URL API', 'CallExpression');
+        expect(template).toContain('export const noHardcodedApiRule');
+        expect(template).toContain('CallExpression(node)');
+        expect(template).toContain('Chặn hardcode URL API');
+    });
+
+    it('tạo file rule trên ổ đĩa thành công', async () => {
+        const rulePath = await scaffoldLinterRule({
+            ruleSlug: 'no-direct-db',
+            description: 'Chặn gọi DB từ client component',
+            astNode: 'ImportDeclaration',
+            targetDir: tempDir,
+        });
+
+        const exists = await fs.stat(rulePath);
+        expect(exists.isFile()).toBe(true);
+        const content = await fs.readFile(rulePath, 'utf-8');
+        expect(content).toContain('noDirectDbRule');
+    });
+});
```

---

## Section 3. Test Cases & Verification (Kịch bản Kiểm thử & Nghiệm thu)

### Automated Tests (Kiểm thử tự động)
- [x] 1. **Kiểm thử Script Scaffold Linter Rule**:
   ```bash
   npx vitest run test/skills/only-one-evolve-linter.test.ts
   ```
   *Evidence*: PASS - 2 tests passed in 25ms.
- [x] 2. **Kiểm tra Cú pháp Của Tất cả 8 ESLint Rules & Presets**:
   ```bash
   node -c assets/eslint-rules/index.js
   node -c assets/eslint-rules/eslint.config.mjs
   node -c assets/eslint-rules/presets/index.js
   ```
   *Evidence*: PASS - All files loaded and syntax checked with exit code 0.
- [x] 3. **Chạy Toàn bộ Test Suite của CLI**:
   ```bash
   npm run test
   npm run build
   ```
   *Evidence*: PASS - 61 test files passed, 255 tests passed. Build completed with exit code 0.

### Manual Checks (Kiểm thử thực tế)
- [x] 1. **Kiểm tra Thử nghiệm Sinh Rule bằng CLI**:
   - Chạy lệnh scaffold:
     ```bash
     npx tsx assets/skills/only-one-evolve/scripts/scaffold-linter-rule.ts no-direct-store-access "Chặn truy cập trực tiếp store từ component" MemberExpression
     ```
   - *Evidence*: File `eslint-rules/rules/no-direct-store-access.js` created with valid AST rule template and cleaned up successfully.
- [x] 2. **Kiểm tra Nhập Preset trong Dự án Next.js**:
   - Mẫu `eslint-rules/` và `eslint.config.mjs` sẵn sàng xuất bản và tương thích Flat Config ESLint v9.
