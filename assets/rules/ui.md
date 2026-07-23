# UI

## Required Skill and Rule Precedence

- Invoke `ux-ui-max` before proposing or implementing UI work. Follow its design-discovery, component, accessibility, and visual-validation guidance.
- If `ux-ui-max` is unavailable, report blocker and ask user to install or provide an alternative. Do not silently skip this requirement.
- Prioritize and reuse UI and UX directives defined by Antigravity. Do not introduce competing design standards.
- Apply this rule only when project evidence shows a web or mobile user interface. Do not force UI conventions into CLI or service work.

## Context and Design Approval

- Always ask user for relevant code examples, design references, screenshots, design-system links, product documentation, similar existing flows, and color-token or theme configuration before designing or implementing UI.
- Ask user to provide color configuration context: design tokens, theme file, Ant Design token overrides, Tailwind theme, brand palette, or approved color reference.
- If user cannot provide references, inspect project UI patterns and propose a concrete design direction: layout, hierarchy, component choices, responsive behavior, states, and visual language.
- If color configuration is unavailable, do not select or introduce a new palette independently. Present color options grounded in existing project evidence and wait for explicit user approval.
- Wait for explicit user approval of proposed design direction before implementing when user did not provide an approved reference.
- If user supplies an approved reference, confirm scope and preserve its intended visual and interaction behavior.

## Discovery and Component Choice

- Map existing UI architecture before design: page and layout hierarchy, feature boundaries, component ownership, design-system layers, tokens, shared primitives, content/i18n pattern, and breakpoints.
- Design within this existing system structure. Preserve layout hierarchy, feature boundaries, component ownership, naming, token layers, and established composition patterns unless user approves a structural change.
- Prefer existing Ant Design components when Ant Design is installed and fits project conventions. Reuse current Ant Design theme tokens and component patterns.
- For a UI primitive or layout with an equivalent Ant Design component, prefer that component over recreating behavior with Tailwind utility classes. Example: prefer Ant Design `Flex` for a flex layout when it meets requirements.
- Tailwind CSS remains allowed for styling, responsive utilities, and cases without a suitable Ant Design equivalent. Do not replace established Tailwind patterns without a concrete benefit.
- Reuse established components and tokens. Do not replace working assets with placeholders.
- Cover loading, empty, error, success, disabled, and permission states relevant to changed flow.

## Responsive and Quality

- Implement complete responsive behavior for mobile, tablet, and desktop. Define layouts, overflow behavior, typography, spacing, controls, and touch interactions for each relevant breakpoint.
- Test changed UI at relevant mobile, tablet, and desktop viewport sizes. Do not claim responsive completion without viewport evidence.
- Use semantic HTML, accessible names, keyboard navigation, visible focus, sufficient contrast, and reduced-motion support.
- Route UI text through existing i18n system where project uses one.
- For visual changes, inspect relevant breakpoints and collect browser evidence or screenshots when tools support it.
