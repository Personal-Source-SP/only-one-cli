import { describe, expect, it } from 'vitest';
import { aggregateImprovements } from '@assets/skills/only-one-evolve/scripts/aggregate.js';
import { lintSkill } from '@assets/skills/only-one-evolve/scripts/lint-skill.js';
import { validatePlan } from '@assets/skills/only-one-plan/scripts/validate-plan.js';
import { parsePlanTasks } from '@assets/skills/only-one-apply/scripts/plan-status.js';
import { validateFlashDiff } from '@assets/skills/only-one-flash/scripts/validate-flash-diff.js';
import { validateDebugDoc } from '@assets/skills/only-one-debug/scripts/validate-debug.js';
import { validateReviewDoc } from '@assets/skills/only-one-review/scripts/validate-review.js';

describe('Deterministic SDLC Skills Scripts', () => {
    it('lints valid SKILL.md and flags ASD-STE100 long sentences', () => {
        const valid = `---
name: test
description: test
---
# Test
## Overview
Overview.
## Guardrails
- **MUST_DO**: Fast test verification.
`;
        expect(lintSkill(valid).valid).toBe(true);

        const invalid = `---
name: test
description: test
---
# Test
## Overview
Overview.
## Guardrails
- **MUST_DO**: This is an extremely long and unnecessarily verbose instruction sentence that clearly and undeniably violates the strict twenty-five word limitation mandated by ASD-STE100 technical aviation writing rules and should be rejected.
`;
        expect(lintSkill(invalid).valid).toBe(false);
    });

    it('aggregates pending improvements gracefully on empty dir', () => {
        const res = aggregateImprovements('/empty-test-dir');
        expect(res.totalPending).toBe(0);
        expect(res.bySkill).toEqual({});
    });

    it('validates plan structure and diff presence', () => {
        const validPlan = `---
slug: test
status: planned
---
# Plan
## Section 1. Directory Structure Changes
## Section 1.5. Story Board
### Story 1: Feature [MODIFY]
- **Before**: Old behavior.
- **After**: New behavior.
\`\`\`mermaid
flowchart LR
    A --> B
\`\`\`
## Section 2. File Changes
### 1. [MODIFY] file.ts
- **Status**: [ ]
- **Task Type**: code
- **Depends On**: None
- **Fast Test Command**: npm test file.test.ts
\`\`\`diff
+ line
\`\`\`
### 2. [NEW] file.test.ts
- **Status**: [ ]
- **Task Type**: code
- **Depends On**: file.ts
- **Fast Test Command**: npm test file.test.ts
**Test Matrix**:
- [ ] Happy Path
- [ ] Boundary / Edge Cases
- [ ] Failure / Error Handling
\`\`\`diff
+ line
\`\`\`
### 3. [MODIFY] README.md
- **Status**: [ ]
- **Task Type**: non-code
- **Depends On**: None
- **Fast Test Command**: None (Non-code task)
\`\`\`diff
+ doc
\`\`\`
## Section 3. Test Cases & Verification
`;
        expect(validatePlan(validPlan).valid).toBe(true);
    });

    it('flags error when plan is missing Section 1.5 Story Board', () => {
        const invalidPlan = `---
slug: test
status: planned
---
# Plan
## Section 1. Directory Structure Changes
## Section 2. File Changes
### 1. [MODIFY] file.ts
- **Status**: [ ]
- **Task Type**: code
- **Fast Test Command**: npm test
\`\`\`diff
+ line
\`\`\`
## Section 3. Test Cases & Verification
`;
        const res = validatePlan(invalidPlan);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('Missing ## Section 1.5. Story Board');
    });

    it('flags warning when story in Section 1.5 is missing diagram', () => {
        const planWithoutDiagram = `---
slug: test
status: planned
---
# Plan
## Section 1. Directory Structure Changes
## Section 1.5. Story Board
### Story 1: Feature [MODIFY]
- **Before**: Old.
- **After**: New.
## Section 2. File Changes
### 1. [MODIFY] file.ts
- **Status**: [ ]
- **Task Type**: code
- **Fast Test Command**: npm test file.test.ts
\`\`\`diff
+ line
\`\`\`
## Section 3. Test Cases & Verification
`;
        const res = validatePlan(planWithoutDiagram);
        expect(res.warnings.some((w) => w.includes('Missing flow/state diagram in storyboard'))).toBe(true);
    });

    it('flags error when task block is missing Task Type', () => {
        const invalidPlan = `---
slug: test
status: planned
---
# Plan
## Section 1. Directory Structure Changes
## Section 1.5. Story Board
## Section 2. File Changes
### 1. [MODIFY] file.ts
- **Status**: [ ]
- **Fast Test Command**: npm test
\`\`\`diff
+ line
\`\`\`
## Section 3. Test Cases & Verification
`;
        const res = validatePlan(invalidPlan);
        expect(res.valid).toBe(false);
        expect(res.errors.some((e) => e.includes('Missing or invalid Task Type'))).toBe(true);
    });

    it('flags error when non-code task has test file or test command', () => {
        const invalidPlan = `---
slug: test
status: planned
---
# Plan
## Section 1. Directory Structure Changes
## Section 1.5. Story Board
## Section 2. File Changes
### 1. [MODIFY] file.test.ts
- **Status**: [ ]
- **Task Type**: non-code
- **Fast Test Command**: None
\`\`\`diff
+ line
\`\`\`
## Section 3. Test Cases & Verification
`;
        const res = validatePlan(invalidPlan);
        expect(res.valid).toBe(false);
        expect(res.errors.some((e) => e.includes('Non-code tasks must not target test files'))).toBe(true);
    });

    it('parses plan tasks and partitions next wave', () => {
        const planContent = `
### 1. [MODIFY] a.ts
- **Status**: [ ]
- **Depends On**: None
### 2. [MODIFY] b.ts
- **Status**: [ ]
- **Depends On**: a.ts
`;
        const status = parsePlanTasks(planContent);
        expect(status.total).toBe(2);
        expect(status.nextWave).toHaveLength(1);
        expect(status.nextWave[0].filePath).toBe('a.ts');
    });

    it('validates flash diff lines constraint', () => {
        const smallDiff = '+ line1\n+ line2';
        expect(validateFlashDiff(smallDiff).valid).toBe(true);
        const bigDiff = Array(150).fill('+ line').join('\n');
        expect(validateFlashDiff(bigDiff).valid).toBe(false);
    });

    it('validates debug doc sections', () => {
        const debug = `# Debug`;
        expect(validateDebugDoc(debug).valid).toBe(false);
    });

    it('validates review doc findings', () => {
        const review = `# Review\nZero actionable findings`;
        expect(validateReviewDoc(review).valid).toBe(true);
    });
});
