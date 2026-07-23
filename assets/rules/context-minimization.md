# Context Minimization

## Code Discovery & Analysis
- Before proposing plans or modifying files, ALWAYS perform dependency-aware code discovery using available indexing/search capabilities (such as GitNexus or target tools).
- Avoid recursive directory-wide grep/find commands when targeted symbol graph resolution is available.
- Identify the exact, minimal set of affected files and dependencies before opening or editing code.

## Spec-Grounded Behavior
- Validate requirements against active OpenSpec feature definitions under `openspec/` before implementing changes.
- Do not infer business contracts solely from unverified source code implementations.

## Minimal File Loading
- Load only the target implementation files, their direct test files, and direct dependencies identified during discovery.
- Keep agent working context clear, focused, and free of irrelevant codebase files.
