# Only-One Knowledge Index

## Domain Rules Catalog
| Domain | Trigger Globs / Workflows | Rule File | Mandatory Constraints Summary |
| :--- | :--- | :--- | :--- |
| **Core & Memory** | `*`, `/only-one-clean`, `/only-one-apply` | [rules/core.md](file:///d:/Sources/PERSONAL/only-one-cli/only-one/rules/core.md) | Single task archive invariant, clean slugs, SSOT lockfile, canonical ~/.agents global root |
| **SDLC Workflows** | `.agents/workflows/*`, `only-one/tasks/*` | [rules/workflow.md](file:///d:/Sources/PERSONAL/only-one-cli/only-one/rules/workflow.md) | Strict lifecycle isolation, ASD-STE100, 2-file task folders, in-workflow persona, crisp chat reports |
| **CLI & Runtime** | `src/commands/*`, `src/core/runtime/*` | [rules/cli.md](file:///d:/Sources/PERSONAL/only-one-cli/only-one/rules/cli.md) | Windows shell: true for .cmd/.bat, safe error propagation, skills.sh registry, graceful SIGINT settlement, standalone node_modules preservation |
| **TUI & React** | `packages/tui-engine/*`, `src/tui/*`, `src/prompts/*` | [rules/tui.md](file:///d:/Sources/PERSONAL/only-one-cli/only-one/rules/tui.md) | Router focus lock, Box margin constraints, decoupled Herdr routing, 4-column Kanban invariant, target pane check before split, dispatch clean via Herdr, native OS sysmetrics, async cached CLI quota, strip ANSI codes, multi-line concurrent agent progress |
| **Stack & Types** | `src/types/*`, `src/**/*.service.ts`, `src/**/*.tsx` | [rules/stack.md](file:///d:/Sources/PERSONAL/only-one-cli/only-one/rules/stack.md) | Domain type contract in types/, no inline anonymous types, component props type declaration |

## Architecture Archives Catalog
| Slug ID | Domain / Module | Key Architectural Invariant | File Reference |
| :--- | :--- | :--- | :--- |
| `tui-modernization` | TUI, Go Bubble Tea | Native Go Bubble Tea 4-column Kanban, streamlined 2-line cards with active pane tags, multi-line realtime agent progress status box, sliding viewport scroll, 3-row header with native sysmetrics & agent quota, Glamour markdown viewer, mouse wheel scroll, decoupled Herdr dispatch | [archives/tui-modernization.md](file:///d:/Sources/PERSONAL/only-one-cli/only-one/archives/tui-modernization.md) |
| `vs-environment-and-sync-systems` | VS, Environment | Atomic VS Code settings and extension sync | [archives/vs-environment-and-sync-systems.md](file:///d:/Sources/PERSONAL/only-one-cli/only-one/archives/vs-environment-and-sync-systems.md) |
| `mcp-registry-and-servers` | MCP, Browser | Isolated user-data-dir for playwright MCP, 5 active built-in servers | [archives/mcp-registry-and-servers.md](file:///d:/Sources/PERSONAL/only-one-cli/only-one/archives/mcp-registry-and-servers.md) |
| `cli-tooling-and-cocoindex-purge` | CLI, Tooling | Purge obsolete cocoindex and timesheet ecosystem | [archives/cli-tooling-and-cocoindex-purge.md](file:///d:/Sources/PERSONAL/only-one-cli/only-one/archives/cli-tooling-and-cocoindex-purge.md) |
| `refactor-dev-skills-standards` | Skills, Standards | Strict local vs remote skill separation & skills.sh registry | [archives/refactor-dev-skills-standards.md](file:///d:/Sources/PERSONAL/only-one-cli/only-one/archives/refactor-dev-skills-standards.md) |
| `asset-versioning-and-sync-systems` | Assets, Lockfile, Global | SSOT in only-one/installed.json, multi-source workspace scanner & auto-restore, canonical ~/.agents root & manifest bridge | [archives/asset-versioning-and-sync-systems.md](file:///d:/Sources/PERSONAL/only-one-cli/only-one/archives/asset-versioning-and-sync-systems.md) |
| `workflow-and-sdlc-systems` | Workflow, SDLC | Direct specialized workflows, in-workflow persona, 100% English, crisp chat reports & tiered context | [archives/workflow-and-sdlc-systems.md](file:///d:/Sources/PERSONAL/only-one-cli/only-one/archives/workflow-and-sdlc-systems.md) |
