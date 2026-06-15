## MODIFIED Requirements

### Requirement: init command no longer prompts for project config
The init command SHALL delegate project configuration to `openspec init` and no longer prompt for server, project name, index mode, or git details.

#### Scenario: user passes removed flags
- **GIVEN** user runs `only-one-cli init --server http://example.com`
- **WHEN** the command parses the argument
- **THEN** display deprecation warning
- **AND** ignore the flag
- **AND** proceed with init flow

#### Scenario: --no-install-skill skips all installation steps
- **GIVEN** user runs `only-one-cli init --no-install-skill`
- **WHEN** the init flow starts
- **THEN** skip openspec bootstrapping
- **AND** skip custom skills sync
- **AND** display message "Init complete (skill installation skipped)"

## REMOVED Requirements

### Requirement: interactive configuration prompts
**Reason**: Replaced by `openspec init` which handles all project configuration

**Migration**: Run `openspec init` directly for project-level configuration, or use `only-one-cli init` which delegates to it

### Requirement: backend sync on init
**Reason**: Backend sync is no longer part of init flow; openspec handles this if needed

**Migration**: No replacement needed — backend sync is obsolete in current architecture

### Requirement: structure scaffold on init
**Reason**: Structure scaffolding is handled by `only-one-cli structure-generate` command, not init

**Migration**: Run `only-one-cli structure-generate` separately if structure output is needed
