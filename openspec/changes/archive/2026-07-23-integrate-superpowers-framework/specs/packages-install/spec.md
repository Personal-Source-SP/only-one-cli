## MODIFIED Requirements

### Requirement: Select Packages
Rule: The CLI SHALL allow users to select packages from the typed package registry by stable package ID.

#### Scenario: Display available packages
- **GIVEN** the package registry contains npm packages and the `superpowers` target-plugin package
- **WHEN** package selection is displayed
- **THEN** each package is shown with its description
- **AND** Superpowers is selectable by stable ID `superpowers`

#### Scenario: Select explicit packages
- **GIVEN** multiple package IDs are available
- **WHEN** the user provides one or more valid package IDs
- **THEN** those packages are queued without showing the package-selection prompt

#### Scenario: Skip packages step
- **GIVEN** `--skip packages` is provided
- **WHEN** init runs
- **THEN** package selection and all package installation actions are skipped

### Requirement: Install Selected Packages
Rule: The CLI SHALL execute each selected package through its declared installer strategy and SHALL report installed, action-required, skipped, and failed outcomes accurately.

#### Scenario: Install npm package
- **GIVEN** a selected package uses the npm installer
- **WHEN** package installation runs
- **THEN** the CLI uses the package's npm name and local or global scope
- **AND** existing npm package behavior remains unchanged

#### Scenario: Install Superpowers for Antigravity
- **GIVEN** Superpowers and Antigravity are selected
- **WHEN** package installation runs
- **THEN** the CLI executes `agy plugin install https://github.com/obra/superpowers`
- **AND** reports Antigravity as installed only when the command succeeds

#### Scenario: Guide Superpowers installation for Claude
- **GIVEN** Superpowers and Claude are selected
- **WHEN** package installation runs
- **THEN** the CLI reports action required for Claude
- **AND** displays `/plugin install superpowers@claude-plugins-official`
- **AND** does not report Claude as installed

#### Scenario: Guide Superpowers installation for Cursor
- **GIVEN** Superpowers and Cursor are selected
- **WHEN** package installation runs
- **THEN** the CLI reports action required for Cursor
- **AND** displays `/add-plugin superpowers`
- **AND** does not report Cursor as installed

#### Scenario: Guide Superpowers installation for Codex
- **GIVEN** Superpowers and Codex are selected
- **WHEN** package installation runs
- **THEN** the CLI reports action required for Codex
- **AND** instructs the user to open `/plugins`, find `superpowers`, and choose `Install Plugin`
- **AND** does not report Codex as installed

#### Scenario: Never install unrelated npm package
- **GIVEN** Superpowers is selected for any agent target
- **WHEN** package installation runs
- **THEN** the CLI never invokes `npm install superpowers`
- **AND** never checks installation with `npm list superpowers`

#### Scenario: Automatic installer command fails
- **GIVEN** Superpowers and Antigravity are selected
- **AND** the Antigravity installer exits unsuccessfully
- **WHEN** package installation completes
- **THEN** the CLI reports the Antigravity target as failed with command details
- **AND** continues reporting outcomes for other selected targets and packages

### Requirement: Package Existence Check
Rule: The CLI SHALL apply npm existence checks only to packages using the npm installer strategy.

#### Scenario: Check npm package existence
- **GIVEN** a selected package uses the npm installer
- **WHEN** the CLI checks package state
- **THEN** it uses npm list behavior matching the package scope

#### Scenario: Skip npm existence check for Superpowers
- **GIVEN** Superpowers is selected
- **WHEN** the CLI prepares package actions
- **THEN** it does not run an npm existence check for Superpowers
- **AND** delegates plugin lifecycle and update detection to each agent host
