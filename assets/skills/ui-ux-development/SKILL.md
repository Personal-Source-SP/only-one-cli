---
name: ui-ux-development
description: Use when designing or materially changing user interfaces, layouts, interactions, forms, responsive behavior, accessibility, or visual styling.
---

# UI and UX Development

## First Gates

1. Check whether external skill `ux-ui-pro-max` is installed and available.
2. When available, read and follow `ux-ui-pro-max` before selecting design direction, component patterns, visual hierarchy, interaction, or responsive treatment.
3. When unavailable, continue with this skill and report that `ux-ui-pro-max` guidance was unavailable only when user requested or expects its use.
4. Inspect existing design system, component library, tokens, breakpoints, i18n, accessibility utilities, and comparable screens.
5. Reuse existing components and primitives before creating new ones.
6. Existing project conventions and explicit user requirements win when they do not weaken accessibility, usability, or security.

## Design Workflow

1. Define user goal, primary action, critical states, content hierarchy, and target viewports.
2. Use `ux-ui-pro-max` output as design input when available; adapt it to existing product patterns instead of copying a generic style.
3. Reuse approved references, tokens, and components. If no direction is approved, propose a concrete direction before material visual implementation.
4. Design complete states: default, loading, empty, error, disabled, success, and destructive confirmation where relevant.
5. Keep flows minimal, clear, and low-friction. Use established UX patterns when they fit user goal.

## Semantics and Accessibility

- Use semantic HTML. Read `references/accessibility.md` for element and interaction guidance.
- Use native semantics before ARIA; add ARIA only when native HTML cannot express required behavior.
- Every interactive element must be keyboard-operable with visible focus.
- Icon-only controls need accessible names.
- Respect `prefers-reduced-motion` for nonessential motion.
- Keep validation errors adjacent to related input and preserve recoverable form input.

## Responsive Design

- Ensure usable mobile, tablet, and desktop layouts.
- Verify no horizontal overflow, clipped controls, hover-only actions, inaccessible touch targets, or viewport-specific loss of primary action.
- Use TailwindCSS only when project uses TailwindCSS; follow existing design tokens and styles before adding plain CSS.

## Verification

- Check narrow mobile, common tablet, and wide desktop widths.
- Check keyboard-only use, visible focus, form errors, contrast, and screen-reader labels for custom controls.
- Collect fresh browser or screenshot evidence for material UI changes; do not claim visual completion from code review alone.
- State whether `ux-ui-pro-max` informed design and which relevant verification could not run.
