## ADDED Requirements

### Requirement: libraries directory structure
Project SHALL have a `libraries/` directory at root, same level as `src/`, for storing external libraries, skills, and templates.

#### Scenario: Create libraries root directory
- **GIVEN** project root không có thư mục `libraries/`
- **WHEN** chạy lệnh tạo thư mục
- **THEN** thư mục `libraries/` được tạo tại root
- **AND** trong `libraries/` có các thư mục con `skills/` và `templates/`

#### Scenario: libraries directory is gitignored properly
- **GIVEN** project có `.gitignore`
- **WHEN** kiểm tra rules của `libraries/`
- **THEN** `libraries/` được track bởi git (không ignore) vì chứa file cần version control

### Requirement: TypeScript path alias for libraries
tsconfig.json SHALL configure a `@library/*` path alias resolving to `libraries/*`.

#### Scenario: Import from libraries using alias
- **GIVEN** `tsconfig.json` có paths config
- **WHEN** import `@library/skills/my-skill`
- **THEN** TypeScript resolve được đường dẫn tới `libraries/skills/my-skill`
- **AND** IDE hỗ trợ autocomplete cho alias này

### Requirement: Init command loads from libraries
Init command SHALL check `libraries/skills/` for custom skills first, then fall back to `.agents/skills/`.

#### Scenario: Init command reads skills from libraries
- **GIVEN** init command cần sync custom skills
- **WHEN** init command chạy
- **THEN** nó kiểm tra `libraries/skills/` trước, fallback về `.agents/skills/` nếu không có
