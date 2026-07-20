## ADDED Requirements

### Requirement: CLI Text Color Compliance
The CLI output SHALL NOT use the colors `white` or `black` (neither foreground nor background) for any text, title, description, or instructions. This includes preventing the use of `pc.white`, `pc.black`, `pc.bgWhite`, `pc.bgBlack`, or raw ANSI escape codes for white/black.

#### Scenario: Verify command output text colors
- **GIVEN** any CLI command is executed
- **WHEN** the command outputs messages, headers, descriptions, options, or help text
- **THEN** all text is colored using compliant visible colors (such as cyan, blue, yellow, green, magenta, red, or dim)
- **AND** no text uses white or black foreground or background styling

#### Scenario: Verify interactive prompt styling
- **GIVEN** an interactive prompt is rendered to the user
- **WHEN** options, selected state chips, search text, or validation errors are printed
- **THEN** the output uses styled colors excluding white or black

## MODIFIED Requirements

## REMOVED Requirements
