# Code Review & Business Acceptance Guidelines

Comprehensive guidelines and verification criteria for reviewing code from a Product / Business Analyst (BA) perspective, ensuring code changes satisfy both technical standards and real-world domain requirements.

---

## 1. Context & Review Principles

- **Product Engineer & BA Mindset**: The system is a real-world production application, not an academic checklist exercise. Code changes must uphold business workflows, preserve intended user behavior, and prevent regressions.
- **Cross-Verification Scope**: Reviewers must cross-reference pull requests against business specifications, acceptance criteria, tickets, user journeys, API contracts, and critical edge cases.

---

## 2. 7 Mandatory Review Audit Categories

### 1. Business Requirements Alignment
- Verify code covers all mandatory business preconditions and acceptance criteria.
- Ensure business rules fire at the correct lifecycle phase and within proper security boundaries.
- Catch subtle logical discrepancies where syntax is valid but domain behavior is flawed.

### 2. User Flows & UI State Handling
- Trace end-to-end user workflows from initiation to successful completion.
- Verify comprehensive UI state handling: `Create`, `Edit`, `Detail`, `Filter/Search`, `Save`, `Cancel`, `Error`, `Loading`, and `Empty` states.
- Test edge branches, cancellation actions, and mid-workflow interruptions.

### 3. Data Integrity & API Contracts
- Verify UI rendering matches API response contracts accurately.
- Validate outgoing request payloads: complete fields, exact field names, correct types (`number`, `string`, `boolean`, `array`), and proper formats (e.g., ISO timestamps).
- Ensure edit forms map existing data accurately via `initialValuesMapper` to avoid overwriting or clearing unedited fields.
- Safeguard handling of `null`, `undefined`, and backward-compatible schemas.

### 4. Validation & Exception Rules
- Inspect required fields, string length bounds, numeric ranges, and inter-field dependencies.
- Ensure validation error messages are localized, concise, and actionable.
- Guard edge conditions: missing datasets, duplicate submissions, expired sessions, and locked states.
- Keep frontend validations synchronized with backend constraints.

### 5. Side Effects & Regression Analysis
- Identify collateral modules, shared components, or permissions impacted by the change.
- Verify existing legacy features remain intact without unintended alterations.
- Audit permission guards, role-based access control (RBAC), and conditional route access.

### 6. Internationalization (i18n) & Copywriting
- All UI text must be routed through localization hooks (`t(...)`); NEVER hardcode raw strings in TSX.
- Verify clarity, tone, and domain accuracy across all supported locales (e.g., Vietnamese and English).
- Verify labels, placeholders, tooltips, validation messages, button text, and column headers.

### 7. UX & Operational Ergonomics
- Cross-reference with [ui-ux-guidelines.md](ui-ux-guidelines.md) for color contrast, responsive layouts, empty states, and accessibility.
- Adhere to the Component Priority Cascade: `@/components` > `antd` > `TailwindCSS`.
- Provide responsive layouts across Desktop, Tablet, and Mobile viewports.
- Prevent accidental data loss (e.g., provide confirmation on closing unsaved Form Drawers/Modals).

---

## 3. BA Inquisitive Review Prompts

When evaluating pull requests, ask these critical questions:
1. *Does this scenario occur in daily production operations?*
2. *How does the UI render if existing records lack newly introduced fields?*
3. *Is the user feedback clear and immediately actionable when an API fails?*
4. *Does this business rule apply universally or only to specific user roles?*
5. *What happens if the user double-clicks submit or performs actions out of order?*

---

## 4. Structured Review Feedback & Severity Levels

Every review comment must follow this structured format:
- **Issue**: Concise description of the defect or omission.
- **Business Expectation**: Intended system behavior according to specifications.
- **Evidence**: Line number, file path, screenshot, reproduction steps, or request payload.
- **Severity**: `Blocker` | `Major` | `Minor` | `Suggestion`.
- **Recommendation**: Proposed technical fix or question for product owner clarification.

### Severity Classification:
- 🚫 **Blocker**: Blocks primary user flow, causes severe data corruption, data loss, or security/authorization breach.
- ⚠️ **Major**: Degrades operational workflow, causes data confusion, or omits critical boundary validation.
- 💬 **Minor**: Cosmetic inconsistency, minor i18n typo, or non-blocking layout glitch.
- 💡 **Suggestion**: Non-blocking recommendation for cleaner code, better UX, or performance gain.

---

## 5. Review Verdicts

- **Approve**: Satisfies all business and technical criteria; ready to merge.
- **Approve with comments**: Accepted for merge once minor/suggestion points are addressed.
- **Request changes**: Requires code corrections due to Blocker or Major findings.
- **Need BA/PO confirmation**: Ambiguities in business requirements requiring PM/PO alignment.
