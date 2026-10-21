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

$$\text{1. Common Components (@/components)} \longrightarrow \text{2. Ant Design (antd)} \longrightarrow \text{3. TailwindCSS (Layout Spacing Only)}$$

1. **Tier 1 (Highest Priority — `@/components`)**:
   - Audit and reuse prebuilt shared components encapsulated in `src/components/` (`ListWrapper`, `ListTable`, `FilterPanel`, `CardAction`, `CustomDrawerForm`, `CustomInputForm`, `CustomSelectInput`, `CustomModal`, `UploadImage`).
2. **Tier 2 (Secondary Priority — Ant Design `antd`)**:
   - If `@/components` does not provide an exact wrapper, use standard primitives and compound components from Ant Design (`Button`, `Table`, `Tag`, `Typography`, `Card`, `Space`, `Flex`, `Row`, `Col`, `Drawer`, `Modal`, `Form`, `Input`, `Select`, `Badge`, `Divider`, `Tooltip`).
3. **Tier 3 (Tertiary Priority — TailwindCSS for Layout Spacing Only)**:
   - Use TailwindCSS strictly for layout composition (Flexbox, Grid, spacing gap/margin/padding) or responsive breakpoint adjustments when Tier 1 and Tier 2 primitives require outer wrapper alignment.

🛑 **Anti-Raw-HTML Invariant**:
- ❌ **NEVER** write raw HTML elements (`<div>`, `<span>`, `<button>`, `<input>`) combined with long TailwindCSS utility strings when an equivalent Ant Design component exists.
- ❌ **NEVER** handcraft buttons, card containers, badge tags, or typography headings using raw HTML + TailwindCSS classes.

```tsx
// ❌ ANTI-PATTERN (DON'T): Handcrafted raw HTML + TailwindCSS replacing standard components
<div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
  <span className="text-sm font-semibold text-gray-800">Cấu hình tính năng</span>
  <button
    type="button"
    onClick={handleSave}
    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
  >
    Lưu thay đổi
  </button>
</div>
```

```tsx
// ✅ STANDARD PATTERN (DO): Leverage Ant Design Card, Flex, Typography, and Button
<Card size="small">
  <Flex align="center" justify="space-between">
    <Typography.Text strong>Cấu hình tính năng</Typography.Text>
    <Button type="primary" onClick={handleSave}>
      Lưu thay đổi
    </Button>
  </Flex>
</Card>
```

- **Color Constants**: Reuse standardized application color constants (`ACTIVE_STATUS_COLORS`, `BOOLEAN_TAG_COLORS`).


---

### 3. Responsive Layouts & Accessibility (a11y)
- Validate responsive layouts across Desktop, Tablet, and Mobile viewports.
- Ensure all interactive elements support keyboard navigation and display distinct `:focus-visible` rings.
- Icon-only buttons MUST provide an enclosing `Tooltip` or an explicit `aria-label` attribute.
