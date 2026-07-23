## MODIFIED Requirements

### Requirement: Package Manifest Format
Rule: The typed package registry SHALL define npm-installable packages by stable ID, npm package name, description, and local or global scope.

#### Scenario: Resolve npm package manifest
- **GIVEN** a package entry exists under `assets/packages`
- **WHEN** package selection loads available packages
- **THEN** the entry exposes its stable ID and npm package identity
- **AND** its scope resolves to local or global installation

#### Scenario: Default package scope is global
- **GIVEN** a package manifest omits scope
- **WHEN** package installation is prepared
- **THEN** its install scope defaults to global

#### Scenario: Reject plugin semantics in package manifest
- **GIVEN** an asset requires per-agent plugin actions
- **WHEN** registry ownership is determined
- **THEN** it is defined under `assets/plugins`
- **AND** it is not represented as a package manifest

### Requirement: Libraries Directory Structure
Rule: The `assets/` directory SHALL contain typed registries and physical assets for packages, plugins, rules, skills, workflows, MCPs, configs, combos, templates, and VS configuration.

#### Scenario: Load typed asset registries
- **GIVEN** a source or packaged only-one installation
- **WHEN** available components are resolved
- **THEN** package metadata loads from `assets/packages`
- **AND** plugin metadata loads from `assets/plugins`
- **AND** rule metadata and Markdown content load from `assets/rules`

#### Scenario: Publish plugin and rule assets
- **GIVEN** the npm package is built for publication
- **WHEN** packaged assets are inspected
- **THEN** plugin registry files are included
- **AND** rule registry and Markdown files are included
