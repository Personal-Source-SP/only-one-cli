## ADDED Requirements

### Requirement: Reusable package planning
Rule: Package service SHALL classify selected packages without installation and expose all package effects required by aggregate init planning.

#### Scenario: Plan package state
- **GIVEN** package IDs are selected
- **WHEN** package planning runs
- **THEN** each package is classified new or existing according to local or global scope
- **AND** no npm installation occurs

#### Scenario: Plan package post-actions
- **GIVEN** a package requires initialization after installation
- **WHEN** package planning runs
- **THEN** required post-actions and affected agents are included in planned details
- **AND** init does not hardcode the package name to discover that action

### Requirement: Plan-driven package execution
Rule: Package execution SHALL consume confirmed package items and post-actions without reselecting packages or prompting.

#### Scenario: Reinstall confirmed existing package
- **GIVEN** an existing package is marked reinstall in a confirmed init plan
- **WHEN** package execution runs
- **THEN** npm reinstalls the declared package
- **AND** its planned post-actions run after successful installation

#### Scenario: Continue after package failure
- **GIVEN** one package installation fails
- **WHEN** other independent planned packages remain
- **THEN** execution attempts the remaining packages
- **AND** reports each package outcome
