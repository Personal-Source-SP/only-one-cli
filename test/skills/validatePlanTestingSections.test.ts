import { describe, expect, it } from 'vitest';

import { validatePlan } from '../../assets/agents/skills/only-one-plan/scripts/validate-plan';

describe('validatePlan Section 3 Testing & Sanity Structure', () => {
    const basePlan = `---
status: planned
slug: test-plan
---

## Section 1. Directory Structure Changes
\`\`\`text
src/index.ts
\`\`\`

## Section 1.5. Story Board
### Story 1: Test
\`\`\`mermaid
flowchart LR
    A --> B
\`\`\`
`;

    it('should pass validation when plan has Section 3.1 table and Section 3.2 formatted trials (TC-VAL-01)', () => {
        const validContent = `${basePlan}
## Section 3. Test Cases & Verification Matrix

### 3.1. Test Case Specification Matrix
| Test ID | Module | Nhóm | Kịch bản BDD | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | core | Happy Path | Given valid input, When run, Then pass | expect(true).toBe(true) |

### 3.2. Runtime Sanity & Trial Execution Steps
#### Trial 1: [CLI] Kiểm tra cờ lệnh
- **Command**: \`only-one --help\`
- **Expected Exit Code**: \`0\`

## Section 4. File Changes
### 1. \`[NEW]\` \`src/index.ts\`
- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track Dev)\`
- **Depends On**: None.
\`\`\`diff
@@ -0,0 +1 @@
+export const x = 1;
\`\`\`
`;
        const result = validatePlan(validContent);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.includes('Section 3.2'))).toBe(false);
    });

    it('should not warn about Section 3.2 when plan contains only non-code tasks (TC-VAL-02)', () => {
        const nonCodeContent = `${basePlan}
## Section 3. Test Cases & Verification Matrix
### 3.1. Test Case Specification Matrix
| Test ID | Module | Nhóm | Kịch bản BDD | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | doc | Happy Path | Given doc change, When read, Then clear | verified |

## Section 4. File Changes
### 1. \`[MODIFY]\` \`docs/readme.md\`
- **Status**: \`[ ]\`
- **Task Type**: \`non-code\`
- **Wave**: \`1 (Track Doc)\`
- **Depends On**: None.
\`\`\`diff
@@ -1 +1 @@
-# old
+# new
\`\`\`
`;
        const result = validatePlan(nonCodeContent);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.includes('Section 3.2'))).toBe(false);
    });

    it('should warn when code tasks exist but Section 3.2 Runtime Sanity is missing (TC-VAL-03)', () => {
        const missingSanityContent = `${basePlan}
## Section 3. Test Cases & Verification Matrix
### 3.1. Test Case Specification Matrix
| Test ID | Module | Nhóm | Kịch bản BDD | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | core | Happy Path | Given valid input, When run, Then pass | expect(true).toBe(true) |

## Section 4. File Changes
### 1. \`[NEW]\` \`src/index.ts\`
- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track Dev)\`
- **Depends On**: None.
\`\`\`diff
@@ -0,0 +1 @@
+export const x = 1;
\`\`\`
`;
        const result = validatePlan(missingSanityContent);

        expect(result.warnings.some((w) => w.includes('Missing Section 3.2 Runtime Sanity'))).toBe(true);
    });

    it('should warn when Section 3.2 has unformatted trial blocks (TC-VAL-04)', () => {
        const unformattedSanityContent = `${basePlan}
## Section 3. Test Cases & Verification Matrix
### 3.1. Test Case Specification Matrix
| Test ID | Module | Nhóm | Kịch bản BDD | Kết quả Mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | core | Happy Path | Given valid input, When run, Then pass | expect(true).toBe(true) |

### 3.2. Runtime Sanity & Trial Execution Steps
Chạy lệnh kiểm tra thủ công không theo format trial.

## Section 4. File Changes
### 1. \`[NEW]\` \`src/index.ts\`
- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track Dev)\`
- **Depends On**: None.
\`\`\`diff
@@ -0,0 +1 @@
+export const x = 1;
\`\`\`
`;
        const result = validatePlan(unformattedSanityContent);

        expect(result.warnings.some((w) => w.includes('Section 3.2 missing formatted trial blocks'))).toBe(true);
    });
});
