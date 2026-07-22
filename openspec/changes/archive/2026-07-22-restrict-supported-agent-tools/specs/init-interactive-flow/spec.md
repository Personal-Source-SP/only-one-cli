## MODIFIED Requirements

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
