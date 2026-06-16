# init-interactive-flow Specification

## Purpose
TBD - created by archiving change improve-init-flow. Update Purpose after archive.
## Requirements
### Requirement: Tool Multi-Select
Rule: User SHALL pick one or more agent tools from the full `AI_TOOLS` list using an interactive multi-select prompt, which displays clear configured and detected status badges for each tool.

#### Scenario: Display all installable tools with status badges
- **GIVEN** the `AI_TOOLS` list has multiple tools
- **AND** some tools already have their configuration directories present
- **WHEN** the init command reaches the tools step
- **THEN** it displays each available tool as a selectable option
- **AND** it shows `(configured)` next to already initialized tools
- **AND** the user can search/filter by tool name

#### Scenario: Select multiple tools
- **GIVEN** the interactive prompt is shown
- **WHEN** the user presses Space on "Cursor" and "Claude Code"
- **THEN** both tools are marked as selected
- **WHEN** the user presses Enter
- **THEN** the selection is confirmed and stored for the summary step

#### Scenario: Skip tools step
- **GIVEN** the `--skip tools` flag is passed
- **WHEN** the init command starts
- **THEN** it skips the tools step with no tools selected

#### Scenario: Empty selection not allowed without --yes
- **GIVEN** the tools prompt is shown
- **WHEN** the user presses Enter with nothing selected
- **THEN** the prompt shows a validation error: "Select at least one tool"

### Requirement: Tool Existence Check
Rule: The system SHALL check if the tool's config directory already exists in the project and mark it for warning in the final summary.

#### Scenario: Tool config dir already exists warning
- **GIVEN** the project already has `.cursor/` directory
- **WHEN** the user selects "Cursor" in the tools step
- **THEN** "Cursor" is flagged in the final summary as an overwrite warning

### Requirement: Pre-execution Summary and Confirmation
Rule: The init command SHALL present a clear summary of all chosen configurations, warnings for existing resources, and prompt the user for final confirmation before executing any side effects (installations, file writes).

#### Scenario: Show summary and confirm execution
- **GIVEN** the user has selected tools, packages, and skills (either via Combo or Custom flow)
- **WHEN** the wizard reaches the final confirmation step
- **THEN** it displays a detailed summary of all selections (indicating if a combo was used)
- **AND** it warns which items already exist (will be overwritten or reinstalled)
- **AND** it prompts the user to confirm: "Proceed with the above changes?"
- **WHEN** the user confirms
- **THEN** it performs the installation and copying, showing detailed progress

#### Scenario: Show summary and decline execution
- **GIVEN** the user has selected tools, packages, and skills (either via Combo or Custom flow)
- **WHEN** the wizard prompts for confirmation and the user declines
- **THEN** it aborts execution with "Initialization cancelled"
- **AND** no files are changed or packages installed

#### Scenario: Auto-confirm with --yes
- **GIVEN** the `--yes` flag is passed
- **WHEN** the configuration summary is generated
- **THEN** it does not show the confirmation prompt
- **AND** it automatically executes all changes

