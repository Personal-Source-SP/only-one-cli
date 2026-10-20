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
## Section 2. File Changes
### 1. [MODIFY] file.ts
- **Status**: [ ]
- **Depends On**: None
- **Fast Test Command**: npm test
\`\`\`diff
+ line
\`\`\`
## Section 3. Test Cases & Verification
`;
        expect(validatePlan(validPlan).valid).toBe(true);
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
