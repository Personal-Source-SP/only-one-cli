import { describe, expect, it } from 'vitest';

import { parsePlanTasks } from '../../assets/agents/skills/only-one-apply/scripts/plan-status';

describe('parsePlanTasks Wave Extraction', () => {
    const sampleMultiWavePlan = `
### 1. \`[NEW]\` \`test/service.test.ts\`

- **Status**: \`[x]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track QA)\`
- **Depends On**: None.

### 2. \`[MODIFY]\` \`assets/doc.md\`

- **Status**: \`[x]\`
- **Task Type**: \`non-code\`
- **Wave**: \`1 (Track Doc)\`
- **Depends On**: None.

### 3. \`[MODIFY]\` \`src/service.ts\`

- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`2 (Track Dev)\`
- **Depends On**: ### 1.
`;

    it('should extract wave and track metadata accurately', () => {
        const result = parsePlanTasks(sampleMultiWavePlan);
        expect(result.total).toBe(3);
        expect(result.completed).toBe(2);
        expect(result.pending).toBe(1);

        expect(result.waves).toHaveLength(2);
        expect(result.isMultiWave).toBe(true);
        expect(result.maxWave).toBe(2);

        const wave1 = result.waves[0];
        expect(wave1.wave).toBe(1);
        expect(wave1.tasks).toHaveLength(2);
        expect(wave1.qaTasks).toHaveLength(1);
        expect(wave1.qaTasks[0].filePath).toBe('test/service.test.ts');
        expect(wave1.qaTasks[0].track).toBe('Track QA');
        expect(wave1.status).toBe('completed');

        const wave2 = result.waves[1];
        expect(wave2.wave).toBe(2);
        expect(wave2.tasks).toHaveLength(1);
        expect(wave2.devTasks).toHaveLength(1);
        expect(wave2.devTasks[0].filePath).toBe('src/service.ts');
        expect(wave2.devTasks[0].track).toBe('Track Dev');
        expect(wave2.status).toBe('pending');
    });

    it('should calculate nextWave correctly based on wave order and dependencies', () => {
        const result = parsePlanTasks(sampleMultiWavePlan);
        expect(result.nextWave).toHaveLength(1);
        expect(result.nextWave[0].filePath).toBe('src/service.ts');
    });

    it('should fallback gracefully for legacy plans without Wave metadata', () => {
        const legacyPlan = `
### 1. \`[NEW]\` \`src/legacy.ts\`

- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Depends On**: None.
`;
        const result = parsePlanTasks(legacyPlan);
        expect(result.total).toBe(1);
        expect(result.isMultiWave).toBe(false);
        expect(result.maxWave).toBe(1);
        expect(result.waves).toHaveLength(1);
        expect(result.waves[0].wave).toBe(1);
        expect(result.waves[0].status).toBe('pending');
    });

    it('should classify task status into completed, in-progress, or pending for waves', () => {
        const inProgressPlan = `
### 1. \`[NEW]\` \`src/a.ts\`

- **Status**: \`[x]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track Dev)\`
- **Depends On**: None.

### 2. \`[NEW]\` \`src/b.ts\`

- **Status**: \`[/]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track Dev)\`
- **Depends On**: None.
`;
        const result = parsePlanTasks(inProgressPlan);
        expect(result.waves[0].status).toBe('in-progress');
    });

    it('should accurately categorize tasks with QA track even if not in test folder', () => {
        const customQAPlan = `
### 1. \`[NEW]\` \`fixtures/mock.ts\`

- **Status**: \`[ ]\`
- **Task Type**: \`code\`
- **Wave**: \`1 (Track QA)\`
- **Depends On**: None.
`;
        const result = parsePlanTasks(customQAPlan);
        expect(result.waves[0].qaTasks).toHaveLength(1);
        expect(result.waves[0].qaTasks[0].track).toBe('Track QA');
    });
});
