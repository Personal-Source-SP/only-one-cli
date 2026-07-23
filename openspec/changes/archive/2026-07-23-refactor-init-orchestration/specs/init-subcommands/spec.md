## MODIFIED Requirements

### Requirement: Init Subcommands CLI Interface
Rule: Init and standalone component commands SHALL share prompt-free category planning and execution services, while command handlers retain only argument parsing, interaction, and output formatting.

#### Scenario: Reuse component planner from init
- **GIVEN** init receives package, config, MCP, skill, plugin, or rule selections
- **WHEN** it builds the aggregate plan
- **THEN** it calls the same category planner available to the corresponding component command
- **AND** does not duplicate existence or dependency logic

#### Scenario: Reuse component executor after confirmation
- **GIVEN** the user confirmed an init plan
- **WHEN** a category executes
- **THEN** init calls the shared category executor with exact planned items
- **AND** the executor performs no selection or confirmation prompt

#### Scenario: Keep explicit init surfaces
- **GIVEN** the user supplies supported init step, skip, combo, or component options
- **WHEN** init begins
- **THEN** those inputs preselect or skip plan categories
- **AND** the resulting aggregate plan still requires interactive summary confirmation

#### Scenario: Keep standalone automation
- **GIVEN** automation requires component installation without interactive init confirmation
- **WHEN** complete IDs and target IDs are passed to standalone component commands
- **THEN** standalone commands use shared services independently
- **AND** init-specific final confirmation is not required
