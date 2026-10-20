---
name: anti-tautology-testing
description: Enforce non-tautological, falsifiable unit and integration testing. Eliminates mock-mirroring, trivial assertions, and vacuous test suites.
---

# Anti-Tautology Testing (Behavioral Falsifiability Discipline)

## Overview

This skill prevents the Tautological Test anti-pattern where tests pass vacuously regardless of implementation defects. Enforces the Falsifiability Invariant: a test is valid only if it fails when business logic is broken or mutated.

## Core Testing Disciplines

### 1. Falsifiability & Red-First Invariant
- A test must fail if the core business logic is removed or returns incorrect values.
- Temporarily invert conditions (e.g. mutate `>` to `<`) to verify the test suite turns Red before finalizing.

### 2. Anti-Mock-Mirroring (Strictly Forbidden)
- 🛑 **NEVER_DO**: Assert the exact values configured on mocks (e.g. `mockFn.mockReturnValue(x); expect(call()).toBe(x);`).
- **MUST_DO**: Verify observable state transitions and contract outputs against real logic.

### 3. Anti-Trivial Assertions (Strictly Forbidden)
- 🛑 **NEVER_DO**: Use vacuous assertions such as `toBeDefined()`, `toBeTruthy()`, `toBe(true)`, `not.toBeNull()`.
- **MUST_DO**: Use precise structural assertions (`toEqual`, `toStrictEqual`, `toMatchObject`) with expected payload values.

### 4. Boundary & Negative Invariants
- Every functional module must test edge cases: null, undefined, empty array, empty string, and thrown exceptions.
