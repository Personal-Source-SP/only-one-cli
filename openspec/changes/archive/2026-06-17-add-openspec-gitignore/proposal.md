## Why

When initializing a project, the default `.gitignore` update logic appends agent tool/config patterns under a CLI generated section. We want to align the generated section header and default ignored paths to standard AI ignore conventions.

## What Changes

- Update the automatic `.gitignore` generation/update logic to use `# AI ignores` as the section header instead of `# Only One CLI generated ignores`.
- Ensure the default ignores always include `.agent/`, `openspec/`, `adr`, and `openspec`.

## Capabilities

### New Capabilities
- `openspec-gitignore-ignore`: Automatically include the requested default AI ignores in `.gitignore` under the `# AI ignores` header.

### Modified Capabilities
- `init-interactive-flow`: Update interactive initialization to automatically include the updated ignore pattern and header.
- `init-combo-flow`: Update combo-driven initialization to automatically include the updated ignore pattern and header.
- `init-subcommands`: Update subcommand-driven initialization to automatically include the updated ignore pattern and header.

## Impact

- `src/core/init/gitignore.ts` (modifies the header and default paths to append)
- `src/core/init/init-command.ts` (modifies gitignore paths collection)

