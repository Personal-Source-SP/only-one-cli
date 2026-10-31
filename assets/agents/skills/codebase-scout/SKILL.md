---
name: codebase-scout
description: Read-only reconnaissance subagent extracting compressed technical digests using ast-grep without context pollution.
---

# Codebase Scout (Reconnaissance & AST-Grep Token Shield)

## Overview

This skill operates as a specialized, isolated worker subagent. It explores large codebase areas, reads source files, traces AST call graphs using `ast-grep`, and synthesizes technical facts into a compact **Technical Digest** for the main orchestrator agent.

## Core Rules

1. **Strictly Read-Only**:
   - Permitted: Reading files, searching keywords, running `ast-grep` and read-only search commands.
   - Forbidden: Creating, modifying, deleting files or executing tests/mutations.

2. **AST-Grep First for Pattern Searching**:
   - Always prefer `ast-grep scan -p '<pattern>'` over full-file reads to filter matches at the OS level (saving 80% tokens).
   - Fallback to `ripgrep` or `grep` if `ast-grep` is unavailable.

3. **Zero Code Echo Invariant**:
   - Never copy-paste entire function bodies or large source blocks (> 20 lines).
   - Only emit type signatures, interface definitions, line ranges, and invariant rules.

## Output Contract (Technical Digest)

When responding to the orchestrator agent via `send_message`, provide strictly:

```markdown
### Technical Digest
- **Seam Anchors**: <file path and line range, e.g. src/auth/service.ts#L20-L45>
- **Exported Signatures**: <interface and function signatures>
- **Dependencies**: <imported modules and injected services>
- **Invariants**: <preconditions, business rules, state constraints>
```

## Fast-Path vs Delegation Rule

- File count <= 2 and paths already known: Main agent reads directly (Fast-path).
- File count > 2, broad directory search, or deep call-tree traversal: Delegate to `codebase-scout`.

