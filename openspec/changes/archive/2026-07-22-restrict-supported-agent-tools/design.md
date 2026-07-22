## Context

Command-facing target selection currently draws directly from three registries: the broad `AI_TOOLS` catalog, MCP adapters, and VS editor descriptors. Commands independently parse flags, choose defaults, build prompts, and validate results. This creates inconsistent supported sets and duplicated behavior.

The intended support boundary is Antigravity, Claude, Cursor, and Codex. Support is capability-specific: all four support agent artifacts and MCP, while only Antigravity and Cursor support VS settings and extensions. MCP adds a serialization constraint because Claude uses JSON and Codex uses TOML. Existing transactional global writes and rollback remain required.

ADR 0001 delegates standard init tool selection to OpenSpec, but current `only-one init` still owns MCP selection and project-specific agent setup paths. This design does not take ownership back from OpenSpec; it centralizes only target selection performed by this CLI and validation of target IDs it consumes.

## Goals / Non-Goals

**Goals:**

- Establish one stable allowlist and capability model for every command-facing target.
- Reuse one parse, validate, default, preselect, and checkbox selection pipeline.
- Reject unsupported explicit IDs consistently.
- Add verified Claude and Codex MCP support without weakening transactional writes.
- Preserve configuration outside each adapter's MCP server container.
- Keep existing low-level tool, MCP, and VS registries usable as implementation registries.

**Non-Goals:**

- Delete unsupported entries from the broad `AI_TOOLS` catalog.
- Add VS settings or extension support to Claude or Codex.
- Preserve TOML comments or byte-for-byte formatting after a Codex write.
- Change MCP manifest semantics beyond supporting verified target formats.
- Replace OpenSpec's standard selection inside `openspec init`.

## Decisions

### Central capability-aware catalog

Add `AllowedToolId`, stable `ALLOWED_TOOL_IDS`, and a core descriptor catalog mapping each allowed ID to supported capabilities. Command-facing selectors intersect this catalog with existing implementation registries and fail when a declared capability lacks a backing adapter.

Alternative: trim `AI_TOOLS` to four entries. Rejected because it mixes command support policy with a broader metadata registry and creates unnecessary compatibility risk.

Alternative: maintain separate allowlists per command. Rejected because lists drift and repeat validation logic.

### Generic selection engine with thin capability wrappers

Use one generic selection engine that accepts typed choices and handles explicit CSV input, normalization, validation, auto-selection, preselection, interactive checkbox behavior, and empty-result validation. Thin wrappers obtain capability-specific choices and command-specific messages/defaults.

Alternative: three independent selectors for agent, MCP, and VS targets. Rejected because their control flow is identical and would preserve duplication.

Business defaults remain in wrappers or commands; the generic engine does not infer project state.

### Adapter-owned MCP codec

Each MCP adapter provides config path, MCP container accessors, and a codec. JSON and TOML codecs parse and stringify complete config objects. Sync changes only `mcpServers` or `mcp_servers`, serializes the complete result, then passes text to the existing transaction.

Alternative: branch on adapter ID in sync. Rejected because format policy would leak into orchestration and grow for every new format.

Alternative: optional read/write hooks on adapters. Rejected because it combines filesystem concerns with serialization and can bypass transaction boundaries.

Malformed existing config is a hard failure before writes. Missing files still begin from an empty object.

### Component view

```text
┌──────────────────────── only-one CLI process ────────────────────────┐
│                                                                      │
│  Commands                                                            │
│  skill · combo · init · mcp · setting-vs · extensions-vs            │
│                 │                                                    │
│                 ▼                                                    │
│  Allowed Target Selection                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │ fixed IDs    │  │ capabilities │  │ generic selection engine  │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────────┬─────────────┘  │
│         └──────────────────┴────────────────────────┘                │
│                            │                                         │
│             ┌──────────────┼──────────────┐                          │
│             ▼              ▼              ▼                          │
│       AI_TOOLS registry  MCP adapters   VS editors                   │
│                            │                                         │
│                      JSON/TOML codecs                                │
│                            │                                         │
│                  transactional file sync                             │
└────────────────────────────┼─────────────────────────────────────────┘
                             ▼
              User-level IDE/CLI configuration files
```

Boundary: all components run in one CLI process. External state is limited to project files and user-level IDE/CLI configuration files. Assumption: existing transaction accepts serialized text independent of format.

## Risks / Trade-offs

- [Existing scripts target VS Code or wider agent IDs] -> Return an error listing valid command-specific IDs and document migration.
- [TOML rewrite drops comments or changes formatting] -> Guarantee semantic preservation only; test complete-object round trips and disclose limitation.
- [Adapter and capability catalog drift] -> Add invariant tests that every declared capability resolves a backing implementation.
- [Shared engine becomes coupled to command business rules] -> Keep project detection, overwrite warnings, and command messages/defaults in thin wrappers.
- [Mixed JSON/TOML multi-target write partially succeeds] -> Retain one transaction across all serialized writes and test rollback after a later failure.
- [ADR 0001 ownership conflict] -> Do not replace OpenSpec init selection; limit centralization to only-one-owned selection and validation.

## Migration Plan

1. Add constants, capability types, catalog, selectors, and invariant tests without changing commands.
2. Add generic selection engine and behavior tests.
3. Add MCP codecs and Claude/Codex adapters; extend transaction tests to mixed formats.
4. Migrate commands one at a time to thin selection wrappers.
5. Update help text and tests that mention unsupported targets.
6. Run full tests, build, and strict OpenSpec validation.

Rollback restores previous command imports and MCP adapter set. No persistent data migration is needed. Transaction backups protect user config writes during runtime failure; users relying on removed IDs must continue using a prior CLI release until scripts are migrated.

## Open Questions

None. ADR 0001 remains in force and is not superseded.
