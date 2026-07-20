## Why

The current CLI styling definitions and terminal outputs might utilize or default to `white` or `black` text colors, which can render CLI text unreadable on terminals with matching background themes (e.g., pure white text on a white background, or black text on a black background). To ensure high contrast and accessibility across various terminal environments, all CLI texts, titles, and descriptions must be adjusted to completely avoid `white` or `black` colors.

## What Changes

- Refactor `src/constants/colors.ts` to map all semantic, role-based, and CLI element-specific colors to terminal colors that are neither white nor black.
- Search and eliminate any occurrences of `white` or `black` colors (such as `pc.white`, `pc.black`, `pc.bgWhite`, `pc.bgBlack`, or raw ANSI codes for white/black) across all text formatting in the codebase.
- Audit all CLI rendering files, help screens, and interactive prompts to ensure that no fallback or default uncolored text relies on the default terminal color if it behaves as white or black, enforcing high-visibility color mappings.

## Capabilities

### New Capabilities
- `cli-color-compliance`: Ensures all CLI texts, titles, descriptions, and instructions are fully compliant with the color requirements, completely avoiding white or black colors.

### Modified Capabilities

## Impact

- `src/constants/colors.ts` (CLI theme color mappings)
- `src/cli/index.ts` (CLI entry point and helper layout styling)
- `src/prompts/` (interactive selection prompts and utility layouts)
