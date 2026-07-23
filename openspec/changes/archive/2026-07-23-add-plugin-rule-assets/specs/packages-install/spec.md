## MODIFIED Requirements

### Requirement: Select Packages
Rule: The CLI SHALL allow users to select npm-installable packages from `assets/packages` by stable package ID.

#### Scenario: Display available npm packages
- **GIVEN** npm package manifests exist in the package registry
- **WHEN** package selection is displayed
- **THEN** each npm package is shown with its description
- **AND** plugin IDs such as `superpowers` are not shown

#### Scenario: Select explicit packages
- **GIVEN** one or more valid package IDs are provided
- **WHEN** the package flow runs
- **THEN** those npm packages are queued without showing package selection

#### Scenario: Reject plugin ID as package
- **GIVEN** `superpowers` exists only in the plugin registry
- **WHEN** the user supplies `superpowers` to package selection
- **THEN** package selection rejects it as an unknown package
- **AND** no plugin or npm action runs

### Requirement: Install Selected Packages
Rule: The CLI SHALL install selected packages through npm and SHALL keep agent plugin actions outside package installation.

#### Scenario: Install global package
- **GIVEN** a selected package has global scope
- **WHEN** package installation runs
- **THEN** npm installs its declared npm package name globally

#### Scenario: Install local package
- **GIVEN** a selected package has local scope
- **WHEN** package installation runs
- **THEN** npm installs its declared npm package name in the target project

#### Scenario: Never install Superpowers through npm
- **GIVEN** package installation runs for any selection
- **WHEN** npm commands are prepared
- **THEN** no command checks or installs npm package `superpowers`

### Requirement: Package Existence Check
Rule: The CLI SHALL check npm package existence according to each package's local or global scope before installation.

#### Scenario: Check global package
- **GIVEN** a selected package has global scope
- **WHEN** package existence is checked
- **THEN** npm checks the declared package name globally

#### Scenario: Check local package
- **GIVEN** a selected package has local scope
- **WHEN** package existence is checked
- **THEN** npm checks the declared package name in the target project
