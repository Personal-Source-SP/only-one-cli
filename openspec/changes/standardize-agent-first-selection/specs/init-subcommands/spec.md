## MODIFIED Requirements

### Requirement: Init Subcommands CLI Interface
Rule: The CLI SHALL support independent component commands for packages, skills, configs, MCPs, combos, plugins, and rules; target-aware commands SHALL select agents first, and no command SHALL expose `--yes`.

#### Scenario: Run plugin command interactively
- **GIVEN** the user runs `only-one plugin` without explicit IDs
- **WHEN** interactive prompts are available
- **THEN** agent selection appears before per-agent compatible plugin selection
- **AND** installation reports outcomes per agent-plugin pair

#### Scenario: Run rule command interactively
- **GIVEN** the user runs `only-one rule` without explicit IDs
- **WHEN** interactive prompts are available
- **THEN** agent selection appears before per-agent compatible rule selection
- **AND** rule dependency and installation outcomes are reported per agent-rule pair

#### Scenario: Run existing target-aware commands interactively
- **GIVEN** the user runs skill, MCP, or combo management without explicit targets
- **WHEN** interactive prompts are available
- **THEN** agent selection occurs before component selection
- **AND** capability-compatible agents are selected by default

#### Scenario: Use explicit component automation
- **GIVEN** a component command receives all required component IDs and target IDs
- **WHEN** interactive prompts are unavailable
- **THEN** it validates the explicit plan and executes new work
- **AND** skips existing resources requiring verification

#### Scenario: Reject removed yes option
- **GIVEN** the user invokes any command with `--yes`
- **WHEN** command arguments are parsed
- **THEN** the command rejects the unknown option
- **AND** no side effect occurs

#### Scenario: Reject incomplete non-interactive component command
- **GIVEN** a command lacks required component or target IDs
- **AND** interactive prompts are unavailable
- **WHEN** the command executes
- **THEN** it fails before side effects
- **AND** reports the explicit arguments required
