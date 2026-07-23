## MODIFIED Requirements

### Requirement: Package Manifest Format
Rule: The package registry SHALL define each installable package with a stable ID and a typed installer strategy.

#### Scenario: Define npm package manifest
- **GIVEN** a package registry entry uses the `npm` installer
- **WHEN** the init command reads available packages
- **THEN** the entry exposes a stable ID, npm package name, description, and local or global scope

#### Scenario: Default npm scope is global
- **GIVEN** an npm package entry omits its scope
- **WHEN** the package registry is resolved
- **THEN** the package install mode defaults to global

#### Scenario: Define target-plugin package manifest
- **GIVEN** a package registry entry uses the `target-plugin` installer
- **WHEN** the init command reads available packages
- **THEN** the entry exposes its supported agent targets
- **AND** each supported target has either an executable command action or manual installation guidance

#### Scenario: Define Superpowers without npm identity
- **GIVEN** the package registry contains the stable ID `superpowers`
- **WHEN** its installer strategy is inspected
- **THEN** it is defined as a target-plugin package
- **AND** it has no npm package name that could resolve to the unrelated npm package `superpowers`
