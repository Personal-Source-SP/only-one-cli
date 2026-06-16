## ADDED Requirements

## MODIFIED Requirements

### Requirement: Libraries Directory Structure
Rule: The `libraries/` directory SHALL follow a fixed layout: `skills/`, `templates/`, `packages/`.

#### Scenario: New init reads from libraries layout
- **GIVEN** a freshly checked-out `only-one` project
- **WHEN** the init command starts
- **THEN** it scans `libraries/skills/` for available skill dirs
- **AND** it scans `libraries/packages/*.yaml` for available packages

#### Scenario: Packaged init reads from libraries layout
- **GIVEN** a packaged `only-one` installation
- **WHEN** the init command starts
- **THEN** it scans the packaged `libraries/skills/` for available skill dirs
- **AND** it scans the packaged `libraries/packages/*.yaml` for available packages

#### Scenario: Missing subdirectory
- **GIVEN** `libraries/skills/` is empty or missing
- **WHEN** the init command reaches the skills step
- **THEN** it skips the skills step with a message "No skills available"

#### Scenario: Missing packages directory
- **GIVEN** `libraries/packages/` is empty or missing
- **WHEN** the init command reaches the packages step
- **THEN** it skips the packages step with a message "No packages available"

## REMOVED Requirements
