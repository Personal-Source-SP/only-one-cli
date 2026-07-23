## ADDED Requirements

### Requirement: Reusable per-agent plugin action planning
Rule: Plugin service SHALL plan exact agent-plugin actions without executing commands or claiming installation state.

#### Scenario: Plan automatic plugin action
- **GIVEN** a plugin has a command action for a selected agent
- **WHEN** plugin planning runs
- **THEN** the agent-plugin pair is listed with its planned command action
- **AND** it is not labeled new or existing
- **AND** the command does not execute

#### Scenario: Plan manual plugin action
- **GIVEN** a plugin requires manual installation for a selected agent
- **WHEN** plugin planning runs
- **THEN** the agent-plugin pair is listed with exact manual guidance
- **AND** it is not labeled new or existing

### Requirement: Plan-driven plugin execution
Rule: Plugin execution SHALL consume exact confirmed agent-plugin pairs and report command or manual-action outcomes.

#### Scenario: Execute confirmed plugin pairs
- **GIVEN** a confirmed plan contains plugin actions for selected agents
- **WHEN** plugin execution runs
- **THEN** automatic actions execute only for listed pairs
- **AND** manual pairs report action-required guidance
- **AND** one failure does not hide other plugin outcomes
