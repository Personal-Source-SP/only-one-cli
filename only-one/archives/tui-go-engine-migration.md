---
id: tui-go-engine-migration
title: Complete Migration to Go Bubble Tea Engine and React Ink Runtime Purge
domain: tui
triggers:
  - "src/tui/**"
  - "src/commands/tui/**"
  - "scripts/build-go.js"
archived_at: 2026-10-26T21:30:00+07:00
status: active
references:
  - only-one/archives/tui-modernization.md
affected_modules:
  - src/tui
  - src/tui/internal/wizard
  - src/tui/bridge.ts
  - src/commands/tui/command.ts
  - src/core/init/init-command.ts
  - scripts/build-go.js
  - package.json
---

# Archive: Complete Migration to Go Bubble Tea Engine and React Ink Runtime Purge

## 1. Problem & Core Value
- **Problem**: Legacy React Ink runtime remained bundled as a fallback in `src/tui`, adding `ink`, `react`, `@types/react` to project dependencies, causing bundle bloat, terminal flicker, and event loop delays. The interactive init wizard also still ran on React Ink rather than native Go.
- **Value**: Completely eliminates React and Ink dependencies from package.json, relocates Go engine from `packages/tui-engine/` into `src/tui/`, introduces native Go 2-pane Init Wizard (`src/tui/internal/wizard`), and delegates all TUI modes (`board` and `init`) directly to the Go binary via a lightweight TypeScript bridge (`src/tui/bridge.ts`).

## 2. Key Architecture & Decisions
- **Go Engine Relocation**: Consolidated Go codebase directly in `src/tui/` with dedicated `go.mod` and `go.sum`, building via `scripts/build-go.js` into `bin/only-one-ui.exe`.
- **Native 2-Pane Init Wizard**: Built `internal/wizard` Bubble Tea model featuring Category Sidebar navigation and Resource Checklist with interactive installation.
- **Complete React Ink Purge**: Removed all React Ink components, hooks, services, and types; removed `ink` and `react` from `package.json`.
- **Direct Bridge Dispatch**: Configured `src/tui/bridge.ts` to locate and execute the compiled binary directly without fallback to Node-based renderers.

## 3. Scope & Key Changes
- [`package.json`](file:///d:/Sources/PERSONAL/only-one-cli/package.json): Removed `ink`, `react`, `@types/react`.
- [`src/tui/`](file:///d:/Sources/PERSONAL/only-one-cli/src/tui): Relocated Go engine to `src/tui/`, added `internal/wizard`, pruned React Ink code.
- [`src/tui/bridge.ts`](file:///d:/Sources/PERSONAL/only-one-cli/src/tui/bridge.ts): Simplified bridge to locate binary and stream stdio.
- [`scripts/build-go.js`](file:///d:/Sources/PERSONAL/only-one-cli/scripts/build-go.js): Updated Go build path to target `src/tui`.
- [`packages/tui-engine/`](file:///d:/Sources/PERSONAL/only-one-cli/packages/tui-engine): Deleted deprecated packages folder.

## 4. Verification Evidence & PR
- **Test Status**: 100% Passed.
  - `npm run build:go`: Compiled `bin/only-one-ui.exe` successfully.
  - `go test ./...` in `src/tui`: All 7 Go packages passed.
  - `npx vitest run`: 64 test files, 263 tests passed, 0 failures.
  - `npm run build`: TypeScript compilation and postbuild paths passed without error.
- **PR URL / Branch**: Mainline migration.
