# Accessibility Reference

| Need | Prefer |
| --- | --- |
| Trigger action | `button` |
| Navigate | `a` or framework Link |
| Input name | `label` associated with control |
| Related controls | `fieldset` and `legend` |
| Modal | native `dialog` or established accessible modal primitive |

- Modal must manage focus, support Escape dismissal when safe, and restore focus to trigger.
- Associate input errors and help text with controls using native semantics or `aria-describedby`.
- Do not use click handlers on noninteractive elements when semantic controls work.
- Do not rely on color, hover, or motion as only communication channel.
- Maintain sufficient text and control contrast.
