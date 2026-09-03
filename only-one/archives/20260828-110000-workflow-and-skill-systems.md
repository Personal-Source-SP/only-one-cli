---
id: 20260828-110000-workflow-and-skill-systems
title: Unified Architecture of Workflows, Skills Catalog, Dual-Layer Blueprints, Reuse Guardrails & Full Stack Skill Suites
archived_at: 2026-08-28
status: active
references: []
affected_modules:
  - assets/skills
  - assets/workflows
  - .agents/workflows
  - .agents/skills
  - src/core/templates
  - only-one/rules.md
  - only-one/learn
---

# Archive: Unified Architecture of Workflows, Skills Catalog, Dual-Layer Blueprints, Reuse Guardrails & Full Stack Skill Suites

## 1. Problem Statement & Core Value

### 1.1. Core Problems
1. **Unstructured & Duplicate Code Generation**: AI agents previously lacked pre-implementation code inspection guardrails, frequently reinventing helper utilities, base abstractions, or models instead of reusing established project code.
2. **Monolingual Friction & Semantic Drift**: Mixing Vietnamese and English across architecture reference documents degraded LLM reasoning accuracy and token efficiency.
3. **Weak Lifecycle Boundaries**: Agents occasionally skipped planning phases or executed premature code modifications during exploratory `/only-one-idea` runs.

### 1.2. Core Value & Solutions
1. **Tiered 5-Phase Skills Classification**: Categorized all 29 skills across Define, Plan, Build, Verify/Debug, and Review/Ship.
2. **3-Phase Collaboration & Terminal Gate in `/only-one-idea`**: Separates BA discovery interview $\rightarrow$ Tech Lead trade-offs & ASCII mockups $\rightarrow$ PO consensus gate with strict no-code terminal stopping.
3. **3-Layer Defense-in-Depth for Code Reuse**:
   - *Skills Layer*: Mandatory Reuse-First Invariant (`0. Anti-Reinvention Rule`).
   - *Planning Layer*: Mandatory Pre-implementation Codebase Audit (`Step 1b`) & Reused Utilities column in Section 3.1 Task Matrix.
   - *Execution Layer*: Pre-apply Context & Existing Imports Inspection (`Step 4a`).
4. **Dual-Layer Architecture**: Formatted documents with human-friendly narrative and machine-readable execution tables (Section 3.1 Task Matrix with `Order`, `Status`, `Action`, `File Path`, `Target Symbols`, `Depends On`, `Fast Test Command`).
5. **Full Stack Skill Suites Standardization**:
   - **NestJS Development (`assets/skills/only-one-nestjs-development/`)**: 100% technical English across `SKILL.md` and 13 reference files; class-level `@Auth()` and `@ApiUnauthorizedResponse` security; granular `src/shared/` (`SharedModule`) architecture; strict MikroORM uninitialized relation guards.
   - **Next.js Development (`assets/skills/only-one-nextjs-development/`)**: 100% technical English across `SKILL.md` and 12 reference files; Headless API Hook & UI separation; complete 18-hook catalog; modern React 18/19 hooks; strict 200 LOC ceiling for presentation orchestrators.

---

## 2. Key Architecture & Decisions

### 2.1. Complete 5-Phase Skills Lifecycle
```mermaid
flowchart TD
    Idea["/only-one-idea (WHAT & WHY)\n- BA Discovery Interview\n- Tech Lead Options & Mockups\n- PO Consensus Gate (concept.md)"]
    --> Plan["/only-one-plan (HOW & BLUEPRINT)\n- Step 1b Reuse-First Audit\n- Machine-Readable Task Matrix\n- Reused Utilities Mapping"]
    Plan --> Apply["/only-one-apply (EXECUTION)\n- Step 4a Pre-apply Inspection\n- Incremental TDD & Fast Test"]
    Apply --> Debug["/only-one-debug (RCA)\n- diagnosing-bugs Red Loop"]
    Apply --> Review["/only-one-review (5-AXIS AUDIT)\n- Multi-Perspective Subagents"]
    Review --> PR["/only-one-pr-git (SHIPPING)\n- Conventional Commit Tags"]
    PR --> Clean["/only-one-clean & /only-one-archive\n- Step 0 Pre-Clean Auto-Archive\n- Sync rules.md & learn/*.md\n- Ground Truth Verification"]
```

### 2.2. Standard Full Stack Production Patterns
- **NestJS Controller Security**:
  ```ts
  @Controller('features')
  @ApiTags('features')
  @ApiBearerAuth()
  @Auth()
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  export class FeatureController extends BaseController {
    @Post()
    @Permissions(PermissionGroups.FEATURE, PermissionActions.CREATE)
    async create(@Body() request: CreateFeatureRequest): Promise<ResponseDto<FeatureDto>> {
      const result = await this.featureService.create(request);
      return this.getResponse(true, result);
    }
  }
  ```
- **Next.js Headless Hook & UI Orchestration**:
  - `src/pages/<feature>/hooks/use-<feature>-page.ts`: Encapsulates `useCustomTable`, `useCustomDrawerForm`, `useCustomSelect`, initial values mapping, and mutation queries.
  - `src/pages/<feature>/index.tsx`: Pure presentation layout (<200 LOC) consuming the headless page hook.

---

## 3. Verification & Evidence

- **Unit & Regression Test Suites**: 50 test suites passed, 201+ tests passed (100% pass rate).
- **Compilation & Formatting**: Clean TypeScript build and Prettier format validation.
- **Prebuilt Packaging**: `npm run publish:local` built and packaged cleanly.
