## ADDED Requirements

### Requirement: Reusable per-agent skill planning
Rule: Skill service SHALL plan exact selected agent-skill pairs and emit workflow dependencies without installing or prompting.

#### Scenario: Classify skill by agent destination
- **GIVEN** one skill is selected for multiple agents
- **WHEN** skill planning runs
- **THEN** each agent-skill destination is classified independently as new or existing
- **AND** no skill directory or generated command is written

#### Scenario: Emit associated workflow dependency
- **GIVEN** a selected skill declares an associated workflow
- **WHEN** skill planning runs
- **THEN** the workflow is emitted as an auto-required planned dependency
- **AND** required workflow skills and MCPs can be expanded before summary

### Requirement: Plan-driven skill execution
Rule: Skill execution SHALL install exact confirmed agent-skill pairs and SHALL not rediscover or prompt for associated workflows.

#### Scenario: Install exact skill pairs
- **GIVEN** a confirmed plan contains different skills for different agents
- **WHEN** skill execution runs
- **THEN** only listed agent-skill pairs are installed or overwritten
- **AND** generated command artifacts follow planned workflow items

#### Scenario: Do not prompt after execution starts
- **GIVEN** associated workflows were expanded into the confirmed plan
- **WHEN** skill execution completes
- **THEN** no workflow confirmation prompt appears
- **AND** workflow execution follows frozen plan decisions
