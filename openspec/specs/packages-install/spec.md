# packages-install Specification

## Purpose
TBD - created by archiving change improve-init-flow. Update Purpose after archive.
## Requirements
### Requirement: Select Packages
SHALL allow user to pick packages from `libraries/packages/*.yaml` manifest files via multi-select prompt.

#### Scenario: Display all available packages
- **GIVEN** `libraries/packages/openspec.yaml` exists
- **WHEN** the init command reaches the packages step
- **THEN** "OpenSpec CLI" is shown as a selectable option with description

#### Scenario: Select multiple packages
- **GIVEN** multiple `.yaml` files in `libraries/packages/`
- **WHEN** the user selects two packages and confirms
- **THEN** both packages are queued for installation

#### Scenario: No packages available
- **GIVEN** `libraries/packages/` is empty or missing
- **WHEN** the init command reaches the packages step
- **THEN** it prints "No packages available" and skips to the skills step

#### Scenario: Skip packages step
- **GIVEN** `--skip packages` flag is passed
- **WHEN** the init command runs
- **THEN** the packages step is skipped entirely

### Requirement: Install Selected Packages
SHALL install each selected package via npm after confirmation.

#### Scenario: Install global package
- **GIVEN** "openspec" package has `scope: global` in its manifest
- **WHEN** the install phase executes
- **THEN** `npm install -g @fission-ai/openspec` is run

#### Scenario: Install local package
- **GIVEN** "mypkg" package has `scope: local` in its manifest
- **WHEN** the install phase executes
- **THEN** `npm install mypkg` is run in the project directory

#### Scenario: Package already installed globally
- **GIVEN** `@fission-ai/openspec` is already installed globally
- **WHEN** the user selects "openspec" in packages step
- **THEN** a confirmation asks: "@fission-ai/openspec already installed. Reinstall?"
- **WHEN** user confirms
- **THEN** `npm install -g @fission-ai/openspec` runs again
- **WHEN** user declines
- **THEN** the package is removed from the install queue

#### Scenario: npm install fails
- **GIVEN** npm install exits with non-zero code
- **WHEN** the install phase runs
- **THEN** an error message is printed with the npm error details
- **AND** the init continues with remaining steps

#### Scenario: Package post-install initialization command execution
- **GIVEN** `@fission-ai/openspec` package is installed successfully during init
- **AND** a list of agent tools/CLIs is selected in the Tools configuration step (Step 1)
- **WHEN** the package execution completes
- **THEN** the init command runs `openspec init --tools <selectedTools>` with the comma-separated list of selected tools

### Requirement: Package Existence Check
SHALL check if a package is already installed before attempting installation.

#### Scenario: Check global package
- **GIVEN** `@fission-ai/openspec` has `scope: global`
- **WHEN** the init command checks existence
- **THEN** it runs `npm list -g @fission-ai/openspec --depth=0`
- **WHEN** it finds the package
- **THEN** the existence flag is set to true

#### Scenario: Check local package
- **GIVEN** a package with `scope: local` is selected
- **WHEN** the init command checks existence
- **THEN** it runs `npm list mypkg --depth=0` in the project dir
- **WHEN** it finds the package
- **THEN** the existence flag is set to true

#### Scenario: --yes auto-installs without confirmation
- **GIVEN** `--yes` flag is passed
- **WHEN** a package is selected and already installed
- **THEN** no confirmation prompt is shown
- **AND** the package is queued for reinstall

