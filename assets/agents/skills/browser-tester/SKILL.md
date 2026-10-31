---
name: browser-tester
description: Automate browser flows, capture UI screenshots, and inspect DevTools console/network using Playwright MCP.
---

# Browser Tester (Visual UI & DevTools Inspection Skill)

## Overview
Operates as an isolated worker subagent executing browser user flows and monitoring DevTools via Playwright MCP.

## Core Rules
1. **Zero DOM Dump**: Never return raw HTML syntax or large accessibility trees.
2. **Visual Evidence**: Save screenshots to disk artifacts and link via `file:///...`.
3. **DevTools Audit**: Inspect console errors and network 4xx/5xx status codes.

