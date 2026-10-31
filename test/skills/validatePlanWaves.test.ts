import { describe, expect, it } from 'vitest';

import { validatePlan } from '../../assets/agents/skills/only-one-plan/scripts/validate-plan';

describe('validatePlan Execution Waves & Builder/Tester Separation', () => {
    const basePlanHeader = `---
status: planned
slug: test-plan
---

## Section 1. Directory Structure Changes

\`\`\`text
src/
└── index.ts
\`\`\`

## Section 1.5. Story Board

### Story 1: Test Story
\`\`\`mermaid
flowchart LR
    A --> B
\`\`\`

## Section 3. Test Cases & Verification Matrix

| Test ID | Target |
| :--- | :--- |
| T1 | test |

## Section 4. File Changes
`;

    it('should validate plan with correct Wave metadata and Builder/Tester separation', () => {
        const validPlan = `${basePlanHeader}
### 1. \`[NEW]\` \`test/service.test.ts\`

- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track QA)\`
- **Depends On**: None.

\`\`\`diff
@@ -0,0 +1,2 @@
++export const TestQA = true;
\`\`\`

### 2. \`[NEW]\` \`src/service.ts\`

- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`2 (Track Dev)\`
- **Depends On**: ### 1.

\`\`\`diff
@@ -0,0 +1,2 @@
++export const Service = true;
\`\`\`
`;
        const result = validatePlan(validPlan);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should support Dedicated QA Track without errors', () => {
        const qaTrackPlan = `${basePlanHeader}
### 1. \`[NEW]\` \`test/fixtures/order.fixture.ts\`

- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track QA)\`
- **Depends On**: None.

\`\`\`diff
@@ -0,0 +1,2 @@
++export const mockPayload = true;
\`\`\`
`;
        const result = validatePlan(qaTrackPlan);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should issue a warning for legacy plans missing Wave metadata', () => {
        const legacyPlan = `${basePlanHeader}
### 1. \`[NEW]\` \`src/legacy.ts\`

- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Depends On**: None.

\`\`\`diff
@@ -0,0 +1,2 @@
++export const Legacy = true;
\`\`\`
`;
        const result = validatePlan(legacyPlan);
        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.includes('Missing Wave metadata'))).toBe(true);
    });

    it('should report an error when Wave dependency is inverted', () => {
        const invertedPlan = `${basePlanHeader}
### 1. \`[NEW]\` \`src/step-one.ts\`

- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track Dev)\`
- **Depends On**: ### 2.

\`\`\`diff
@@ -0,0 +1,2 @@
++export const One = true;
\`\`\`

### 2. \`[NEW]\` \`src/step-two.ts\`

- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`2 (Track Dev)\`
- **Depends On**: None.

\`\`\`diff
@@ -0,0 +1,2 @@
++export const Two = true;
\`\`\`
`;
        const result = validatePlan(invertedPlan);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('Wave dependency inversion'))).toBe(true);
    });

    it('should report an error when multiple tasks in the same Wave target the same file', () => {
        const collisionPlan = `${basePlanHeader}
### 1. \`[MODIFY]\` \`src/shared.ts\`

- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track Dev)\`
- **Depends On**: None.

\`\`\`diff
@@ -1,1 +1,2 @@
++export const PartA = true;
\`\`\`

### 2. \`[MODIFY]\` \`src/shared.ts\`

- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track Dev)\`
- **Depends On**: None.

\`\`\`diff
@@ -1,1 +1,2 @@
++export const PartB = true;
\`\`\`
`;
        const result = validatePlan(collisionPlan);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('Multiple tasks in Wave 1 target the same file'))).toBe(true);
    });
});
