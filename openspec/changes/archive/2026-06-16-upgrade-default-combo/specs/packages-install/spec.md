## MODIFIED Requirements

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
