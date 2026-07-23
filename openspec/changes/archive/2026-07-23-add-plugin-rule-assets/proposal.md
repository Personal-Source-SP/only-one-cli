## Why

Plugin installers and persistent agent rules are distinct asset domains, but the current implementation models Superpowers as a special target-aware package and has no reusable rule registry or dependency flow. Separating `plugins` and `rules` makes asset intent explicit, keeps npm packages npm-specific, and enables rules to declare the packages, plugins, MCPs, and skills they need.

## What Changes

- Add typed `assets/plugins/` registry and a top-level `only-one plugin` command using shared target selection.
- Move Superpowers from `assets/packages` target-plugin metadata into `assets/plugins` without retaining a package alias.
- Preserve current Superpowers behavior: automatic Antigravity installation and official manual actions for Claude, Cursor, and Codex.
- Simplify package manifests back to npm package concerns after target-plugin behavior moves to plugins.
- Add typed `assets/rules/` registry, Markdown rule assets, target adapters, and a top-level `only-one rule` command.
- Allow rule manifests to declare `requiredPackages`, `requiredPlugins`, `requiredMcps`, and `requiredSkills`; automatically queue missing dependencies before installing a rule.
- Add `context-minimization` rule requiring OpenSpec, Superpowers, and GitNexus before planning or modification.
- Install rules only to verified native rule paths: Antigravity `.agents/rules/`, Claude `.claude/rules/`, and Cursor `.cursor/rules/`; Codex remains unavailable for rule selection because it uses `AGENTS.md` rather than a native rules directory.
- Add focused registry, dependency-resolution, target-filtering, install, migration, and integration tests.

## Capabilities

### New Capabilities

- `plugin-library-registry`: Defines plugin manifests, per-target command/manual actions, and Superpowers plugin metadata.
- `plugins-install`: Defines plugin selection, shared target selection, automatic/manual action execution, and per-target reporting.
- `rule-library-registry`: Defines Markdown rule manifests, native target mappings, and cross-domain dependency declarations.
- `rules-install`: Defines rule selection, recursive dependency queueing, native installation, overwrite checks, and readiness reporting.
- `context-minimization-rule`: Defines planning-time context minimization behavior and its OpenSpec, Superpowers, and GitNexus dependencies.

### Modified Capabilities

- `libraries-registry`: Adds `plugins/` and `rules/` to the typed asset registry layout and returns package manifests to npm-only responsibilities.
- `packages-install`: Removes Superpowers and target-plugin execution from package selection and installation.
- `allowed-tool-selection`: Adds capability-aware target filtering for plugins and native rules.
- `init-subcommands`: Adds top-level `plugin` and `rule` component-management commands and permits init orchestration to invoke their core flows.

## Impact

- Affects shared asset types, package/plugin/rule registries, target capability catalog, CLI registration, dependency orchestration, installers, reporting, tests, and documentation.
- Moves existing uncommitted Superpowers implementation from package files and package installer code into a plugin domain; no compatibility alias remains under `only-one init package`.
- Adds one persistent rule asset and native rule adapters for Antigravity, Claude, and Cursor; Codex plugin support remains available, but Codex rule support is excluded.
- Depends on existing package, skill, MCP, and target-selection services; does not vendor Superpowers content or automate manual host slash commands.
