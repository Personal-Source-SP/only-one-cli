## MODIFIED Requirements

### Requirement: Tool Multi-Select
Rule: User SHALL pick one or more agent tools from Antigravity, Claude, Cursor, and Codex using shared target-selection behavior, with clear configured and detected status badges for each displayed tool.

#### Scenario: Display all installable tools with status badges
- **GIVEN** the `AI_TOOLS` list has multiple tools
- **AND** one or more allowed tools already have configuration directories present
- **WHEN** the init command reaches an only-one-owned tools step
- **THEN** it displays Antigravity, Claude, Cursor, and Codex as selectable options
- **AND** every compatible tool is selected by default
- **AND** it shows `(configured)` next to already initialized tools
- **AND** the user can search or filter by tool name
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

#### Scenario: Empty selection is not allowed
- **GIVEN** the tools prompt is shown
- **WHEN** the user confirms with nothing selected
- **THEN** the prompt shows a validation error requiring at least one tool

#### Scenario: OpenSpec-owned tool selection
- **GIVEN** init delegates standard tool initialization to OpenSpec
- **WHEN** `openspec init` performs its own selection
- **THEN** only-one does not replace or duplicate that external prompt
- **AND** validates consumed tool IDs before project-specific artifact installation

#### Scenario: Missing tools in non-interactive init
- **GIVEN** an enabled init step requires tools
- **AND** explicit tool IDs are absent
- **AND** interactive prompts are unavailable
- **WHEN** init validates its plan
- **THEN** init fails before side effects
- **AND** reports the missing tool option and valid IDs

### Requirement: Pre-execution Summary and Confirmation
Rule: Interactive init SHALL present a clear summary and require final confirmation before side effects; non-interactive init SHALL execute only a complete explicit plan.

#### Scenario: Show summary and confirm execution
- **GIVEN** the user has selected tools, packages, and skills through interactive flow
- **WHEN** the wizard reaches final confirmation
- **THEN** it displays all selections, existing-resource warnings, and planned `.gitignore` changes
- **AND** prompts the user to confirm execution
- **WHEN** the user confirms
- **THEN** it performs selected changes and reports progress

#### Scenario: Show summary and decline execution
- **GIVEN** interactive selection is complete
- **WHEN** the user declines final confirmation
- **THEN** init stops with `Initialization cancelled`
- **AND** no files, packages, or `.gitignore` entries are changed

#### Scenario: Execute complete explicit plan non-interactively
- **GIVEN** every enabled init step has explicit component and target IDs
- **AND** interactive prompts are unavailable
- **WHEN** init validates the plan
- **THEN** it executes new resources without a final prompt
- **AND** skips existing resources that require verification

#### Scenario: Reject incomplete explicit plan non-interactively
- **GIVEN** at least one enabled init step lacks required explicit selection
- **AND** interactive prompts are unavailable
- **WHEN** init validates the plan
- **THEN** it fails before side effects
- **AND** reports each missing selection
