## 1. Configuration Assets & Types

- [x] 1.1 Create `src/core/assets/types.ts` defining all metadata types (Combo, Package, Mcp, Vs, Skill, Workflow, Config)
- [x] 1.2 Create `src/core/assets/packages.ts` containing the package manifests
- [x] 1.3 Create `src/core/assets/mcps.ts` containing the MCP server configs
- [x] 1.4 Create `src/core/assets/vs.ts` containing the VS Code settings and extension lists
- [x] 1.5 Create `src/core/assets/combos.ts` containing the combos
- [x] 1.6 Create `src/core/assets/configs.ts` containing the configuration template indexes
- [x] 1.7 Create `src/core/assets/skills.ts` containing the skills manifests with workflow links
- [x] 1.8 Create `src/core/assets/workflows.ts` containing the workflow definitions and skill/MCP dependencies

## 2. Restructuring and File Management

- [x] 2.1 Rename directory `libraries/` to `assets/` at the project root
- [x] 2.2 Delete the old YAML/JSON configurations (`assets/combos/idsd-flow.yaml`, `assets/packages/*.yaml`, `assets/mcps/*.json`, `assets/vs/*.json`)
- [x] 2.3 Create `assets/workflows/` directory and populate it with workflow files (`only-one-clockify.md`, `only-one-pr-git.md`)

## 3. Core Logic Refactoring

- [x] 3.1 Refactor MCP loading logic in `src/core/mcp/registry.ts` to use `src/core/assets/mcps.ts`
- [x] 3.2 Refactor VS library loading logic in `src/core/vs/library.ts` to use `src/core/assets/vs.ts`
- [x] 3.3 Refactor Combo loading logic in `src/core/combo/index.ts` to use TS assets
- [x] 3.4 Refactor Skill loading logic in `src/core/skill/index.ts` to point to `assets/skills`
- [x] 3.5 Refactor orchestrator logic in `src/core/init/init-command.ts` to use TS assets and update gitignore logic for `assets/`

## 4. Workflow & Skill Dependency Implementation

- [x] 4.1 Update `init-command.ts` to automatically select/queue required skills when a workflow is installed
- [x] 4.2 Update `src/commands/skill/command.ts` to prompt to install associated workflows when a skill is installed

## 5. Build, Publish & Test Configurations

- [x] 5.1 Update `"files"` list in `package.json` to include `"assets"` instead of `"libraries"`
- [x] 5.2 Update build and publish scripts (`scripts/publish.js`, `scripts/publish-npm.sh`) to package `assets`
- [x] 5.3 Update existing test suites that reference `libraries/` to reference `assets/` or use mock assets

## 6. Verification & Compilation

- [x] 6.1 Compile project and run `npm run test`
- [x] 6.2 Validate OpenSpec change using `npx openspec validate refactor-libraries-to-assets --type change --strict`
- [x] 6.3 Test publishing and commands locally using `npm run publish:local` and running `only-one` commands correctly in a mock workspace
