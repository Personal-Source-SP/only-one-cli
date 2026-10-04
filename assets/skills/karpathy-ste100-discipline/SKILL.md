---
name: karpathy-ste100-discipline
description: Enforce Andrej Karpathy's 4 Core Disciplines and 70% ASD-STE100 Aviation Technical Writing Specification for zero-slop Markdown documentation.
---

# Karpathy Disciplines & 70% ASD-STE100 Writing Specification

## Overview

This skill establishes a dual-discipline constraint for AI Agents when designing architectures, generating Markdown documentation, and executing code changes:
1. **Andrej Karpathy's 4 Core Disciplines**: Eliminate silent assumptions, prevent speculative over-engineering, and enforce surgical execution.
2. **70% ASD-STE100 Aviation Writing Specification**: Eliminate "AI Slop", enforce sentence length gates, and structure procedural actions into verifiable 3-part blocks.

---

## 1. Andrej Karpathy 4 Golden Disciplines

| Discipline | Agent Behavioral Invariants |
| :--- | :--- |
| **1. Think Before Coding** | Zero silent assumptions. Explicitly state technical assumptions. Stop and ask the user whenever requirements or edge cases are ambiguous. |
| **2. Simplicity First** | Choose the simplest working solution. Never introduce premature abstractions, generic wrappers, or factory layers without at least 3 concrete use cases (Rule of Three / YAGNI). |
| **3. Surgical Changes** | Touch only files and lines strictly required for the target task. Never perform drive-by refactoring, whitespace reformatting, or style changes on unrelated code. |
| **4. Goal-Driven Execution** | Transform vague tasks into verifiable criteria. Every task block must provide a fast verification command or a binary Pass/Fail test. Loop until all verification criteria pass. |

---

## 2. 70% ASD-STE100 Aviation Writing Specification

ASD-STE100 (Simplified Technical English) originated in aerospace maintenance manuals to prevent ambiguity and human error. In this system, a relaxed 70% specification is enforced for high-density, bilingual Markdown documentation.

### A. Sentence Word Limits
- **Procedural / Instruction Sentences**: Maximum **25 words**.
- **Descriptive / Context Sentences**: Maximum **30 words**.
- Do not write complex multi-clause compound sentences. Break complex thoughts into structured bullet points.

### B. Tri-Part Action Architecture (Aviation Standard)
Every task block in execution artifacts (`plan.md`, `debug.md`) must follow the 3-part structure:
1. **`[Prerequisites]`**: Pre-conditions, required assets, or setup state.
2. **`[Action]`**: Direct imperative statement starting with a controlled action verb.
3. **`[Verification]`**: Measurable, deterministic binary outcome (Pass/Fail).

### C. Controlled Action Verbs
Use consistent technical verbs. Never interchange synonyms arbitrarily:
- `Create`: Initialize a new file, class, interface, table, or asset.
- `Update`: Modify existing logic, contract, or file content.
- `Delete`: Remove obsolete, deprecated, or dead files and symbols.
- `Refactor`: Restructure internal implementation without altering external contracts.
- `Inspect`: Read, analyze, or verify codebase state before taking action.
- `Verify`: Run automated tests, execute commands, or assert expected outputs.
- `Rollback`: Revert changes safely to an uncorrupted prior state.

### D. Zero-Slop Constraint
- **Strictly Prohibited**: Conversational filler, throat-clearing, and verbose pleasantries (*"It is important to note that...", "As we know...", "Please make sure to..."*).
- Start directly with the subject or an imperative verb.
- Preserve standard English for technical terminology (*race condition, idempotency, blast radius, payload, lockfile, AST seam*).
