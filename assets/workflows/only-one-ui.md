---
description: Design and implement approved, responsive, accessible UI using existing project patterns.
---

Use this workflow only for web or mobile UI work.

## Input

```text
/only-one-ui <UI task, requirement, or reference>
```

## Dependency preflight

1. Check whether skill `ux-ui-max` is available.
2. If unavailable, stop and report blocker. Ask user to install or provide an alternative. Do not silently skip it.
3. Load and follow `ux-ui-max` before proposing or implementing UI work.
4. Prioritize Antigravity UI directives and existing project standards over competing guidance.

## Discovery and approval

1. Ask for relevant code examples, design references, screenshots, design-system links, product documentation, similar flows, and color-token or theme configuration.
2. Map page and layout hierarchy, feature boundaries, component ownership, design-system layers, tokens, shared primitives, content/i18n patterns, and breakpoints.
3. If references are unavailable, inspect existing UI patterns and propose a concrete direction covering layout, hierarchy, components, responsive behavior, states, and visual language.
4. Do not introduce a new color palette without explicit approval. Ground options in project evidence.
5. Wait for explicit approval before implementation when no approved reference exists.
6. If an approved reference exists, confirm scope and preserve intended visual and interaction behavior.

## Implementation

1. Preserve existing architecture, ownership, naming, token layers, and composition patterns unless structural change is approved.
2. Prefer existing Ant Design components when installed and suitable. Reuse current theme tokens and component patterns.
3. Prefer an equivalent Ant Design primitive over recreating behavior with Tailwind utilities when it meets requirements.
4. Use Tailwind CSS for styling, responsive utilities, and cases without a suitable Ant Design equivalent.
5. Reuse established components, tokens, and assets. Do not use placeholders.
6. Cover relevant loading, empty, error, success, disabled, and permission states.
7. Implement mobile, tablet, and desktop behavior, including layout, overflow, typography, spacing, controls, and touch interactions.
8. Use semantic HTML, accessible names, keyboard navigation, visible focus, sufficient contrast, and reduced-motion support.
9. Route UI text through existing i18n when present.

## Verification

1. Test changed UI at relevant mobile, tablet, and desktop viewport sizes.
2. Inspect relevant breakpoints and collect browser evidence or screenshots when tools support it.
3. Do not claim responsive or visual completion without fresh viewport evidence.
4. Report changed files, tested states and viewports, results, and checks not run.
