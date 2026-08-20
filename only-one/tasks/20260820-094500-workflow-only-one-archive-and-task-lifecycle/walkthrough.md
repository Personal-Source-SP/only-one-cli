# Walkthrough: Task Lifecycle Management, Archive Distillation & Maintenance (`/only-one-archive` & `/only-one-clean`)

## 1. Summary of Changes

We implemented a complete task lifecycle and knowledge distillation architecture across the `only-one-cli` repository:

### New Workflows Added
- [`assets/workflows/only-one-archive.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-archive.md): Distills completed tasks into single-file living archive records in `only-one/archives/`, extracts user constraints into `only-one/rules.md`, links direct references, and purges raw task directories. Integrated with `spec-driven-development`, `code-simplification`, and `context-engineering`.
- [`assets/workflows/only-one-clean.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-clean.md): Consolidates domain archives into single unified documents, executes deep logic codebase audits (verifying files, contracts, and flows), and ruthlessly purges stale/outdated archives. Integrated with `source-driven-development`, `doubt-driven-development`, and `code-simplification`.

### Manifest Registration & Workflow Synchronization
- [`assets/workflows/index.ts`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/index.ts): Registered `only-one-archive` and `only-one-clean` with their required skills from `addyosmani/agent-skills`.
- Synced all updated workflows into `.agents/workflows/`.

### Existing Workflows Synchronized
- [`assets/workflows/only-one-apply.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-apply.md): Updated rule path to `only-one/rules.md`, enhanced `walkthrough.md` with Section 4 (*User Constraints & Lessons Learned*), and added recommendation to run `/only-one-archive` upon completion.
- [`assets/workflows/only-one-plan.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-plan.md): Updated rule path to `only-one/rules.md` and added lookup of `only-one/archives/*.md` to inherit previous architecture decisions.
- [`assets/workflows/only-one-idea.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-idea.md): Added archive survey in Step 2 and updated Next Steps to cover the full lifecycle (`plan` $\rightarrow$ `apply` $\rightarrow$ `archive`).
- [`assets/workflows/only-one-debug.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-debug.md): Added archive lookup in Step 2 to accelerate Root Cause Analysis (RCA) and updated rule path in Step 5b.
- [`assets/workflows/only-one-pr-git.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-pr-git.md): Added next step recommendation to run `/only-one-archive` after PR merge.

### Test Suite Enhanced
- [`test/commands/workflow.test.ts`](file:///Users/kiem/Sources/Personal/only-one-cli/test/commands/workflow.test.ts): Added unit tests verifying installation and synchronization of `only-one-archive` and `only-one-clean`.

---

## 2. Verification Results

### Vitest Test Suite Execution
Executed `npm test`:
```text
RUN  v4.1.10 /Users/kiem/Sources/Personal/only-one-cli

✓ test/commands/workflow.test.ts (3 tests) 18ms
✓ test/core/combo.test.ts (12 tests) 15ms
✓ test/commands/skill/skill.test.ts (2 tests) 204ms
✓ test/commands/package.test.ts (1 test) 1263ms
✓ test/commands/init/init.test.ts (11 tests) 1020ms
...
Test Files  47 passed | 2 skipped (49)
     Tests  190 passed | 4 skipped (194)
  Duration  6.58s
```

### Build & Typecheck
Executed `npm run build`:
```text
> only-one@0.0.7 build
> npm run format:check && node -e "require('node:fs').rmSync('dist', { recursive: true, force: true })" && tsc -p tsconfig.json && node scripts/postbuild-paths.cjs && node -e "if (process.platform !== 'win32') require('node:fs').chmodSync('dist/src/index.js', 0o755)"

Checking formatting...
All matched files use Prettier code style!
```

---

## 3. Completion Evidence (Code Diffs & Visual Proof)

### Manifest Registration Diff in `assets/workflows/index.ts`
```diff
+    {
+        name: 'only-one-archive',
+        description: 'Distill completed tasks into concise single-file archives, sync rules, and clean task folders.',
+        requiredSkills: ['spec-driven-development', 'code-simplification', 'context-engineering'],
+    },
+    {
+        name: 'only-one-clean',
+        description: 'Consolidate related archives, verify deep logic against codebase, and purge stale documents.',
+        requiredSkills: ['source-driven-development', 'doubt-driven-development', 'code-simplification'],
+    },
```

---

## 4. User Constraints & Lessons Learned

- **[ARCHIVE DISTILLATION]**: Do not move raw task folders into `archives/`. Always distill into a single clean markdown file (`only-one/archives/<timestamp>-<slug>.md`) and purge the raw task folder (`only-one/tasks/<folder>`) to avoid workspace clutter.
- **[DEEP LOGIC AUDIT]**: In `/only-one-clean`, do not just check file existence. Inspect source code to verify that documented functions, interfaces, contracts, and business flows are 100% accurate against ground truth. Consolidate domains *first*, audit logic *second*, and immediately purge dead/stale archives.
- **[UNIFIED RULES PATH]**: All negative rules and lessons learned must be stored in a single consolidated file `only-one/rules.md` at the project root instead of nested folders.
- **[SKILLS INTEGRATION]**: All workflow markdown files must explicitly contain a `## 1. Skills Catalog` section detailing trigger conditions and core purposes.
