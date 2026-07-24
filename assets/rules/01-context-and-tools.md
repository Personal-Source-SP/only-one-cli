---
alwaysApply: true
---

# CONTEXT & TOOLING

## Discovery

- Start from user-provided files and the narrowest relevant scope. Expand only when evidence shows the current scope is insufficient; never scan the repository without a concrete query.
- Before broad discovery or any multi-file change, **MUST use GitNexus** to inspect dependencies, callers, and blast radius. Trivial, isolated edits do not require it.
- Repository-wide exact-symbol search is allowed when needed to prove complete usage, compatibility, or removal safety.
- If GitNexus is unavailable, stale, or empty:
    1. Report the limitation before proceeding.
    2. Use scoped symbol search and manually trace imports, exports, and callers.
    3. Treat blast radius as unknown.
    4. Stop for user approval before deletions, renames, breaking contracts, or migrations.

## Intent & Scope

- The user's explicit request is the authoritative source of intent and MUST clearly define the goal, expected behavior, and relevant boundaries.
- If critical details are missing, ambiguous, or conflicting, **stop and ask targeted clarifying questions before editing**. Do not infer requirements or choose product behavior on the user's behalf.
- Do not infer a business contract from one implementation. Validate against relevant schemas, constraints, tests, call sites, configuration, and confirmed user requirements.
- Modify only requested behavior and directly required supporting files, such as tests, types, exports, generated artifacts, snapshots, migrations, and lockfiles.
- Report unexpected scope expansion before editing; get approval when it adds product behavior or affects unrelated areas.

## Minimal Context

- Load only relevant targets, dependencies, callers, tests, fixtures, contracts, configuration, and runtime wiring.
- Prefer direct relationships first; expand only when evidence indicates indirect impact.
