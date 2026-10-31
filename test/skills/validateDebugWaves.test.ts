import { describe, expect, it } from 'vitest';

import { validateDebugDoc } from '../../assets/agents/skills/only-one-debug/scripts/validate-debug';

describe('validateDebugDoc Wave & Plan Architecture', () => {
    const baseDebugHeader = `---
status: planning
slug: test-debug-issue
created_at: 2026-10-31T08:00:00.000Z
reproduction_test: npm test test/defect.test.ts
---

# Debug: Test Defect Issue

## Section 1. Diagnosis & Directory Structure Changes
### Symptom
- Actual: Defect occurred.

### Reproduction
- Command: npm test test/defect.test.ts

### Directory Structure Changes
\`\`\`text
src/
└── index.ts
\`\`\`

## Section 2. Defect User Story & Reproduction Scenarios
### Story 1: Defect Story
\`\`\`mermaid
flowchart LR
    A --> B
\`\`\`

## Section 3. Test Cases & Verification Matrix
| Test ID | Defect Ref | Target |
| :--- | :--- | :--- |
| TC-01 | DEF-1 | test |

### Automated Test Execution Commands
- npm test test/defect.test.ts

## Section 4. File Changes
`;

    it('validates compliant 4-section debug document with Wave and Track QA/Dev', () => {
        const validDoc = `${baseDebugHeader}
### 1. \`[NEW]\` \`test/defect.test.ts\`
- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track QA)\`
- **Depends On**: None.

\`\`\`diff
@@ -0,0 +1,2 @@
++export const Reproduction = true;
\`\`\`

### 2. \`[MODIFY]\` \`src/defect.ts\`
- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`2 (Track Dev)\`
- **Depends On**: ### 1.

\`\`\`diff
@@ -1,1 +1,2 @@
++export const Fix = true;
\`\`\`
`;
        const result = validateDebugDoc(validDoc);
        expect(result.valid).toBe(true);
        expect(result.taskCount).toBe(2);
        expect(result.errors).toHaveLength(0);
    });

    it('detects duplicate Section 3 heading error', () => {
        const duplicateSection3Doc = `${baseDebugHeader}
### 1. \`[NEW]\` \`test/defect.test.ts\`
- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track QA)\`
- **Depends On**: None.

\`\`\`diff
@@ -0,0 +1,2 @@
++export const Reproduction = true;
\`\`\`

## Section 3. Verification
### Red Feedback Loop
- [ ] Passes
`;
        const result = validateDebugDoc(duplicateSection3Doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('Duplicate Section 3'))).toBe(true);
    });

    it('reports an error when Wave dependency is inverted', () => {
        const invertedDoc = `${baseDebugHeader}
### 1. \`[NEW]\` \`src/defect.ts\`
- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track Dev)\`
- **Depends On**: ### 2.

\`\`\`diff
@@ -0,0 +1,2 @@
++export const Fix = true;
\`\`\`

### 2. \`[NEW]\` \`test/defect.test.ts\`
- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`2 (Track QA)\`
- **Depends On**: None.

\`\`\`diff
@@ -0,0 +1,2 @@
++export const Reproduction = true;
\`\`\`
`;
        const result = validateDebugDoc(invertedDoc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('Wave dependency inversion'))).toBe(true);
    });

    it('reports an error when multiple tasks in the same Wave target the same file', () => {
        const collisionDoc = `${baseDebugHeader}
### 1. \`[MODIFY]\` \`src/defect.ts\`
- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track Dev)\`
- **Depends On**: None.

\`\`\`diff
@@ -1,1 +1,2 @@
++export const PartA = true;
\`\`\`

### 2. \`[MODIFY]\` \`src/defect.ts\`
- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track Dev)\`
- **Depends On**: None.

\`\`\`diff
@@ -1,1 +1,2 @@
++export const PartB = true;
\`\`\`
`;
        const result = validateDebugDoc(collisionDoc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('Multiple tasks in Wave 1 target the same file'))).toBe(true);
    });

    it('issues a warning for legacy debug documents missing Wave metadata', () => {
        const legacyDoc = `${baseDebugHeader}
### 1. \`[NEW]\` \`src/legacy.ts\`
- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Depends On**: None.

\`\`\`diff
@@ -0,0 +1,2 @@
++export const Legacy = true;
\`\`\`
`;
        const result = validateDebugDoc(legacyDoc);
        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.includes('Missing Wave metadata'))).toBe(true);
    });
});

