# UI/UX & Styling Guidelines

## User Interface & User Experience Design Standards

### 1. Design Intelligence Integration (Skill `ui-ux-pro-max` Reference)
When designing user interfaces, the Agent should reference and leverage the `ui-ux-pro-max` skill according to the following matrix:

| UI/UX Task | When to Reference `ui-ux-pro-max` |
| :--- | :--- |
| **New Page / Feature Design** | Reference global design system styles, page layouts, and enterprise SaaS patterns. |
| **Color Schemes & Typography** | Reference color palette profiles, contrast ratios, and font pairing rules. |
| **User Experience (UX)** | Reference micro-interactions, 5-state UI handling (Loading, Empty, Error, Success, Skeleton), and form ergonomics. |
| **Charts & Data Visualization** | Reference chart type selections optimized for specific data structures. |
| **Accessibility (a11y) & Audit** | Cross-reference WCAG AA contrast compliance, responsive breakpoints, and keyboard navigation. |

---

### 2. Component & Styling Priority Cascade

Strictly adhere to the 3-tier component hierarchy during UI implementation:

$$\text{1. Common Components (@/components)} \longrightarrow \text{2. Ant Design (@/antd)} \longrightarrow \text{3. TailwindCSS}$$

1. **Tier 1 (Highest Priority — `@/components`)**:
   - Audit and reuse prebuilt shared components encapsulated in `src/components/` (`ListWrapper`, `ListTable`, `FilterPanel`, `CardAction`, `CustomDrawerForm`, `CustomInputForm`, `CustomSelectInput`, `CustomModal`, `UploadImage`).
2. **Tier 2 (Secondary Priority — Ant Design `antd`)**:
   - If `@/components` does not provide an exact wrapper, use standard primitives from Ant Design (`Button`, `Table`, `Tag`, `Typography`, `Card`, `Space`, `Drawer`, `Modal`, `Form`, `Input`, `Select`, `Badge`).
3. **Tier 3 (Tertiary Priority — TailwindCSS)**:
   - Use TailwindCSS strictly for layout composition (Flexbox, Grid, spacing gap/margin/padding), responsive breakpoint adjustments, or specialized styling when Tier 1 and Tier 2 primitives require alignment.

- **Color Constants**: Reuse standardized application color constants (`ACTIVE_STATUS_COLORS`, `BOOLEAN_TAG_COLORS`).

---

### 3. Responsive Layouts & Accessibility (a11y)
- Validate responsive layouts across Desktop, Tablet, and Mobile viewports.
- Ensure all interactive elements support keyboard navigation and display distinct `:focus-visible` rings.
- Icon-only buttons MUST provide an enclosing `Tooltip` or an explicit `aria-label` attribute.
