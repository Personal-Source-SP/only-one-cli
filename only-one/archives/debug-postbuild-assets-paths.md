---
id: debug-postbuild-assets-paths
title: Fix Postbuild Path Mapping for 3-Domain Assets Restructuring
domain: cli
triggers:
  - "scripts/postbuild-paths.cjs"
  - "dist/assets/**"
  - "src/core/ignore/**"
archived_at: 2026-10-26T21:30:00+07:00
status: active
references:
  - only-one/archives/asset-versioning-and-sync-systems.md
affected_modules:
  - scripts/postbuild-paths.cjs
  - src/core/ignore/index.ts
  - test/core/postbuild-paths.test.ts
---

# Archive: Fix Postbuild Path Mapping for 3-Domain Assets Restructuring

## 1. Problem & Core Value
- **Problem**: Running built CLI (`node dist/src/index.js` or `only-one tui`) failed with `ERR_MODULE_NOT_FOUND` because `scripts/postbuild-paths.cjs` used a flat alias replacement (`@assets/` -> `../../assets/`) that failed to mirror the 3-domain restructured assets directory (`dist/assets/templates/ignore/`).
- **Value**: Restores 100% build reliability and distribution launch capability by introducing explicit domain subpath mappings in the postbuild ESM transformer.

## 2. Key Architecture & Decisions
- **Domain Subpath Mapping**: Configured `domainMappings` table in `scripts/postbuild-paths.cjs` mapping aliases (`@assets/ignore/` -> `templates/ignore/`, `@assets/skills/` -> `agents/skills/`, `@assets/rules/` -> `agents/rules/`, etc.) directly to their active locations.
- **Direct Import Seam**: Updated `src/core/ignore/index.ts` to reference `@assets/templates/ignore/index.js` directly.

## 3. Scope & Key Changes
- [`scripts/postbuild-paths.cjs`](file:///d:/Sources/PERSONAL/only-one-cli/scripts/postbuild-paths.cjs): Added domain-aware path mapping to regex replacements.
- [`src/core/ignore/index.ts`](file:///d:/Sources/PERSONAL/only-one-cli/src/core/ignore/index.ts): Updated import target to domain alias.
- [`test/core/postbuild-paths.test.ts`](file:///d:/Sources/PERSONAL/only-one-cli/test/core/postbuild-paths.test.ts): Added test assertions for domain path transformations.

## 4. Verification Evidence & PR
- **Test Status**: 100% Passed.
  - `node dist/src/index.js --help` succeeded with exit code 0.
  - `node dist/src/index.js tui --help` succeeded without module loader errors.
  - `npm test test/core/postbuild-paths.test.ts` passed (3/3).
- **PR URL / Branch**: Mainline fix.
