# Utils & Helpers Reference

## Helper & Pure Utility Function Standards

- ✅ **Leverage Common Utilities (`@/utilities`)**:
  - MUST audit and reuse available utility functions in `@/utilities` (`currencyNumber`, `toEnumOptions`, `FormRuleType`, formatters, parsers) prior to authoring new functions.
  - ONLY write local helper functions within `src/pages/<feature>/utils/` when logic is strictly isolated to that specific page (e.g., `convertMinutesToSeconds`, `parseBoolean`).
- ✅ **Pure Functions**:
  - Helpers must be deterministic, pure functions with explicit inputs and outputs and zero external side effects.
- ✅ **Leverage Lodash & Dayjs**:
  - Prioritize `lodash` utilities (`isEmpty`, `get`, `set`, `uniq`, `groupBy`) rather than manual loops and mappings.
  - Handle date/time parsing and comparison with `dayjs`. When manipulating timezones, ensure `dayjs.extend(utc)` and `dayjs.extend(timezone)` are properly loaded for accurate calculations.
- ✅ **Debug-Friendly Return-by-Variable**:
  - ALWAYS bind computed values and transformation results to descriptive variables before returning (`const result = ...; return result;`).
