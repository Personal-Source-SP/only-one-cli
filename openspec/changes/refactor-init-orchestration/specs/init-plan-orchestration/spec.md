## ADDED Requirements

### Requirement: Build a complete init plan before execution
Rule: Init SHALL build an immutable, side-effect-free plan containing exact selected and auto-required items before asking for execution confirmation.

#### Scenario: Build aggregate custom plan
- **GIVEN** agents and custom component selections are complete
- **WHEN** init prepares the plan
- **THEN** it resolves packages, configs, MCPs, skills, workflows, plugins, rules, and `.gitignore` effects
- **AND** records exact agent-asset pairs and destinations
- **AND** performs no installation or write

#### Scenario: Expand auto-required dependencies
- **GIVEN** selected rules, skills, workflows, or combo components require other assets
- **WHEN** init expands dependencies
- **THEN** each dependency is added once with origin `Auto-required`
- **AND** its reason and dependent item are retained for summary

#### Scenario: Prefer selected origin after deduplication
- **GIVEN** an asset is both selected directly and required by another asset
- **WHEN** the plan is deduplicated
- **THEN** one planned item remains
- **AND** it is displayed as user-selected with dependency details retained

### Requirement: Classify planned state by effective destination
Rule: Init SHALL classify new and existing state at the scope where each selected item will be installed.

#### Scenario: Classify agent artifact independently
- **GIVEN** a skill exists for Claude but not Cursor
- **AND** both agents and the skill are selected
- **WHEN** init builds the skill plan
- **THEN** Claude skill item is existing
- **AND** Cursor skill item is new

#### Scenario: Classify package and config state
- **GIVEN** selected packages and config files have mixed current state
- **WHEN** their planners run
- **THEN** package state reflects local or global install scope
- **AND** config state reflects each destination file

#### Scenario: Describe plugin planned action without state
- **GIVEN** a plugin action is selected for an agent
- **WHEN** the plugin plan is summarized
- **THEN** the agent, plugin, and automatic or manual action are shown
- **AND** the plugin is not labeled new or existing

### Requirement: Execute only a confirmed frozen plan
Rule: Init SHALL execute no side effect before final confirmation and SHALL execute exact frozen plan decisions without further selection or confirmation prompts.

#### Scenario: Decline complete plan
- **GIVEN** the complete summary is displayed
- **WHEN** the user declines final confirmation
- **THEN** init stops
- **AND** no package, file, plugin, MCP, directory, post-install hook, or `.gitignore` change occurs

#### Scenario: Confirm existing resources
- **GIVEN** the summary marks selected resources as existing and scheduled for overwrite or reinstall
- **WHEN** the user confirms the plan
- **THEN** confirmation authorizes those displayed overwrite and reinstall decisions
- **AND** execution asks no later overwrite question

#### Scenario: Continue after independent failure
- **GIVEN** a confirmed plan contains multiple categories
- **AND** one item fails during execution
- **WHEN** remaining independent items are reached
- **THEN** their execution continues
- **AND** final report includes both failure and later outcomes

### Requirement: Group summary and results by category
Rule: Init SHALL use consistent category grouping for pre-execution summary and final execution report.

#### Scenario: Show selected and auto-required groups
- **GIVEN** a plan contains direct selections and dependencies
- **WHEN** the summary is rendered
- **THEN** each category separates Selected and Auto-required items
- **AND** new and existing state is visible where detection is supported

#### Scenario: Report actual execution outcomes
- **GIVEN** a confirmed plan finishes execution
- **WHEN** the final report is rendered
- **THEN** each category reports installed, overwritten or reinstalled, manual action required, skipped, and failed outcomes as applicable
- **AND** selected items are not mislabeled as installed before successful execution
