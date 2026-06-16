## 1. Upgrading Combo and Configuration Templates

- [ ] 1.1 Delete the deprecated `libraries/combos/default.yaml`
- [ ] 1.2 Create `libraries/combos/idsd-flow.yaml` with packages, skills, and correct metadata
- [ ] 1.3 Create `libraries/configs/openspec/config.yaml` as a copy of `openspec/config.yaml`

## 2. Implementing Copy Configs Step in Init

- [ ] 2.1 Update `src/core/init/init-command.ts` to recursively copy all files and folders from `libraries/configs/` to the project root directory

## 3. Implementing Post-Install Initialization of OpenSpec CLI

- [ ] 3.1 Update `src/core/init/init-command.ts` to execute `npx openspec init --tools <selectedTools>` if `@fission-ai/openspec` is installed

## 4. Verification and Validation

- [ ] 4.1 Run unit tests and verify combo parsing works
- [ ] 4.2 Run `openspec validate upgrade-default-combo --type change --strict` before archiving
