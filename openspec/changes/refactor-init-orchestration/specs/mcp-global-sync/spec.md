## ADDED Requirements

### Requirement: Reusable per-agent MCP planning
Rule: MCP service SHALL classify exact agent-MCP pairs before synchronization and expose credential requirements in the aggregate plan.

#### Scenario: Classify MCP by agent config
- **GIVEN** one MCP is selected for multiple agents
- **WHEN** MCP planning runs
- **THEN** each agent-MCP pair is classified independently as new or existing
- **AND** credential placeholders and manual completion keys are included in planned details
- **AND** no global config is written

### Requirement: Plan-driven MCP synchronization
Rule: MCP synchronization SHALL consume exact confirmed agent-MCP decisions without further overwrite prompts.

#### Scenario: Sync exact MCP pairs
- **GIVEN** a confirmed plan contains selected agent-MCP pairs
- **WHEN** MCP execution runs
- **THEN** only those pairs are merged into agent configs
- **AND** existing pairs marked reconfigure are overwritten

#### Scenario: Preserve MCP transaction behavior
- **GIVEN** MCP config writes begin
- **WHEN** one transactional write fails
- **THEN** MCP transaction recovery applies to affected config files
- **AND** aggregate init records MCP failure and continues independent later categories
