---
description: Reproduce, diagnose, approve, fix, and verify a bug using evidence-driven debugging.
---

## Input

```text
/only-one-bug <bug report, symptom, or failing case>
```

## Dependency preflight

1. Check whether plugin `superpowers` and MCP `gitnexus` are available.
2. If either is unavailable, stop and report each missing dependency as a blocker. Ask user to install it or provide an approved alternative.
3. Invoke `superpowers:systematic-debugging` before diagnosis or fix proposals. If an equivalent installed workflow has a different name, use it and state the selected equivalent.
4. Do not silently skip dependency or workflow requirements.

## Discovery

1. Define reported symptom, expected behavior, reproduction conditions, affected users or paths, and severity before changing code or tests.
2. Trace entry point, execution path, state or data boundary, direct dependencies, and direct tests.
3. Use GitNexus to map affected symbols, callers, callees, dependent modules, and direct test coverage.
4. Reproduce with the smallest reliable test, command, fixture, or request. Preserve error output, assertion, log, or equivalent evidence.
5. Separate confirmed facts, hypotheses, and unknowns. Do not infer root cause from symptoms alone.
6. If reliable reproduction is unavailable, report attempts, evidence, remaining hypotheses, and smallest next diagnostic step. Do not add diagnostics, telemetry, or failing tests without explicit confirmation.

## Impact, plan, and approval

1. Confirm root cause and affected scope. Check callers, error paths, backward compatibility, and regression risk.
2. Run GitNexus impact analysis for proposed changed symbols, reachable callers, downstream dependencies, contract boundaries, and direct test coverage.
3. If GitNexus index is stale or incomplete, report limitation and use targeted source/test discovery. Do not claim complete impact coverage.
4. Present reproduction evidence, root cause, minimal fix, affected files, impact findings, regression test plan, risks, and rollback or mitigation for security, data-loss, financial, authorization, production-outage, or migration risks.
5. Wait for explicit user confirmation before modifying source, tests, dependencies, configuration, migrations, or data.
6. Approval covers only stated files, contracts, risks, and test plan. Stop for new confirmation if root cause, scope, or risk changes materially.

## After approval

1. Invoke `superpowers:test-driven-development` when a focused regression test can express expected behavior before implementation.
2. Make the smallest fix addressing confirmed root cause. Do not hide symptoms with broad catch blocks, disabled validation, retry loops, or unrelated refactors.
3. Add or update regression coverage.
4. Run the narrowest relevant test, lint, typecheck, and required project checks.
5. Re-run GitNexus impact analysis for changed public symbols or contracts. Expand validation when impacted paths exceed approved scope.
6. Invoke `superpowers:verification-before-completion` before reporting completion.
7. When checks cannot run, report blocker, unverified behavior, and concrete manual verification steps.
8. Report changed files, fresh validation evidence, results, and checks not run.

## Safety

- Do not alter lockfiles, production configuration, database migrations, secrets, or user data solely to work around a symptom.
- Do not log secrets, tokens, credentials, or PII while diagnosing.
