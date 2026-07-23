# Bug Fix

## Discovery
- Before changing code or tests, define reported symptom, expected behavior, reproduction conditions, affected users or paths, and severity.
- Use dependency-aware discovery to trace entry point, execution path, state or data boundary, direct dependencies, and direct tests.
- Reproduce with smallest reliable test, command, fixture, or request. Keep error output, assertion, log, or other evidence.
- Do not infer root cause from symptoms alone. Separate confirmed facts, hypotheses, and unknowns.

## Analysis and Approval
- Identify root cause and affected scope. Check related callers, error paths, backward compatibility, and regression risk.
- Present reproduction evidence, root cause, minimal proposed fix, affected files, test plan, and risks.
- Wait for explicit user confirmation before modifying source code, tests, dependencies, configuration, migrations, or data.

## After Approval
- Make smallest fix addressing confirmed root cause. Do not hide symptoms with broad catch blocks, disabled validation, retry loops, or unrelated refactors.
- Add or update regression coverage. Run narrowest relevant test, lint, typecheck, and required project checks.
- Report changed files, validation performed, results, and checks not run.

## Safety
- Do not alter lockfiles, production configuration, database migrations, secrets, or user data solely to work around a symptom.
- Do not log secrets, tokens, credentials, or PII while diagnosing.
