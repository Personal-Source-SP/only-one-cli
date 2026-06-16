## 1. Upgrading Combo and Configuration Templates

- [x] 1.1 Delete the deprecated `libraries/combos/default.yaml`
- [x] 1.2 Create `libraries/combos/idsd-flow.yaml` with packages, skills, `configs: ["openspec"]`, and correct metadata
- [x] 1.3 Create `libraries/configs/openspec/config.yaml` as a copy of `openspec/config.yaml`
- [x] 1.4 Create `libraries/configs/index.yaml` defining mapping for `openspec` configuration files

## 2. Implementing Copy Configs Step in Init

- [x] 2.1 Update `ComboManifest` interface in `src/core/init/types.ts` to include optional `configs: string[]`
- [x] 2.2 Update `src/core/init/init-command.ts` to load `libraries/configs/index.yaml`, lookup active combo configs, and copy mapped files recursively to the project directory
- [x] 2.3 Implement Step 4 interactive configs prompt in `init-command.ts` and update result printer and command registration options

## 3. Implementing Post-Install Initialization of OpenSpec CLI

- [x] 3.1 Update `src/core/init/init-command.ts` to execute `npx openspec init --tools <selectedTools>` if `@fission-ai/openspec` is installed

## 4. Verification and Validation

- [x] 4.1 Run unit tests and verify combo parsing works
- [x] 4.2 Run `openspec validate upgrade-default-combo --type change --strict` before archiving
