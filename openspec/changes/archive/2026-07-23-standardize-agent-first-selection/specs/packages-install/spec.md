## MODIFIED Requirements

### Requirement: Package Existence Check
Rule: The CLI SHALL check whether a package is installed before installation and SHALL require interactive verification before reinstalling an existing package.

#### Scenario: Check global package
- **GIVEN** `@fission-ai/openspec` has global scope
- **WHEN** package existence is checked
- **THEN** npm checks `@fission-ai/openspec` globally
- **WHEN** it finds the package
- **THEN** the package is marked existing

#### Scenario: Check local package
- **GIVEN** a selected package has local scope
- **WHEN** package existence is checked
- **THEN** npm checks its declared package name in the project directory
- **WHEN** it finds the package
- **THEN** the package is marked existing

#### Scenario: Verify existing package interactively
- **GIVEN** a selected package is already installed
- **AND** interactive verification is available
- **WHEN** package installation is prepared
- **THEN** the user is asked whether to reinstall it
- **AND** it is reinstalled only after user confirmation

#### Scenario: Skip existing package non-interactively
- **GIVEN** a selected package is already installed
- **AND** interactive verification is unavailable
- **WHEN** an explicit package plan executes
- **THEN** the existing package is skipped
- **AND** remaining new packages continue installing
- **AND** the skip appears in the result
