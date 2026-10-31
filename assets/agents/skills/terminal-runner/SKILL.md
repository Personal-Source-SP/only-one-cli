---
name: terminal-runner
description: Execute shell commands, test CLI features, strip ANSI escape codes, and isolate failure stack traces.
---

# Terminal Runner (Command Execution & CLI Testing Skill)

## Overview
Operates as an isolated worker subagent to run build scripts, test suites, and CLI flags without flooding the main agent's context.

## Core Rules
1. **ANSI Stripping**: Always strip ANSI sequences from output before returning.
2. **Exit Code Strictness**: Return exit code and isolated stack trace on failure (<= 20 lines).
3. **Command Timeout**: Enforce maximum 30 seconds execution limit to prevent hanging processes.

