## 1. Package Registry Model

- [x] 1.1 Add failing tests for stable package IDs and discriminated `npm` versus `target-plugin` installer strategies.
- [x] 1.2 Extend the shared package manifest type and remove or synchronize duplicate package types used by init.
- [x] 1.3 Convert existing OpenSpec and UI/UX Pro Max registry entries to the npm installer strategy without changing behavior.
- [x] 1.4 Add Superpowers registry entry with Antigravity command action and Claude, Cursor, and Codex manual actions.
- [x] 1.5 Add a regression test proving Superpowers has no npm package identity and cannot invoke the unrelated npm package named `superpowers`.

## 2. Target-Aware Package Installation

- [x] 2.1 Add failing package-flow tests showing target selection occurs only when at least one selected package uses `target-plugin`.
- [x] 2.2 Reuse shared explicit, automatic, and interactive target selection for target-plugin packages.
- [x] 2.3 Add the package-subcommand target option using the same target ID and CSV conventions as other target-aware commands.
- [x] 2.4 Implement target-plugin action execution with per-target `installed`, `action-required`, `skipped`, and `failed` results.
- [x] 2.5 Execute `agy plugin install https://github.com/obra/superpowers` for Antigravity and report missing executable or non-zero exit accurately.
- [x] 2.6 Render exact official manual installation guidance for Claude, Cursor, and Codex without reporting those targets installed.
- [x] 2.7 Preserve existing npm existence checks, reinstall confirmation, scope behavior, and post-install behavior for npm packages.

## 3. Integration and Documentation

- [x] 3.1 Add integration tests for explicit Superpowers targets, interactive selection, automatic selection, unsupported targets, and mixed npm plus target-plugin package selection.
- [x] 3.2 Add tests showing an Antigravity failure does not hide manual guidance or other package outcomes.
- [x] 3.3 Document Superpowers package selection, automatic Antigravity installation, and required Claude, Cursor, and Codex completion steps.
- [x] 3.4 Update touched package documentation from stale YAML and `libraries/` terminology to the current typed `assets/packages` registry.

## 4. Verification

- [x] 4.1 Run focused package registry, init package, target-selection, and command tests.
- [x] 4.2 Run project type-check, lint, full test suite, and package build; fix failures introduced by this change.
- [x] 4.3 Run `openspec validate integrate-superpowers-framework --type change --strict` and resolve every validation error before implementation is marked complete.
