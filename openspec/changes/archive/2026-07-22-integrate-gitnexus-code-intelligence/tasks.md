## 1. GitNexus MCP Registry

- [x] 1.1 Add the `gitnexus` manifest with `npx -y gitnexus@latest mcp` and `GITNEXUS_MCP_READ_ONLY=1` to the packaged MCP registry.
- [x] 1.2 Extend registry tests to verify GitNexus discovery, launch arguments, fixed read-only policy, and absence of credential placeholders.

## 2. Cross-target Synchronization

- [x] 2.1 Add JSON and TOML codec coverage proving GitNexus arguments and policy environment survive target serialization.
- [x] 2.2 Add sync coverage for Antigravity, Claude, Cursor, and Codex, including add-only merge and declined reconfiguration of an existing GitNexus server.
- [x] 2.3 Add CLI command coverage for selecting `gitnexus` and reporting completion without manual credential instructions.

## 3. Documentation and Validation

- [x] 3.1 Update README MCP guidance with `only-one mcp gitnexus`, repository indexing prerequisite, read-only tool scope, and dynamic `@latest` runtime note.
- [x] 3.2 Run focused MCP tests, full `npm test`, and `npm run build`.
- [x] 3.3 Run `openspec validate integrate-gitnexus-code-intelligence --type change --strict` and resolve all validation findings.
