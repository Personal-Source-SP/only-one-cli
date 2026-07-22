# init-interactive-flow Specification

## Purpose
TBD - created by archiving change improve-init-flow. Update Purpose after archive.
## Requirements
### Requirement: Tool Multi-Select
Rule: User SHALL pick one or more agent tools from Antigravity, Claude, Cursor, and Codex using shared target-selection behavior, with clear configured and detected status badges for each displayed tool.

#### Scenario: Display all installable tools with status badges
- **GIVEN** the `AI_TOOLS` list has multiple tools
- **AND** one or more allowed tools already have configuration directories present
- **WHEN** the init command reaches an only-one-owned tools step
- **THEN** it displays Antigravity, Claude, Cursor, and Codex as selectable options
- **AND** it shows `(configured)` next to already initialized tools
- **AND** the user can search/filter by tool name
- **AND** no tool outside the allowed set is displayed

#### Scenario: Select multiple tools
- **GIVEN** the interactive prompt is shown
- **WHEN** the user selects Cursor and Claude
- **AND** confirms the selection
- **THEN** both tools are stored for the summary step

#### Scenario: Skip tools step
- **GIVEN** the `--skip tools` flag is passed
- **WHEN** the init command starts
- **THEN** it skips the tools step with no tools selected

#### Scenario: Empty selection not allowed without --yes
- **GIVEN** the tools prompt is shown
- **WHEN** the user confirms with nothing selected
- **THEN** the prompt shows a validation error requiring at least one tool

#### Scenario: OpenSpec-owned tool selection
- **GIVEN** init delegates standard tool initialization to OpenSpec
- **WHEN** `openspec init` performs its own selection
- **THEN** only-one does not replace or duplicate that external prompt
- **AND** validates consumed tool IDs before project-specific artifact installation

### Requirement: Tool Existence Check
Rule: The system SHALL check if the tool's config directory already exists in the project and mark it for warning in the final summary.

#### Scenario: Tool config dir already exists warning
- **GIVEN** the project already has `.cursor/` directory
- **WHEN** the user selects "Cursor" in the tools step
- **THEN** "Cursor" is flagged in the final summary as an overwrite warning

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

