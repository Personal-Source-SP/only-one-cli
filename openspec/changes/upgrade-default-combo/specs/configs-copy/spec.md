## ADDED Requirements

### Requirement: Copy Configuration Templates
The system SHALL copy configuration files from `libraries/configs/` using the mappings defined in `libraries/configs/index.yaml` for the selected combos or manual user choices.

#### Scenario: Copy openspec configuration template specified in combo using index mapping
- **GIVEN** `libraries/configs/openspec/config.yaml` exists in the CLI libraries
- **AND** `libraries/configs/index.yaml` exists and defines `openspec` with file source `openspec/config.yaml` and destination `openspec/config.yaml`
- **AND** the selected combo lists `"openspec"` in its `configs` field
- **WHEN** the `init` command execution phase runs
- **THEN** it reads the mapping from the index file and copies `libraries/configs/openspec/config.yaml` to `<projectDir>/openspec/config.yaml`

#### Scenario: Interactively select and copy configuration templates in custom flow
- **GIVEN** custom setup method is selected
- **AND** `libraries/configs/index.yaml` lists available configs
- **WHEN** the `init` command reaches Step 4 (Configuration Templates)
- **THEN** it prompts the user to select templates from a multi-select list
- **WHEN** the user selects `"openspec"`
- **THEN** it maps and copies `libraries/configs/openspec/config.yaml` to `<projectDir>/openspec/config.yaml` during execution
