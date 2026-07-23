## MODIFIED Requirements

### Requirement: Init Subcommands CLI Interface
Rule: The CLI SHALL support independent top-level commands for skills, MCPs, plugins, rules, and combos, while `only-one init` may orchestrate their core flows.

#### Scenario: Run plugin command
- **GIVEN** the user runs `only-one plugin`
- **WHEN** the command executes
- **THEN** it selects supported agent targets
- **AND** selects available plugins
- **AND** executes command actions or reports manual actions per target
- **AND** outputs installed, action-required, skipped, and failed results

#### Scenario: Run rule command
- **GIVEN** the user runs `only-one rule`
- **WHEN** the command executes
- **THEN** it selects native rule targets and available rules
- **AND** automatically prepares required package, plugin, MCP, and skill dependencies
- **AND** installs each ready rule to native target paths
- **AND** reports dependency and readiness outcomes

#### Scenario: Init orchestrates plugin before rule
- **GIVEN** init is configured to run plugin and rule component flows
- **WHEN** init executes selected steps
- **THEN** plugin flow runs before rule flow
- **AND** rule dependencies may still queue missing components from other domains

#### Scenario: Run existing component commands
- **GIVEN** the user runs `only-one skill`, `only-one mcp`, or `only-one combo`
- **WHEN** the command executes
- **THEN** existing component behavior remains available
