## Why

`only-one-cli` already installs packages and selects supported agent targets, but its package model assumes every package is installed through npm. Superpowers uses a different plugin installer for each agent, so supporting it requires a small target-aware package extension rather than a native framework implementation.

## What Changes

- Add `superpowers` to the package registry as a target-aware plugin package.
- Extend package manifests to distinguish npm packages from agent-plugin packages and define per-target install actions.
- Reuse existing target selection for Antigravity, Claude, Cursor, and Codex when Superpowers is selected.
- Run `agy plugin install https://github.com/obra/superpowers` automatically for Antigravity.
- Print official completion instructions for Claude, Cursor, and Codex because their plugin installers are slash commands or UI flows that `only-one` cannot execute as child processes.
- Never install the unrelated npm package named `superpowers`.
- Add focused registry, package-selection, target-selection, execution, and guidance tests.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `libraries-registry`: Extends package metadata with stable IDs, installer kinds, supported targets, and target-specific actions.
- `packages-install`: Installs npm packages through npm and Superpowers through target-specific executable or manual actions.
- `init-subcommands`: Adds target selection to the package subcommand when a selected package requires agent targets.
- `allowed-tool-selection`: Applies shared target-selection behavior to target-aware package installation.

## Impact

- Affects package manifest types and registry, package installation flow, package subcommand options, shared target selection usage, output reporting, and focused tests.
- Adds no bundled Superpowers skills, workflow assets, lock manifest, merge engine, update command, or runtime GitHub fetch beyond the official Antigravity installer itself.
- Does not change OpenSpec, `grill-me`, `only-one-plan`, skill installation, workflow installation, or combo definitions.
