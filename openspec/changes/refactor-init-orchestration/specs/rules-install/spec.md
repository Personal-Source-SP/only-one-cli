## ADDED Requirements

### Requirement: Reusable exact per-agent rule planning
Rule: Rule service SHALL preserve exact per-agent rule selections, classify destination state, and emit dependencies without executing them.

#### Scenario: Preserve different rule choices by agent
- **GIVEN** different rules are selected for two agents
- **WHEN** rule planning runs
- **THEN** only selected agent-rule pairs enter the plan
- **AND** no target-rule cross-product is created

#### Scenario: Classify rule destination
- **GIVEN** a selected rule exists for one agent but not another
- **WHEN** rule planning runs
- **THEN** each agent-rule destination is classified independently as existing or new
- **AND** no rule file is copied

#### Scenario: Emit rule dependencies
- **GIVEN** a selected rule requires packages, plugins, MCPs, or skills
- **WHEN** rule planning runs
- **THEN** dependencies are emitted to the aggregate planner as auto-required items
- **AND** rule planning does not invoke dependency installers

### Requirement: Plan-driven rule execution
Rule: Rule execution SHALL copy exact confirmed agent-rule pairs after required dependency outcomes are available.

#### Scenario: Install confirmed rules
- **GIVEN** dependencies permit a planned rule item to execute
- **WHEN** rule execution runs
- **THEN** only the planned agent-rule destination is created or overwritten
- **AND** no dependency selection or installation prompt appears

#### Scenario: Skip rule after dependency failure
- **GIVEN** a required automatic dependency failed during confirmed plan execution
- **WHEN** the dependent rule is reached
- **THEN** the rule is skipped with dependency-failure reason
- **AND** unrelated rule items continue

#### Scenario: Install rule with pending manual plugin
- **GIVEN** a rule depends on a plugin with manual action
- **WHEN** the confirmed plan executes
- **THEN** the rule file may be installed
- **AND** its result reports installed-not-ready with action-required details
