# init-interactive-flow Specification

## Purpose
TBD - created by archiving change improve-init-flow. Update Purpose after archive.
## Requirements
### Requirement: Tool Multi-Select
Rule: User SHALL pick one or more agent tools from the full `AI_TOOLS` list using an interactive multi-select prompt.

#### Scenario: Display all installable tools
- **GIVEN** the `AI_TOOLS` list has 25+ tools
- **WHEN** the init command reaches the tools step
- **THEN** it displays each available tool as a selectable option
- **AND** the user can search/filter by tool name

#### Scenario: Select multiple tools
- **GIVEN** the interactive prompt is shown
- **WHEN** the user presses Space on "Cursor" and "Claude Code"
- **THEN** both tools are marked as selected
- **WHEN** the user presses Enter
- **THEN** the selection is confirmed and stored for subsequent steps

#### Scenario: Skip tools step
- **GIVEN** the `--skip tools` flag is passed
- **WHEN** the init command starts
- **THEN** it skips the tools step with no tools selected

#### Scenario: Empty selection not allowed without --yes
- **GIVEN** the tools prompt is shown
- **WHEN** the user presses Enter with nothing selected
- **THEN** the prompt shows a validation error: "Select at least one tool"

### Requirement: Tool Existence Check
SHALL check if the tool's config directory already exists in the project before finalizing tool selection.

#### Scenario: Tool config dir already exists
- **GIVEN** the project already has `.cursor/` directory
- **WHEN** the user selects "Cursor" in the tools step
- **THEN** a confirmation prompt asks: "Cursor already configured. Reinstall skills?"
- **WHEN** the user confirms
- **THEN** skills will be overwritten
- **WHEN** the user declines
- **THEN** Cursor is removed from the active selection

#### Scenario: Tool config dir does not exist
- **GIVEN** the project has no `.cursor/` directory
- **WHEN** the user selects "Cursor"
- **THEN** no existence warning is shown
- **AND** Cursor remains selected

#### Scenario: --yes auto-confirms existence
- **GIVEN** `--yes` flag is passed
- **WHEN** `Cursor` is selected and `.cursor/` exists
- **THEN** no confirmation prompt is shown
- **AND** skills are queued for overwrite

