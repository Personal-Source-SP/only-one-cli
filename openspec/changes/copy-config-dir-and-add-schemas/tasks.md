## 1. Setup Configuration Templates

- [x] 1.1 Copy the `openspec/schemas` directory to `libraries/configs/openspec/schemas`
- [x] 1.2 Update `libraries/configs/index.yaml` to change the `openspec` configuration mapping from copying `openspec/config.yaml` to copying the entire `openspec` folder

## 2. CLI Copying Implementation and Verification

- [x] 2.1 Verify recursive directory copy behavior in `src/core/init/init-command.ts`
- [x] 2.2 Verify behavior by running tests / manual validation
- [x] 2.3 Run `openspec validate copy-config-dir-and-add-schemas --type change --strict`
