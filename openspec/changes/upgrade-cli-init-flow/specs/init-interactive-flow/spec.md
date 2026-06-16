## ADDED Requirements

### Requirement: Automatic Gitignore Update
Rule: The system SHALL automatically append configuration directories of selected tools or skills to the project's `.gitignore` file unless disabled by the user.

#### Scenario: Automatically append configured tool directory to gitignore
- **GIVEN** the user initializes the "Cursor" tool
- **AND** the tool's config directory is `.cursor`
- **AND** the `.gitignore` file exists
- **WHEN** the initialization executes
- **THEN** it appends `.cursor/` to `.gitignore` under a marked section

#### Scenario: Disable gitignore update using --no-ignore flag
- **GIVEN** the `--no-ignore` option is passed
- **WHEN** the initialization executes
- **THEN** it does not modify the `.gitignore` file

## MODIFIED Requirements

### Requirement: Pre-execution Summary and Confirmation
Rule: The init command SHALL present a clear summary of all chosen configurations, warnings for existing resources, the list of folders that will be added to `.gitignore`, and prompt the user for final confirmation before executing any side effects.

#### Scenario: Show summary and confirm execution
- **GIVEN** the user has selected tools, packages, and skills (either via Combo or Custom flow)
- **WHEN** the wizard reaches the final confirmation step
- **THEN** it displays a detailed summary of all selections (indicating if a combo was used)
- **AND** it warns which items already exist (will be overwritten or reinstalled)
- **AND** it lists which files/folders will be added to `.gitignore`
- **AND** it prompts the user to confirm: "Proceed with the above changes?"
- **WHEN** the user confirms
- **THEN** it performs the installation, copying, and gitignore updates, showing detailed progress

#### Scenario: Show summary and decline execution
- **GIVEN** the user has selected tools, packages, and skills (either via Combo or Custom flow)
- **WHEN** the wizard prompts for confirmation and the user declines
- **THEN** it aborts execution with "Initialization cancelled"
- **AND** no files are changed, packages installed, or `.gitignore` updated

#### Scenario: Auto-confirm with --yes
- **GIVEN** the `--yes` flag is passed
- **WHEN** the configuration summary is generated
- **THEN** it does not show the confirmation prompt
- **AND** it automatically executes all changes including `.gitignore` updates

## REMOVED Requirements
