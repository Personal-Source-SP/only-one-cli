## MODIFIED Requirements

### Requirement: Tool Multi-Select
Rule: Init SHALL select one or more allowed agents once before setup-mode or component selection and SHALL reuse that selection throughout the plan.

#### Scenario: Select agents first
- **GIVEN** the user runs `only-one init`
- **WHEN** interactive init begins
- **THEN** agent selection is the first configuration prompt
- **AND** it lists only Antigravity, Claude, Cursor, and Codex

#### Scenario: Reuse selected agents
- **GIVEN** the user selected multiple agents
- **WHEN** combo or custom component selection continues
- **THEN** MCP, skill, plugin, and rule categories use that same agent set
- **AND** no category prompts for agents again

#### Scenario: Ignore unsupported category-agent pair
- **GIVEN** a selected agent does not support one component category
- **WHEN** init reaches that category
- **THEN** no asset prompt is shown for that agent and category
- **AND** the unsupported pair is not treated as failure

### Requirement: Setup Method Selection
Rule: After agent selection, init SHALL require the user to choose either one combo or custom component selection.

#### Scenario: Choose setup method
- **GIVEN** agent selection is complete
- **WHEN** setup method is requested
- **THEN** UI offers Combo and Custom
- **AND** no component side effect has occurred

#### Scenario: Choose combo
- **GIVEN** the user chooses Combo
- **WHEN** combo selection is displayed
- **THEN** exactly one combo may be selected
- **AND** its components are planned through shared component planners

#### Scenario: Choose custom
- **GIVEN** the user chooses Custom
- **WHEN** custom selection starts
- **THEN** categories appear in order Package, Config, MCP, Skill, Plugin, Rule
- **AND** each category may be confirmed with no asset selected to skip it

### Requirement: Pre-execution Summary and Confirmation
Rule: Init SHALL display one complete category-grouped summary and require one explicit confirmation before every side effect.

#### Scenario: Show complete summary
- **GIVEN** selection and dependency expansion are complete
- **WHEN** init reaches confirmation
- **THEN** summary groups items by category
- **AND** distinguishes selected and auto-required items
- **AND** marks new and existing state per effective destination where supported
- **AND** lists plugin planned actions without new or existing labels

#### Scenario: Confirm execution once
- **GIVEN** the complete summary is visible
- **WHEN** the user confirms execution
- **THEN** init executes the frozen plan
- **AND** no later selection, overwrite, reinstall, or dependency confirmation is shown

#### Scenario: Decline execution
- **GIVEN** the complete summary is visible
- **WHEN** the user declines execution
- **THEN** init reports cancellation
- **AND** leaves project and global state unchanged

#### Scenario: Headless init cannot confirm
- **GIVEN** init has explicit selections
- **AND** interactive confirmation is unavailable
- **WHEN** init reaches the complete plan
- **THEN** it does not execute
- **AND** reports that init requires interactive confirmation and standalone commands should be used for automation
