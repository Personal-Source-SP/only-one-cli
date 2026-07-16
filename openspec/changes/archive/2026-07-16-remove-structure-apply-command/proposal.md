## Why

`structure-apply` exposes a workflow that is no longer part of the intended `only-one` CLI surface, while its bundled agent skill continues to direct agents toward that command. Removing both prevents stale help text, invalid generated workflows, and remaining user-facing `hybrid-index` branding from this command path.

## What Changes

- **BREAKING** Remove the `only-one structure-apply` command from CLI registration and exports.
- Remove command implementation and command-specific types.
- Remove `only-one-structure-apply` skill/template generation and installation.
- Make structure skill presence and installation depend only on `structure-generate` artifacts.
- Remove `structure-apply` documentation and update affected tests.
- Audit source, build output, packed npm contents, and installed CLI help for `hybrid-index`, `hybridIndex`, and `HybridIndex` variants.
- Remove active user-facing `hybrid-index` branding found by the audit; classify any retained internal or historical identifiers explicitly.
- Preserve archived OpenSpec records as historical artifacts.

## Capabilities

### New Capabilities

- `legacy-branding-audit`: Define checks and acceptance criteria for detecting, classifying, and removing active user-facing `hybrid-index` branding across source, build, package, and runtime surfaces.

### Modified Capabilities

- `skills-install`: Stop installing and requiring the `only-one-structure-apply` skill and generated command artifact.

## Impact

- CLI users can no longer invoke `only-one structure-apply`.
- Agent artifact installation produces only the supported structure-generation workflow.
- User-facing source, CLI help, build output, and packed npm contents must not expose stale `hybrid-index` branding.
- Internal identifiers and archived records found by the audit must either be renamed or documented as intentionally retained.
- Affected areas include CLI command registration, command exports, structure agent skill checks/installers, templates, README documentation, scripts, package output, and tests.
- No dependency or persisted config format changes are required.
