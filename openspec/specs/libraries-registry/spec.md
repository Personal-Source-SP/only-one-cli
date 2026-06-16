# libraries-registry Specification

## Purpose
TBD - created by archiving change improve-init-flow. Update Purpose after archive.
## Requirements
### Requirement: Package Manifest Format
SHALL define each installable package by a YAML file in `libraries/packages/`.

#### Scenario: Single package manifest
- **GIVEN** a file `libraries/packages/openspec.yaml`
- **WHEN** the init command reads available packages
- **THEN** it parses the YAML and displays the package as a selectable option

#### Scenario: Manifest with `name` and `scope`
- **GIVEN** `libraries/packages/mypkg.yaml` with content:
  ```yaml
  name: "@scope/mypackage"
  description: "Some package"
  scope: local
  ```
- **WHEN** the init command reads the manifest
- **THEN** it exposes `@scope/mypackage` with install mode `local`

#### Scenario: Default scope is global
- **GIVEN** a manifest file without a `scope` field
- **WHEN** the init command reads the manifest
- **THEN** the package default install mode is `global`

#### Scenario: Invalid YAML manifest
- **GIVEN** a malformed `.yaml` file in `libraries/packages/`
- **WHEN** the init command reads available packages
- **THEN** it skips that file and logs a warning

### Requirement: Libraries Directory Structure
Rule: The `libraries/` directory SHALL follow a fixed layout: `skills/`, `templates/`, `packages/`.

#### Scenario: New init reads from libraries layout
- **GIVEN** a freshly checked-out `only-one` project
- **WHEN** the init command starts
- **THEN** it scans `libraries/skills/` for available skill dirs
- **AND** it scans `libraries/packages/*.yaml` for available packages

#### Scenario: Missing subdirectory
- **GIVEN** `libraries/skills/` is empty or missing
- **WHEN** the init command reaches the skills step
- **THEN** it skips the skills step with a message "No skills available"

#### Scenario: Missing packages directory
- **GIVEN** `libraries/packages/` is empty or missing
- **WHEN** the init command reaches the packages step
- **THEN** it skips the packages step with a message "No packages available"

