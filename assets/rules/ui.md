# UI

## Rule Precedence
- Prioritize and reuse UI and UX directives defined by Antigravity. Do not introduce competing design standards.
- Apply this rule only when project evidence shows a web or mobile user interface. Do not force UI conventions into CLI or service work.

## Discovery and Design
- Inspect existing design system, tokens, component primitives, user flow, content/i18n pattern, and breakpoints before designing.
- Reuse established components and tokens. Do not replace working assets with placeholders.
- Cover loading, empty, error, success, disabled, and permission states relevant to changed flow.

## Quality
- Use semantic HTML, accessible names, keyboard navigation, visible focus, sufficient contrast, and reduced-motion support.
- Keep responsive behavior across mobile, tablet, and desktop.
- Route UI text through existing i18n system where project uses one.
- For visual changes, inspect relevant breakpoints and collect browser evidence or screenshots when tools support it.
