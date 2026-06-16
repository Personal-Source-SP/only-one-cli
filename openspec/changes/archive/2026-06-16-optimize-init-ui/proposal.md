## Why

The current interactive user interface for the `init` command is basic and lacks descriptive guidance, making it difficult for users to understand what each tool, package, or skill does. Improving this interactive flow with detailed descriptions, step-by-step headers, clear system warnings, and a final confirmation summary will make the tool much more user-friendly and safe to use.

## What Changes

- **Interactive UI Enhancements**: Add rich, detailed headers and step progress indicators (e.g., "Step 1 of 3: Agent Tools Configuration").
- **Detailed Descriptions**: Display descriptions for each option inside the prompts, helping users know exactly what they are selecting (e.g., explaining the destination and function of agent tools and skills).
- **Warning and Confirmation System**: Provide warnings if folders already exist or if specific packages might conflict, and introduce a final confirmation screen summarizing the entire configuration before any installation/file writing begins.

## Capabilities

### New Capabilities

*(None)*

### Modified Capabilities

- `init-interactive-flow`: Add detailed prompts, step instructions, option descriptions, warning banners, and a pre-execution summary/confirmation to the interactive wizard.

## Impact

- Modifies `src/core/init/init-command.ts` to implement the rich step logs, detailed option displays, and confirmation logic.
- Prompts inside `src/core/init/init-command.ts` will leverage helper styling or extended Inquirer choices to show extra context.
