---
name: ui-ux-development
description: Use when designing or materially changing user interfaces, layouts, interactions, forms, responsive behavior, accessibility, or visual styling.
---

# UI and UX Development

## First Gates

1. Inspect existing design system, component library, tokens, breakpoints, i18n, and accessibility utilities.
2. Reuse existing components and primitives before creating new ones.
3. Existing project conventions win when they do not weaken accessibility, usability, or explicit requirements.

## Semantics and Accessibility

- Use semantic HTML. Read `references/accessibility.md` for element and interaction guidance.
- Use native semantics before ARIA; add ARIA only when native HTML cannot express required behavior.
- Every interactive element must be keyboard-operable with visible focus.
- Icon-only controls need accessible names.
- Respect `prefers-reduced-motion` for nonessential motion.

## Flows and Feedback

- Keep flows minimal, clear, and low-friction. Use established UX patterns when they fit user goal.
- Every async action needs pending, success, failure, and recovery behavior.
- Destructive or irreversible actions need clear impact and confirmation when appropriate.
- Keep validation errors adjacent to related input and preserve recoverable form input.

## Responsive Design

- Ensure usable mobile, tablet, and desktop layouts.
- Verify no horizontal overflow, clipped controls, hover-only actions, or inaccessible touch targets.
- Use TailwindCSS only when project uses TailwindCSS; follow existing design tokens and styles before adding plain CSS.

## Verification

- Check narrow mobile, common tablet, and wide desktop widths.
- Check keyboard-only use, visible focus, form errors, contrast, and screen-reader labels for custom controls.
