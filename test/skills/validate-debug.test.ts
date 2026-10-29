import { describe, expect, it } from 'vitest';
import { validateDebugDoc } from '@assets/skills/only-one-debug/scripts/validate-debug.js';

describe('validateDebugDoc', () => {
    const sample4SectionDoc = `---
status: planning
slug: sample-bug-fix
created_at: 2026-10-29T10:00:00.000Z
---

# Debug: Sample Bug Fix

## Section 1. Diagnosis & Directory Structure Changes
### Symptom
- Actual: Error occurred.

## Section 2. Defect User Story & Reproduction Scenarios
### Story 1: Fix Defect
- User Story: As a user...

## Section 3. Test Cases & Verification Matrix
| Test ID | Defect Ref | Kịch bản Kiểm thử | Điều kiện đầu vào | Kết quả kỳ vọng (Assertions) | Loại test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| TC-01 | Bug | Reproduce defect | trigger input | expected result | Unit | [ ] |

### Automated Test Execution Commands
- npm test test/sample.test.ts

## Section 4. File Changes

### 1. [MODIFY] test/sample.test.ts
- **Status**: [ ]
- **Task Type**: code
- **Context**: Test context.
- **Target Symbols / AST Seams**: describe
- **Invariants**: Must pass.
- **Depends On**: None.

\`\`\`diff
@@ -1 +1 @@
-old
+new
\`\`\`

### 2. [MODIFY] src/sample.ts
- **Status**: [ ]
- **Task Type**: code
- **Context**: Source context.
- **Target Symbols / AST Seams**: method
- **Invariants**: Safe.
- **Depends On**: test/sample.test.ts

\`\`\`diff
@@ -1 +1 @@
-old
+new
\`\`\`
`;

    it('validates compliant 4-section debug document successfully', () => {
        const result = validateDebugDoc(sample4SectionDoc);
        expect(result.valid).toBe(true);
        expect(result.taskCount).toBe(2);
        expect(result.errors).toEqual([]);
    });

    it('allows task blocks without Fast Test Command', () => {
        const result = validateDebugDoc(sample4SectionDoc);
        expect(result.warnings.some((w) => /Fast Test Command/i.test(w))).toBe(false);
    });

    it('warns when Section 3 is missing Test Matrix table', () => {
        const docWithoutMatrix = sample4SectionDoc.replace('| Test ID | Defect Ref |', '| Other Header | Other Ref |');
        const result = validateDebugDoc(docWithoutMatrix);
        expect(result.warnings.some((w) => w.includes('Missing Test Matrix table'))).toBe(true);
    });

    it('supports backward compatibility for legacy 3-section debug docs', () => {
        const legacyDoc = `---
status: planning
---
# Debug: Legacy
## Section 1. Reproduction & Root Cause
## Section 2. File Changes
### 1. [MODIFY] src/legacy.ts
- **Status**: [ ]
- **Task Type**: code
- **Depends On**: None.
\`\`\`diff
@@ -1 +1 @@
\`\`\`
## Section 3. Verification
`;
        const result = validateDebugDoc(legacyDoc);
        expect(result.valid).toBe(true);
    });

    it('detects missing frontmatter or invalid structure', () => {
        const invalidDoc = `# Debug\nNo frontmatter`;
        const result = validateDebugDoc(invalidDoc);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    it('enforces pragmatic TDD ordering in task blocks', () => {
        const badTddDoc = `---
status: planning
---
# Debug: Bad TDD
## Section 1. Diagnosis & Directory Structure Changes
## Section 2. Defect User Story & Reproduction Scenarios
## Section 3. Test Cases & Verification Matrix
| Test ID |
| TC-01 |
## Section 4. File Changes
### 1. [MODIFY] src/sample.ts
- **Status**: [ ]
- **Task Type**: code
- **Depends On**: None
\`\`\`diff
+ line
\`\`\`
### 2. [NEW] src/sample.test.ts
- **Status**: [ ]
- **Task Type**: code
- **Depends On**: None
\`\`\`diff
+ line
\`\`\`
`;
        const result = validateDebugDoc(badTddDoc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('Pragmatic TDD violation'))).toBe(true);
    });
});
