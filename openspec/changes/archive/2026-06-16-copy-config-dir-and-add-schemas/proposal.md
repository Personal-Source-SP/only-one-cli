## Why

The `idsd-flow` combo is missing the `openspec/schemas` directory, which is crucial for schema-driven development in target workspaces. Additionally, the configuration copying logic in the CLI currently copies individual files rather than copying entire folders, limiting capability when configurations contain multiple subdirectories and files.

## What Changes

- Add the `schemas` directory under `libraries/configs/openspec/` containing the OpenSpec schemas.
- Update `libraries/configs/index.yaml` to specify copying the entire `openspec` folder instead of just `openspec/config.yaml`.
- Ensure CLI configuration copying logic robustly supports copying whole folders recursively and handles any folder structure cleanly.

## Capabilities

### Modified Capabilities

- `configs-copy`: Upgraded to copy the entire configuration folders recursively from `libraries/configs/` to the project directory based on the index mappings.

## Impact

- CLI configuration copy mechanism: Copies entire directory trees.
- `libraries/configs/index.yaml`: Updated mapping from file-level to directory-level.
- New schema files added to libraries config templates.
