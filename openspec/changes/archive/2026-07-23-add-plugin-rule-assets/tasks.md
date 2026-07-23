## 1. Plugin Asset Domain and Superpowers Migration

- [x] 1.1 Add failing tests for typed plugin manifests, unique IDs, complete supported-target actions, and registry publication.
- [x] 1.2 Add `PluginManifest` and shared command/manual plugin action types under the asset type model.
- [x] 1.3 Create `assets/plugins/index.ts` and move Superpowers target metadata from `assets/packages` into the plugin registry.
- [x] 1.4 Simplify package manifests and package installer code back to npm-only behavior after removing the unused target-plugin strategy.
- [x] 1.5 Replace package-focused Superpowers tests with negative package-registry tests and positive plugin-registry tests.
- [x] 1.6 Add plugin core service and `only-one plugin` command with explicit, automatic, and interactive target selection.
- [x] 1.7 Preserve automatic Antigravity execution and exact manual Claude, Cursor, and Codex guidance with per-target result reporting.

## 2. Rule Asset Domain and Native Adapters

- [x] 2.1 Add failing tests for typed rule manifests, source existence, unique IDs, dependency references, and supported rule targets.
- [x] 2.2 Add `RuleManifest` with `requiredPackages`, `requiredPlugins`, `requiredMcps`, and `requiredSkills` dependency fields.
- [x] 2.3 Create `assets/rules/index.ts` and `assets/rules/context-minimization.md` with the approved planning-time instructions.
- [x] 2.4 Add rule target capability and adapters for Antigravity `.agents/rules`, Claude `.claude/rules`, and Cursor `.cursor/rules`.
- [x] 2.5 Exclude Codex from rule target selection and reject explicit Codex rule installation before side effects.
- [x] 2.6 Add golden path/content tests for all native rule adapters and package-content tests for published plugin/rule assets.

## 3. Rule Dependency Resolution

- [x] 3.1 Add failing preflight tests for unknown dependency IDs, unsupported dependency targets, and zero side effects after validation failure.
- [x] 3.2 Build deterministic dependency plans ordered as packages, plugins, MCPs, skills, then rules.
- [x] 3.3 Deduplicate shared dependencies across selected rules and targets while preserving per-target outcomes.
- [x] 3.4 Reuse package, plugin, MCP, and skill services to execute missing rule dependencies before rule writes.
- [x] 3.5 Propagate automatic dependency failures by skipping dependent rule writes and identifying the failed dependency.
- [x] 3.6 Allow rule writes after manual plugin actions but report installed-not-ready and action-required status.
- [x] 3.7 Verify `context-minimization` queues `@fission-ai/openspec`, `superpowers`, and `gitnexus` exactly once per applicable plan.

## 4. Rule Command and Init Integration

- [x] 4.1 Add failing tests for `only-one rule` explicit IDs, interactive selection, automatic selection, overwrite verification, and structured summary output.
- [x] 4.2 Implement rule existence checks and native file copy behavior using current skill/workflow overwrite conventions where applicable.
- [x] 4.3 Register top-level `only-one rule` and route target selection through rule capability filtering.
- [x] 4.4 Add plugin and rule steps to init orchestration with plugin before rule while retaining dependency queueing across skipped normal steps.
- [x] 4.5 Add integration tests covering Superpowers migration, context-minimization dependency installation, manual plugin readiness, and partial target failures.

## 5. Documentation and Verification

- [x] 5.1 Update README and asset documentation for `assets/plugins`, `assets/rules`, `only-one plugin`, `only-one rule`, native target paths, and dependency behavior.
- [x] 5.2 Remove package terminology from Superpowers documentation and document `only-one plugin ... superpowers` as the supported flow.
- [x] 5.3 Run focused plugin, rule, dependency, package regression, target-selection, and init integration tests.
- [x] 5.4 Run project type-check, lint, full test suite, package build, and packed-assets inspection; fix failures introduced by this change.
- [x] 5.5 Run `openspec validate add-plugin-rule-assets --type change --strict` and resolve every validation error before implementation is marked complete.
