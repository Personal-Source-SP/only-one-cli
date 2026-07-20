## MODIFIED Requirements

### Requirement: Init Subcommands CLI Interface
Rule: The CLI SHALL support individual top-level commands to initialize and manage components independently: `only-one skill`, `only-one mcp`, and `only-one combo`. The `only-one init` command SHALL act as an orchestrator that prompts for and runs these commands' core flows in sequence.

#### Scenario: Run init package subcommand with arguments
- **GIVEN** the user runs `only-one init package typescript,prettier`
- **WHEN** the command executes
- **THEN** it skips the interactive package selection prompt
- **AND** it directly installs `typescript` and `prettier` packages in the target project
- **AND** it appends corresponding tool config directories to `.gitignore`

#### Scenario: Run init skill subcommand in interactive mode
- **GIVEN** the user runs `only-one init skill`
- **WHEN** no skill names are passed as arguments
- **THEN** it displays an interactive multi-select list of available skills to install
- **WHEN** the user selects a skill
- **THEN** it syncs the selected skill and updates `.gitignore` unless `--no-ignore` is passed

#### Scenario: Run skill command
- **GIVEN** the user runs `only-one skill`
- **WHEN** the command executes
- **THEN** it displays a prompt to select target IDEs (Cursor, Antigravity, etc.)
- **AND** it displays an interactive multi-select list of available skills to install
- **AND** it runs existence checks and prompts for verification/confirmation before overwriting/reinstalling existing skills
- **AND** it copies skills, generates workflow command files, and updates `.gitignore` for selected IDEs
- **AND** it outputs a detailed summary showing successes, overwrites, skipped items, and failures

#### Scenario: Run mcp command
- **GIVEN** the user runs `only-one mcp`
- **WHEN** the command executes
- **THEN** it displays a prompt to select target IDEs (Cursor, Antigravity, etc.)
- **AND** it displays an interactive multi-select list of available MCP servers to configure
- **AND** it runs existence checks against global configurations
- **AND** it prompts for verification/confirmation before overwriting/reconfiguring existing MCP servers
- **AND** it merges configs, alerts about manual secret completions, and outputs a detailed summary
