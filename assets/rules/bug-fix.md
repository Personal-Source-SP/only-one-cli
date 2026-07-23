# Bug Fix

## Required Superpowers Workflows
- Invoke `superpowers:systematic-debugging` before diagnosing or proposing a fix. Follow its phases for evidence, hypothesis testing, root-cause confirmation, and regression prevention.
- After explicit approval, invoke `superpowers:test-driven-development` when a focused regression test can express expected behavior before implementation.
- Before reporting completion, invoke `superpowers:verification-before-completion`. Do not claim fixed without fresh validation evidence.
- If installed Superpowers exposes an equivalent workflow under a different name, use that workflow and state selected equivalent.

## Discovery
- Before changing code or tests, define reported symptom, expected behavior, reproduction conditions, affected users or paths, and severity.
- Use dependency-aware discovery to trace entry point, execution path, state or data boundary, direct dependencies, and direct tests.
- Use GitNexus to map changed symbols, callers, callees, dependent modules, and direct test coverage before proposing a fix.
- Reproduce with smallest reliable test, command, fixture, or request. Keep error output, assertion, log, or other evidence.
- Do not infer root cause from symptoms alone. Separate confirmed facts, hypotheses, and unknowns.
- If reliable reproduction is unavailable, report attempted paths, collected evidence, remaining hypotheses, and smallest next diagnostic step. Do not add diagnostic code, telemetry, or failing tests without explicit confirmation.

## GitNexus Change Assurance
- Before approval, use GitNexus impact analysis to validate proposed changed symbols, reachable callers, downstream dependencies, and contract boundaries.
- Include GitNexus impact findings in fix plan: confirmed unaffected paths, paths requiring regression coverage, and unresolved graph gaps.
- After implementation, re-run GitNexus impact analysis for changed public symbols or contracts. Expand validation when impacted callers, dependents, or tests fall outside original scope.
- If GitNexus index is unavailable, stale, or incomplete, report limitation and use targeted source/test discovery. Do not claim complete impact coverage.

## Analysis and Approval
- Identify root cause and affected scope. Check related callers, error paths, backward compatibility, and regression risk.
- Present reproduction evidence, root cause, minimal proposed fix, affected files, test plan, risks, and rollback or mitigation for security, data-loss, financial, authorization, production-outage, or migration risks.
- Wait for explicit user confirmation before modifying source code, tests, dependencies, configuration, migrations, or data.
- Direct instruction to fix or approval of presented fix plan is explicit confirmation. Confirmation covers only stated files, contracts, risks, and test plan.
- If root cause, scope, or risk changes materially after approval, stop and request new confirmation.

## After Approval
- Make smallest fix addressing confirmed root cause. Do not hide symptoms with broad catch blocks, disabled validation, retry loops, or unrelated refactors.
- Add or update regression coverage. Run narrowest relevant test, lint, typecheck, and required project checks.
- When required checks cannot run, report blocker, unverified behavior, and concrete manual verification steps.
- Report changed files, validation performed, results, and checks not run.

## Safety
- Do not alter lockfiles, production configuration, database migrations, secrets, or user data solely to work around a symptom.
- Do not log secrets, tokens, credentials, or PII while diagnosing.
