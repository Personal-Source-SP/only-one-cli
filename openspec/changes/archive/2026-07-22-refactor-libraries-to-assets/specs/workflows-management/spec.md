## ADDED Requirements

### Requirement: Workflow Skill Dependency Checking
We MUST ensure workflow and skill dependency checking is carried out when installing skills and workflows.

#### Scenario: Installing a Workflow that has uninstalled required skills
- **GIVEN** that the workflow `only-one-clockify` is selected for installation
- **AND** the required skill `only-one-clockify-skill` is not installed
- **WHEN** the installation step is executed
- **THEN** the CLI automatically selects/queues the required skill `only-one-clockify-skill` for installation

#### Scenario: Installing a Skill that has associated workflows
- **GIVEN** that the skill `only-one-clockify-skill` is selected for installation
- **AND** the associated workflow `only-one-clockify` is not installed
- **WHEN** the skill installation step is executed
- **THEN** the CLI prompts the user asking if they want to install the associated workflow `only-one-clockify`
- **AND** if confirmed, queues the workflow for installation
