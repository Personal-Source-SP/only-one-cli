## 1. Core Services

- [ ] 1.1 Create `src/core/skill/index.ts` with logic for checking existing skills, copying skills, generating workflows, and gitignore updates
- [ ] 1.2 Create `src/core/mcp/index.ts` with logic for checking existing MCP servers, updating `mcp.json` configs, and handling manual credentials
- [ ] 1.3 Create `src/core/combo/index.ts` with logic for loading combo manifests, checking existing package/skill/config/mcp status, and running orchestrator
- [ ] 1.4 Refactor `src/core/init/init-command.ts` to delegate to these modular core services

## 2. CLI Commands

- [ ] 2.1 Register top-level commands `skill`, `mcp`, and `combo` in `src/cli/index.ts`
- [ ] 2.2 Create `src/commands/skill/command.ts` (IDE select -> check duplicates -> verify checklist -> install -> print summary)
- [ ] 2.3 Create `src/commands/mcp/command.ts` (IDE select -> check duplicates -> verify checklist -> merge -> print summary)
- [ ] 2.4 Create `src/commands/combo/command.ts` (IDE select -> choose combo -> check duplicates -> verify checklist -> sync -> print summary)
- [ ] 2.5 Refactor `src/commands/init/command.ts` to act as an orchestrator invoking the new services sequentially

## 3. Testing and Validation

- [ ] 3.1 Update existing `test/commands/init/init.test.ts` to accommodate the refactored structure
- [ ] 3.2 Add unit and integration tests for `only-one skill` command
- [ ] 3.3 Add unit and integration tests for `only-one mcp` command
- [ ] 3.4 Add unit and integration tests for `only-one combo` command
- [ ] 3.5 Run `npx openspec validate refactor-init-to-separate-commands --type change --strict` to verify OpenSpec compliance
