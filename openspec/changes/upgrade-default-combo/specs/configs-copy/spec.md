## ADDED Requirements

### Requirement: Copy Configuration Templates
The system SHALL recursively copy configuration files and subdirectories from `libraries/configs/` to the target project directory, preserving the folder structure.

#### Scenario: Copy openspec/config.yaml template to project directory
- **GIVEN** `libraries/configs/openspec/config.yaml` exists in the CLI libraries
- **WHEN** the `init` command execution phase runs
- **THEN** it copies the contents of `libraries/configs/` recursively to the project root directory `<projectDir>/`
- **AND** it results in the file `<projectDir>/openspec/config.yaml` being created with the template content
