---
name: api-tester
description: Validate backend APIs, execute concurrent burst requests to detect race conditions, and audit latency.
---

# API Tester (Backend API & Concurrency Race Condition Skill)

## Overview
Operates as an isolated worker subagent validating API schema, testing concurrent race conditions, and measuring performance metrics.

## Core Rules
1. **Concurrency Testing**: Execute parallel requests to test transactional integrity and locking.
2. **Zero JSON Dump**: Never dump multiline JSON payloads (> 20 lines) into context.
3. **Metrics Reporting**: Output P50/P95 latency and error rate percentages.

