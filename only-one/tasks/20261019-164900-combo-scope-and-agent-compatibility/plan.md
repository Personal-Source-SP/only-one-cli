---
status: done
slug: combo-scope-and-agent-compatibility
created_at: 2026-10-19T16:55:00+07:00
started_at: 2026-10-19
completed_at: 2026-10-19
pr_url: ~
branch: ~
---

# Plan: Phân Định Scope (Global vs Project) & Độ Tương Thích Agent Cho Combos

## Section 1. Directory Structure Changes

```text
assets/
├── [MODIFY] types.ts                                         # Thêm ComboScope và bổ sung scope, supportedAgents vào ComboManifest
└── combos/
    └── [MODIFY] index.ts                                     # Khai báo scope và supportedAgents cho 5 combo định sẵn
src/
├── core/
│   └── combo/
│       └── [MODIFY] index.ts                                 # Định nghĩa helper functions: isComboScopeMatch, isComboAgentMatch
└── commands/
    └── combo/
        ├── actions/
        │   └── [MODIFY] step-3-select-combos.ts              # Lọc danh sách combo theo scope & agent, gắn tag nhãn [Scope] [Agents]
        └── [MODIFY] command.ts                               # Kiểm tra tính tương thích scope khi cài đặt combo theo tên cụ thể
test/
├── core/
│   └── [MODIFY] combo.test.ts                                # Unit test kiểm tra isComboScopeMatch, isComboAgentMatch và manifest
└── commands/
    └── combo/
        └── [MODIFY] combo.test.ts                            # Cập nhật format nhãn và test lọc combo theo cờ --global
```

---

## Section 2. File Changes

### 1. `[MODIFY]` `assets/types.ts`

- **Status**: `[x]`
- **Context**: Type definitions for assets, packages, skills, rules, and combo manifests.
- **Target Symbols / AST Seams**: `ComboScope`, `ComboManifest`.
- **Invariants**: `scope` defaults to `'both'` and `supportedAgents` defaults to `['*']` when omitted.
- **Depends On**: None.
- **Fast Test Command**: `npx vitest run test/core/combo.test.ts`.

> **Action**: Add `ComboScope` union type and declare `scope` and `supportedAgents` on `ComboManifest`.

**Ponytail checklist**
- [ ] Required by acceptance criteria.
- [ ] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [ ] No duplicate logic or speculative extension point.
- [ ] Minimum diff preserves correctness and safety.
- **Decision**: Declare optional properties on `ComboManifest` to avoid breaking changes across external manifest consumers.
- **Rejected alternative**: Create separate `GlobalComboManifest` and `ProjectComboManifest` interfaces.

```diff
@@ line 80 @@
 export interface ConfigManifest {
     name: string;
     version: string;
     description?: string;
     files: ConfigFileEntry[];
 }
 
+export type ComboScope = 'global' | 'project' | 'both';
+
 export interface ComboManifest {
     id: string;
     version: string;
     name: string;
     description?: string;
+    scope?: ComboScope;
+    supportedAgents?: string[];
     packages?: string[];
     mcps?: string[];
     skills?: string[];
```

---

### 2. `[MODIFY]` `assets/combos/index.ts`

- **Status**: `[x]`
- **Context**: Manifest catalog of all curated combos.
- **Target Symbols / AST Seams**: `COMBOS`.
- **Invariants**: Every combo defines its explicit `scope` and `supportedAgents` list.
- **Depends On**: Task 1.
- **Fast Test Command**: `npx vitest run test/core/combo.test.ts`.

> **Action**: Annotate `frontend-flow`, `backend-flow`, `only-one-flow`, `mcp-flow`, and `git-flow` with their intended scope and agent compatibility list.

**Ponytail checklist**
- [ ] Required by acceptance criteria.
- [ ] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [ ] No duplicate logic or speculative extension point.
- [ ] Minimum diff preserves correctness and safety.
- **Decision**: Set `only-one-flow`, `mcp-flow`, `git-flow` as `'both'`, and `frontend-flow`, `backend-flow` as `'project'`.
- **Rejected alternative**: Leave `scope` undefined.

```diff
@@ line 5 @@
 export const COMBOS: ComboManifest[] = [
     {
         id: 'frontend-flow',
         version: '0.0.10',
         name: 'Frontend Flow Setup',
         description: 'Next.js and React frontend development toolkit',
+        scope: 'project',
+        supportedAgents: ['antigravity', 'cursor', 'claude', 'windsurf', 'codex'],
         packages: ['ui-ux-pro-max-cli'],
@@ line 48 @@
     {
         id: 'backend-flow',
         version: '0.0.10',
         name: 'Backend Flow Setup',
         description: 'NestJS backend development toolkit with architecture design, security audit, and API standards',
+        scope: 'project',
+        supportedAgents: ['antigravity', 'cursor', 'claude', 'codex'],
         skills: [
@@ line 90 @@
     {
         id: 'only-one-flow',
         version: '0.0.10',
         name: 'Only One Universal Flow Setup',
         description: 'Stack-agnostic end-to-end SDLC toolkit: Ideation, Dual-layer planning, quality gates, security, testing, and review',
+        scope: 'both',
+        supportedAgents: ['antigravity', 'cursor', 'claude', 'codex'],
         skills: [
@@ line 139 @@
     {
         id: 'mcp-flow',
         version: '0.0.1',
         name: 'MCP Flow Setup',
         description: 'Model Context Protocol (MCP) servers toolkit',
+        scope: 'both',
+        supportedAgents: ['antigravity', 'cursor'],
         mcps: ['fetch', 'tavily', 'github', 'postgres', 'playwright-browser'],
     },
     {
         id: 'git-flow',
         version: '0.0.1',
         name: 'Git Flow Setup',
         description: 'GitHub PR automation and Git state management toolkit',
+        scope: 'both',
+        supportedAgents: ['antigravity', 'cursor', 'claude', 'codex'],
         skills: ['only-one-pr-git-skill'],
```

---

### 3. `[MODIFY]` `src/core/combo/index.ts`

- **Status**: `[x]`
- **Context**: Core combo domain service and manifest processing logic.
- **Target Symbols / AST Seams**: `isComboScopeMatch`, `isComboAgentMatch`.
- **Invariants**: Backward-compatible fallback when `scope` or `supportedAgents` is missing.
- **Depends On**: Task 1.
- **Fast Test Command**: `npx vitest run test/core/combo.test.ts`.

> **Action**: Implement and export matching helper functions for scope and agent targets.

**Ponytail checklist**
- [ ] Required by acceptance criteria.
- [ ] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [ ] No duplicate logic or speculative extension point.
- [ ] Minimum diff preserves correctness and safety.
- **Decision**: Centralize scope and agent matching predicates in `core/combo` for reuse across CLI and tests.
- **Rejected alternative**: Re-implement filtering logic inline in command actions.

```diff
@@ line 42 @@
 export interface ExtendedComboManifest extends ComboManifest {
     id: string;
     mcps?: string[];
 }
 
+export const isComboScopeMatch = (combo: ComboManifest, isGlobal: boolean): boolean => {
+    const scope = combo.scope ?? 'both';
+    if (scope === 'both') return true;
+    return isGlobal ? scope === 'global' : scope === 'project';
+};
+
+export const isComboAgentMatch = (combo: ComboManifest, targetTools: AgentToolOption[]): boolean => {
+    const agents = combo.supportedAgents ?? ['*'];
+    if (agents.includes('*') || targetTools.length === 0) return true;
+    return targetTools.some((tool) => agents.includes(tool.value));
+};
+
 export type ComboComponentStatus = 'installed' | 'missing' | 'partial' | 'not-applicable';
```

---

### 4. `[MODIFY]` `src/commands/combo/actions/step-3-select-combos.ts`

- **Status**: `[x]`
- **Context**: Interactive combo selection step.
- **Target Symbols / AST Seams**: `formatComboChoice`, `selectCombosStep`.
- **Invariants**: Filter choices by `isGlobal` and `targetTools`, and format labels with `[Scope]` and `[Agents]`.
- **Depends On**: Task 2, Task 3.
- **Fast Test Command**: `npx vitest run test/commands/combo/combo.test.ts`.

> **Action**: Filter `availableCombos` by scope & agent compatibility, and enrich choice labels.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Filter out non-matching combos from prompt list, while keeping choice format clear.
- **Rejected alternative**: Show non-matching combos as disabled or greyed out.

```diff
@@ line 4 @@
-import { checkExistingComboComponents, summarizeComboInstallation, type ExtendedComboManifest } from '@/core/combo/index.js';
+import {
+    checkExistingComboComponents,
+    isComboAgentMatch,
+    isComboScopeMatch,
+    summarizeComboInstallation,
+    type ExtendedComboManifest,
+} from '@/core/combo/index.js';
 import { parseCsv } from '@/utils/index.js';

-const formatComboChoice = (combo: ExtendedComboManifest): string =>
-    [`${combo.id} — ${combo.name}`, `  ${combo.description || ''}`].join('\n');
+export const formatComboChoice = (combo: ExtendedComboManifest): string => {
+    const scopeTag = combo.scope === 'global' ? '[Global]' : combo.scope === 'project' ? '[Project]' : '[Global/Project]';
+    const agentsTag =
+        !combo.supportedAgents || combo.supportedAgents.includes('*')
+            ? '[All Agents]'
+            : `[Agents: ${combo.supportedAgents.join(', ')}]`;
+    return [`${combo.id} — ${combo.name} ${scopeTag} ${agentsTag}`, `  ${combo.description || ''}`].join('\n');
+};

 export const selectCombosStep = async (
@@ line 17 @@
     isGlobal = false,
 ): Promise<string[]> => {
+    const compatibleCombos = availableCombos.filter(
+        (combo) => isComboScopeMatch(combo, isGlobal) && isComboAgentMatch(combo, targetTools),
+    );
+
     const comboChecks = await Promise.all(
-        availableCombos.map(async (combo) => {
+        compatibleCombos.map(async (combo) => {
             const checks = await checkExistingComboComponents({
```

---

### 5. `[MODIFY]` `src/commands/combo/command.ts`

- **Status**: `[x]`
- **Context**: Main entry point for `only-one combo`.
- **Target Symbols / AST Seams**: `createComboCommand`.
- **Invariants**: Throw early with a clear message if an explicit positional combo ID violates the current scope.
- **Depends On**: Task 3.
- **Fast Test Command**: `npx vitest run test/commands/combo/combo.test.ts`.

> **Action**: Validate explicit combo name against scope compatibility before execution.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Validate scope for explicitly passed combo arguments.
- **Rejected alternative**: Silently proceed with mismatched scope.

```diff
@@ line 6 @@
 import type { ComboCommandOptions } from './types.js';
+import { isComboScopeMatch } from '@/core/combo/index.js';
 import {
@@ line 56 @@
                 if (!combo) {
                     throw new Error(`Combo '${comboName}' not found in assets/combos`);
                 }
+
+                if (!isComboScopeMatch(combo, Boolean(options.global))) {
+                    const targetScope = options.global ? 'global' : 'local project';
+                    throw new Error(
+                        `Combo '${combo.name}' is scoped for '${combo.scope}' only and cannot be installed in ${targetScope} mode.`,
+                    );
+                }

                 deps.stdout(`\nProcessing combo: ${COLORS.primary(combo.name)}...`);
```

---

### 6. `[MODIFY]` `test/core/combo.test.ts`

- **Status**: `[x]`
- **Context**: Combo unit tests.
- **Target Symbols / AST Seams**: `isComboScopeMatch`, `isComboAgentMatch`.
- **Invariants**: 100% test pass.
- **Depends On**: Task 3.
- **Fast Test Command**: `npx vitest run test/core/combo.test.ts`.

> **Action**: Add unit tests for scope matching, agent matching, and fallback defaults.

**Test checklist**
- [ ] Fixture/helper reuse verified.
- [ ] No duplicate logic or flaky async timings.
- [ ] Minimum diff preserves correctness and safety.
- **Decision**: Test all branches of `isComboScopeMatch` (global, project, both, undefined) and `isComboAgentMatch`.
- **Rejected alternative**: Test only one condition.

```diff
@@ line 13 @@
-import { buildComboDependencyPlan, summarizeComboInstallation, validateComboManifestReferences } from '@/core/combo/index.js';
+import {
+    buildComboDependencyPlan,
+    isComboAgentMatch,
+    isComboScopeMatch,
+    summarizeComboInstallation,
+    validateComboManifestReferences,
+} from '@/core/combo/index.js';
@@ line 95 @@
     });
+
+    describe('scope and agent compatibility predicates', () => {
+        it('matches scope correctly across global and local modes', () => {
+            expect(isComboScopeMatch({ id: 'a', name: 'A', version: '1', scope: 'global' }, true)).toBe(true);
+            expect(isComboScopeMatch({ id: 'a', name: 'A', version: '1', scope: 'global' }, false)).toBe(false);
+            expect(isComboScopeMatch({ id: 'b', name: 'B', version: '1', scope: 'project' }, false)).toBe(true);
+            expect(isComboScopeMatch({ id: 'b', name: 'B', version: '1', scope: 'project' }, true)).toBe(false);
+            expect(isComboScopeMatch({ id: 'c', name: 'C', version: '1', scope: 'both' }, true)).toBe(true);
+            expect(isComboScopeMatch({ id: 'c', name: 'C', version: '1', scope: 'both' }, false)).toBe(true);
+            expect(isComboScopeMatch({ id: 'd', name: 'D', version: '1' }, true)).toBe(true);
+        });
+
+        it('matches agent compatibility correctly', () => {
+            const tool = { name: 'Antigravity', value: 'antigravity', available: true };
+            expect(isComboAgentMatch({ id: 'a', name: 'A', version: '1', supportedAgents: ['antigravity', 'cursor'] }, [tool])).toBe(true);
+            expect(isComboAgentMatch({ id: 'b', name: 'B', version: '1', supportedAgents: ['cursor'] }, [tool])).toBe(false);
+            expect(isComboAgentMatch({ id: 'c', name: 'C', version: '1', supportedAgents: ['*'] }, [tool])).toBe(true);
+            expect(isComboAgentMatch({ id: 'd', name: 'D', version: '1' }, [tool])).toBe(true);
+        });
+    });
 });
```

---

### 7. `[MODIFY]` `test/commands/combo/combo.test.ts`

- **Status**: `[x]`
- **Context**: Combo CLI command integration tests.
- **Target Symbols / AST Seams**: `formatComboChoice`, `--global` scope validation.
- **Invariants**: 100% test pass.
- **Depends On**: Task 4, Task 5.
- **Fast Test Command**: `npx vitest run test/commands/combo/combo.test.ts`.

> **Action**: Update choice label expectation to include `[Project]`, and add tests rejecting project combo in global mode.

**Test checklist**
- [ ] Fixture/helper reuse verified.
- [ ] No duplicate logic or flaky async timings.
- [ ] Minimum diff preserves correctness and safety.
- **Decision**: Verify both interactive format labels and positional scope rejection error.
- **Rejected alternative**: Mock the command runner without exercising commander.

```diff
@@ line 128 @@
             const frontend = comboChoices.find((choice) => choice.name.includes('frontend-flow'));
-            expect(frontend?.name).toBe('frontend-flow — Frontend Flow Setup\n  Next.js and React frontend development toolkit');
+            expect(frontend?.name).toContain('frontend-flow — Frontend Flow Setup [Project]');
             expect(frontend?.checked).toBe(true);
         } finally {
             await rm(cwd, { recursive: true, force: true });
         }
     });
+
+    it('rejects installing project-only combo in global mode', async () => {
+        const cwd = await mkdtemp(join(tmpdir(), 'combo-scope-err-'));
+        try {
+            const program = createProgram({
+                cwd,
+                env: {},
+                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
+                stdout: () => undefined,
+            });
+
+            await expect(
+                program.parseAsync(['combo', cwd, 'frontend-flow', '--global', '--tool', 'cursor'], { from: 'user' }),
+            ).rejects.toThrow("Combo 'Frontend Flow Setup' is scoped for 'project' only");
+        } finally {
+            await rm(cwd, { recursive: true, force: true });
+        }
+    });
 });
```

---

## Section 3. Test Cases & Verification

### Automated Tests
1. **Core Combo Unit Tests**: `npx vitest run test/core/combo.test.ts`
   - Result: `PASS` - 17/17 tests passed (including scope & agent matching predicates).
2. **Combo Command Integration Tests**: `npx vitest run test/commands/combo/combo.test.ts`
   - Result: `PASS` - 5/5 tests passed (including project combo rejection in global mode).
3. **Global Commands Integration Test Suite**: `npx vitest run test/commands/global-commands.test.ts`
   - Result: `PASS` - 5/5 tests passed.
4. **Full Test Suite & Lints**:
   - `npm test`: `PASS` - 56 test files passed, 252 tests passed 100%.
   - `npm run format:check`: `PASS` - All files conform to Prettier code style.
   - `npm run build`: `PASS` - Clean compilation and bundle generated without error.

### Manual Checks
1. Verified `node dist/src/index.js combo frontend-flow --global --tool cursor`:
   - Correctly throws: `Error: Combo 'Frontend Flow Setup' is scoped for 'project' only and cannot be installed in global mode.`
2. Verified interactive prompt format labels:
   - Badges formatted as `[Global/Project]` or `[Project]`, and `[Agents: ...]` or `[All Agents]`.
