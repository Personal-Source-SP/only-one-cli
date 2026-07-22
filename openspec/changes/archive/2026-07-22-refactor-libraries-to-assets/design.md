## Context

The `only-one-cli` currently reads package configurations, combos, MCP servers, and VS Code settings from YAML and JSON files inside a `libraries` folder at runtime. This causes extra disk I/O, potential parsing errors, and lacks static type safety. This design outlines the migration to TypeScript-managed configurations inside `src/core/assets/`, renaming the physical folder to `assets/` to store physical template assets (like skills and workflows), and implementing dependency checks between workflows and skills.

## Goals / Non-Goals

**Goals:**
- Rename `libraries/` to `assets/` at the root.
- Move packages, combos, MCP configs, and VS Code settings/extensions to TypeScript modules in `src/core/assets/` under type definitions defined in `src/core/assets/types.ts`.
- Move workflow `.md` files to a dedicated `assets/workflows/` folder.
- Implement two-way dependency flows: automatically selecting required skills when installing workflows, and prompting for associated workflows when installing skills.

**Non-Goals:**
- Do not convert markdown-based files (like `SKILL.md`, references, and workflow guidelines) into TypeScript strings. They will remain as physical files under `assets/` to be copied.

## Decisions

- **TypeScript Configuration Modules**: Convert `.json` and `.yaml` registry files into TypeScript modules. They will be bundled into the package distribution and imported directly, removing dependencies on runtime YAML/JSON parsing libraries and reducing disk I/O.
- **Dedicated Workflow and Skill Relations**: Define `WORKFLOWS` and `SKILLS` manifests that map workflows to their required skills and vice-versa, making it easy to enforce these dependencies in interactive CLI prompts.

## Risks / Trade-offs

- **Risk**: Renaming `libraries` to `assets` might break paths in the published package or build configurations.
- **Mitigation**: Update `"files"` list in `package.json` to include `"assets"` instead of `"libraries"`. Update all `publish.js` and `publish-npm.sh` scripts, and verify by running `npm run publish:local` and performing manual validation.

## Migration Plan

1. Rename folder `libraries` to `assets`.
2. Delete the converted `.yaml` and `.json` registry files.
3. Write the new TS assets and type definitions in `src/core/assets/`.
4. Refactor the CLI command/flow code to import the TS assets.
5. Update build and publish scripts, package.json files.
6. Verify and compile.

## Open Questions

None.
