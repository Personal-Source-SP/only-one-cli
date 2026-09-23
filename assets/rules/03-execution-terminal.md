---
alwaysApply: true
---

# RULE 3: EXECUTION & TERMINAL

## 1. No Sleep / No Busy-Wait

- NEVER use `sleep` commands under any circumstances.
- DO NOT poll or busy-wait using iterative terminal commands (e.g., repeatedly calling
  `sleep`, `ps`, or checking logs in a loop).
- This prohibition applies to shell commands only. Tool-system scheduling mechanisms
  (e.g., `schedule` tool, cron jobs, reactive wakeup via background task notifications)
  are permitted because they are event-driven, not spin-loop polling.

## 2. Approved Alternatives

If a command or process requires waiting, use exactly one of the following strategies:

1. **Increase timeout directly**: Set `WaitMsBeforeAsync` to a value large enough to cover
   the expected completion time. Do not split the wait into multiple shorter intervals.
2. **True background process**: Start the process as a daemon (`IsDaemon: true`) or
   detached background task. Inspect its log or output file at a single, deterministic
   later step — do not poll between steps.
3. **One-shot readiness check**: For port or socket readiness, run a single check command
   with a built-in timeout and retry — e.g., `wait-on`, `nc -z -w <timeout>`, or
   `curl --retry <n> --retry-delay 0 --retry-connrefused`. Set `WaitMsBeforeAsync` large
   enough to cover the entire retry window. Do not loop this check manually across steps.
4. **Reactive wakeup**: For long-running background tasks, use the `schedule` tool to set
   a one-shot timer or listen for task completion notifications instead of checking status
   in a loop.
5. **Hard-stop on timeout**: If the process fails to yield output within the designated
   timeout, STOP immediately. Report the current status and ask the user for clarification
   instead of attempting to wait indefinitely.
