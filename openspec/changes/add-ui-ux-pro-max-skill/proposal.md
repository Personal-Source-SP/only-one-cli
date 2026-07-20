## Why

Provide UI/UX design intelligence and automated auditing directly within only-one-cli. This allows developers to install the ui-ux-pro-max skill to their agent tools (e.g. Claude Code, Cursor) to ensure design consistency, accessibility, and high-fidelity layouts in their projects.

## What Changes

- Import and add the `ui-ux-pro-max` skill directory to `libraries/skills/`.
- Ensure all files (`SKILL.md`, database files under `data/`, reference files under `references/`, and search script under `scripts/`) are included and properly syncable by the `only-one skill` command.

## Capabilities

### New Capabilities

- `ui-ux-pro-max-skill`: The ui-ux-pro-max skill is successfully made available in the libraries/skills directory and can be installed via only-one CLI to supported agent tools.

### Modified Capabilities

<!-- None -->

## Impact

- `libraries/skills/ui-ux-pro-max/`: New directory containing the skill definitions.
- CLI sync behaviour: Syncing skills will now copy the subdirectories and files of `ui-ux-pro-max` correctly to the target tool's skills path.
