---
name: only-one-gitnexus-freshness
description: Apply GitNexus freshness gates — verify index currency, sync/reindex when stale, enforce preflight scope and public/shared boundary gates. Use whenever making GitNexus-dependent decisions during implementation workflows.
---

GitNexus evidence expires when source has changed since the latest successful index or sync. Apply the following gates before every GitNexus-dependent decision.

## Freshness verification

1. Before each GitNexus-dependent decision, verify the index covers:
   - The current repository
   - The currently checked-out branch
   - The current working-tree revision
   - Status is not `stale` or `incomplete`
2. If the index is not current: stop, sync/reindex using available GitNexus tooling, then repeat the query.
3. Do not claim complete impact coverage from a stale or incomplete index.

## Preflight scope gate

Query only approved symbols and their direct relationships. Do not expand queries beyond the approved allowlist without explicit approval.

## Public/shared boundary gate

Before changing any public symbol or shared contract:
1. Refresh the GitNexus index to ensure it reflects current source.
2. Run impact analysis on the symbol being changed.
3. Stop and report if impact extends beyond the approved allowlist. Wait for explicit approval before proceeding.
4. Do not silently alter shared contracts or assume the impact is confined.

## Integration impact gate (post-implementation)

After source changes, before running `detect_changes` or final impact analysis:
1. Sync/reindex GitNexus to reflect the latest working-tree state.
2. Verify changed symbols do not reach unapproved shared or public surfaces.
3. If final impact exceeds approved scope, stop and update the plan rather than expanding silently.
4. If GitNexus cannot refresh, report the exact blocker and distinguish verified code checks from unverified graph impact.
