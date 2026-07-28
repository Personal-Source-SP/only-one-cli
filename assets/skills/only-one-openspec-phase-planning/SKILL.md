---
name: only-one-openspec-phase-planning
description: Use when planning an OpenSpec change that must be organized into approval-gated phases and implementation-ready tasks.
---

# OpenSpec Phase Planning

## Core lifecycle

1. Select or derive a kebab-case change name. If an active change may match, list candidates and require explicit continue-or-create selection.
2. Use `openspec-propose`; create missing change, inspect JSON status, and follow artifact dependencies from `applyRequires`.
3. Resolve active schema/profile from `openspec status --change "<name>" --json`. For each ready artifact, use `openspec instructions <artifact-id> --change "<name>" --json` and write only to `resolvedOutputPath` using returned template, rules, and dependencies.
4. Treat resolved OpenSpec artifacts and active schema instructions as sole planning source. Never create a second plan or task tracker.
5. Preserve every template heading and required profile section. Template minimum is not sufficient when active schema instructions require profile fields.

## Phase and task contract

Organize implementation into dependency-ordered phases. Every phase requires **Phase goal**, ordered **Tasks**, **Phase acceptance requirements**, and **Phase verification**.

Every task is one complete functional outcome and requires **Main work**, declared **Files** with caller-approved tags, **Allowed scope**, **Dependencies and constraints**, **Acceptance requirements**, and **Verification**.

File tags describe operations or references inside a task, not separate task types. Keep related files together when they deliver one outcome. Prevent independent tasks from writing the same files; order shared-file work explicitly. Apply `writing-plans` right-sizing inside the resolved task artifact only.

## Profile contract

Active OpenSpec schema owns domain-specific artifact fields, tags, contracts, evidence, and safety rules. Caller workflow selects and verifies profile only; it must not append a competing artifact format.

## Approval gate

1. Do not modify product source, tests, dependencies, configuration, migrations, or data while planning.
2. Verify every `applyRequires` artifact exists at its resolved path.
3. Present artifact status, scope, assumptions, risks, unresolved questions, profile contracts, phases, acceptance, and verification.
4. Wait for explicit approval. Revision updates resolved artifacts, reruns status, and requires approval again.
