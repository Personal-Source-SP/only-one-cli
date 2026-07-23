## ADDED Requirements

### Requirement: Agent-first plugin selection
Rule: The `only-one plugin` command SHALL select agents before plugins and SHALL present compatible plugin choices separately for each selected agent.

#### Scenario: Select plugins interactively per agent
- **GIVEN** plugin IDs and target IDs are not provided
- **AND** interactive prompts are available
- **WHEN** the user runs `only-one plugin`
- **THEN** the command first prompts for one or more plugin-capable agents
- **AND** then shows one plugin selection prompt for each selected agent
- **AND** each prompt contains only plugins supported by that agent
- **AND** all compatible plugins are selected by default

#### Scenario: Select different plugins for different agents
- **GIVEN** multiple agents are selected interactively
- **WHEN** the user confirms different plugin choices in each agent prompt
- **THEN** installation executes only the selected agent-plugin pairs
- **AND** the report identifies outcomes per agent-plugin pair

#### Scenario: Use explicit plugin automation
- **GIVEN** valid plugin IDs and target IDs are explicitly provided
- **WHEN** the plugin command runs without interactive prompts
- **THEN** agent and plugin prompts are skipped
- **AND** every requested agent-plugin pair is validated before actions execute

#### Scenario: Reject missing plugin IDs in non-interactive mode
- **GIVEN** targets are explicit
- **AND** plugin IDs are omitted
- **AND** interactive prompts are unavailable
- **WHEN** the plugin command runs
- **THEN** it fails before plugin actions
- **AND** reports that plugin IDs are required

#### Scenario: Reject missing plugin targets in non-interactive mode
- **GIVEN** plugin IDs are explicit
- **AND** target IDs are omitted
- **AND** interactive prompts are unavailable
- **WHEN** the plugin command runs
- **THEN** it fails before plugin actions
- **AND** reports that target IDs are required
