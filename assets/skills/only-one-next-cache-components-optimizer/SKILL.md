---
name: only-one-next-cache-components-optimizer
description: Use when optimizing a Cache Components route for instant navigation, larger prerendered static shell, streamed dynamic content, or a durable instant-navigation regression test.
---

# Cache Components Optimizer

## Preconditions

- Require Next.js 16.3+, App Router, and `cacheComponents: true`.
- Confirm target route already works and project can run production-like build/test rig.
- Prefer version-matched `@next/playwright` and its `instant()` assertion for automated proof. Align it with installed Next.js version.
- Do not optimize by guessing cache freshness, removing authorization, or replacing meaningful shell with blank fallback.

## Workflow

1. Define visible target: content that should appear immediately and data that may stream later.
2. Create failing durable regression test under controlled delayed dynamic data. Test shell presence and instant commit; do not use hand-timed assertions.
3. Preserve existing loading UI where it fits. Push `<Suspense>` boundary down to exact data dependency.
4. Verify visual parity at applicable breakpoints, authorization behavior, dynamic-data freshness, and non-blank meaningful shell.
5. Revert only optimization to confirm regression test fails, then restore change and confirm it passes.
6. Run target route in production-like build and browser; keep regression test with change.

## Completion

- Explain user-visible improvement, shell content, streamed content, and durable evidence.
- Surface decision only when optimization changes user-visible behavior, security, or cache freshness.
