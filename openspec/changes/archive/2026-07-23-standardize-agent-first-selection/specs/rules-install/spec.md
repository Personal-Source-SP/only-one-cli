## ADDED Requirements

### Requirement: Agent-first rule selection
Rule: The `only-one rule` command SHALL select native rule agents before rules and SHALL present compatible rule choices separately for each selected agent.

#### Scenario: Select rules interactively per agent
- **GIVEN** rule IDs and target IDs are not provided
- **AND** interactive prompts are available
- **WHEN** the user runs `only-one rule`
- **THEN** the command first prompts for one or more rule-capable agents
- **AND** then shows one rule selection prompt for each selected agent
- **AND** each prompt contains only rules supported by that agent
- **AND** all compatible rules are selected by default

#### Scenario: Select different rules for different agents
- **GIVEN** multiple agents are selected interactively
- **WHEN** the user confirms different rule choices in each agent prompt
- **THEN** dependency plans and rule writes are created only for selected agent-rule pairs
- **AND** the report identifies outcomes per agent-rule pair

#### Scenario: Use explicit rule automation
- **GIVEN** valid rule IDs and target IDs are explicitly provided
- **WHEN** the rule command runs without interactive prompts
- **THEN** agent and rule prompts are skipped
- **AND** compatibility and dependency plans are validated before side effects

#### Scenario: Reject incomplete non-interactive rule selection
- **GIVEN** either rule IDs or target IDs are omitted
- **AND** interactive prompts are unavailable
- **WHEN** the rule command runs
- **THEN** it fails before dependency or rule side effects
- **AND** identifies the missing argument or target option

### Requirement: Verify existing rules without auto-confirm
Rule: Existing rule files SHALL require interactive verification for overwrite and SHALL be skipped when verification is unavailable.

#### Scenario: Verify existing rule interactively
- **GIVEN** selected rule files already exist
- **AND** interactive prompts are available
- **WHEN** overwrite verification runs
- **THEN** existing agent-rule pairs are selected by default in the verification prompt
- **AND** only confirmed pairs are overwritten

#### Scenario: Skip existing rule non-interactively
- **GIVEN** a selected rule file already exists
- **AND** interactive prompts are unavailable
- **WHEN** rule installation runs with explicit inputs
- **THEN** the existing rule is skipped
- **AND** new non-conflicting rule files continue installing
- **AND** skipped outcomes appear in the report
