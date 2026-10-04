---
alwaysApply: true
---

# RULE 4: KARPATHY DISCIPLINES & 70% ASD-STE100 WRITING SPECIFICATION

## 1. Andrej Karpathy 4 Golden Disciplines

1. **Think Before Coding**:
   - Zero silent assumptions.
   - Explicitly state assumptions in documentation and plan artifacts.
   - Stop and ask the user whenever requirements, business logic, or edge cases are ambiguous.

2. **Simplicity First**:
   - Always choose the simplest working solution.
   - Ban speculative wrappers, generic abstraction layers, or factory patterns without at least 3 concrete use cases (Rule of Three / YAGNI).
   - Stop at the first sufficient solution rung (Ponytail Principle).

3. **Surgical Changes**:
   - Restrict modifications strictly to target files and symbols within task scope.
   - Never perform drive-by refactoring, style reformatting, or cleanups on unrelated code.

4. **Goal-Driven Execution**:
   - Transform every vague task into measurable, verifiable acceptance criteria.
   - Supply an automated Fast Test Command or binary Pass/Fail verification script for each task.
   - Loop execution until all verification criteria pass.

---

## 2. 70% ASD-STE100 Aviation Technical Writing Specification

Enforce controlled technical language adapted from aerospace maintenance manuals to prevent AI slop and ambiguity:

1. **Sentence Length Limits**:
   - **Instruction Sentences**: Maximum 25 words.
   - **Description / Context Sentences**: Maximum 30 words.
   - Avoid compound multi-clause sentences; break complex logic into bullet points.

2. **Aviation Tri-Part Action Architecture**:
   - `[Prerequisites]`: Required pre-conditions, setup, or baseline assets.
   - `[Action]`: Imperative directive starting with a controlled action verb.
   - `[Verification]`: Concrete, deterministic binary outcome (Pass/Fail).

3. **Controlled Action Verbs**:
   - `Create`: Initialize a new file, class, interface, table, or asset.
   - `Update`: Modify existing logic, contract, or file content.
   - `Delete`: Remove obsolete, deprecated, or dead files and symbols.
   - `Refactor`: Restructure internal implementation without altering external contracts.
   - `Inspect`: Read, analyze, or verify codebase state before taking action.
   - `Verify`: Run automated tests, execute commands, or assert expected outputs.
   - `Rollback`: Revert changes safely to an uncorrupted prior state.

4. **Anti-Slop Filter**:
   - Eliminate conversational filler, pleasantries, and throat-clearing (*"It is important to note that...", "Please make sure to...", "As we know..."*).
   - Start sentences directly with the subject or an imperative verb.
   - Preserve standard English technical terminology (*race condition, idempotency, blast radius, payload, lockfile, AST seam*).
