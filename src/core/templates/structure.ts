import { formatCursorCommandFile } from '@/core/command-generation/adapters/cursor.js';
import { STRUCTURALS_DIR } from '@/core/structure/paths.js';

export const STRUCTURE_SKILL_NAME = 'only-one-structure-generate';
export const STRUCTURE_SKILL_DIR = STRUCTURE_SKILL_NAME;
export const STRUCTURE_COMMAND_ID = STRUCTURE_SKILL_NAME;
export const STRUCTURE_SLASH = '/only-one-structure-generate';

export const STRUCTURE_BLUEPRINT_NAMING_HINT = `{organization}-{project}-structural.md under .only-one/${STRUCTURALS_DIR}/`;

export const STRUCTURE_SKILL_DESCRIPTION =
    'Generate organization-project-structural.md under .only-one/structure/ (architecture skeleton only, no business logic). Requires only-one init or structure-generate scaffold and installed agent skills.';

export const buildStructureSkillBody =
    (): string => `Generate the structural blueprint markdown for this repo — zero business/domain content.

**Target path:** \`.only-one/${STRUCTURALS_DIR}/{organization}-{project}-structural.md\` (filename segments come from \`.onlyonecli.yml\`).

**Prerequisite:** \`only-one init\` or \`only-one structure-generate\` has created \`.only-one/${STRUCTURALS_DIR}/\` (or a custom \`--output\` layout).

---

**Role**: You are an Expert Software Architect and Codebase Structure Analyzer.

**Task**: Analyze the provided codebase/directory and write the blueprint to the path returned by the CLI (\`outputPath\` / \`relativeBlueprintPath\` in \`only-one structure-generate --json\`).

**CRITICAL RULE**: You MUST completely strip away and ignore all business logic, domain-specific terminology, and product features. Focus ONLY on the "skeleton" of the project: the physical structure, architectural paradigms, dependency rules, and coding conventions.

Structure the markdown file with these sections:

1. 🛠️ Tech Stack & Core Tooling
   - Identify the primary programming languages, frameworks, build tools, and package managers used.

2. 📂 Structural Skeleton (Directory Tree)
   - Provide a high-level tree view of the architecture.
   - Explain the *architectural purpose* of each primary directory without mentioning actual business models.
   - Ignore boilerplate/tooling folders (node_modules, dist, .git, etc.).

3. 🏗️ Architectural Paradigms & Module Boundaries
   - Identify the overarching architecture (e.g., MVC, Clean Architecture, Feature-Sliced Design, Hexagonal, Layered).
   - Module Anatomy: What makes up a standard module/component in this project?
   - Dependency Rules: How are modules allowed to interact?

4. 📜 Structural Coding Conventions
   - Naming Conventions: directories, files, classes, interfaces/types, functions.
   - File Structure Patterns: barrel files, colocated tests, etc.

5. ⚙️ Cross-Cutting Concerns Infrastructure
   - Structurally, how are universal technical concerns implemented (error handling, state, config loading).
   - Describe *how* they are structured, not *what* data they hold.

**Format Requirements**:
- Use clear headings, bullet points, and bold text.
- Do NOT output any actual source code.
- Mermaid diagrams: abstract Layer/Module Dependency only (A -> B), NOT business data flow.
- Output ONLY the markdown content when writing the file.

---

**Steps**

1. **If the target directory is unclear, ask** (AskUserQuestion, open-ended).

2. **Confirm paths via CLI**
   \`\`\`bash
   only-one structure-generate [path] --json
   \`\`\`
   Parse \`projectDir\`, \`outputPath\`, \`relativeBlueprintPath\`, \`blueprintFile\`, \`folderCreated\`.

3. **Track with TodoWrite** — map tree → sample manifests → draft sections → write → verify.

4. **Explore the skeleton** — manifests, directory tree, layer samples; no domain/feature names.

5. **Write** to \`outputPath\` with all five sections; show progress using \`blueprintFile\` from JSON.

6. **Verify** the file exists and summarize for the user.

**Guardrails**
- Do NOT run \`openspec\` CLI or create \`openspec/changes/\`
- Do NOT include domain entities, user stories, or feature names
- Do NOT paste raw source code
- Ask before overwrite unless the user requested regeneration
`;

export const buildStructureSkillMarkdown = (cliVersion: string): string => `---
name: ${STRUCTURE_SKILL_NAME}
description: ${STRUCTURE_SKILL_DESCRIPTION}
license: MIT
compatibility: Requires only-one CLI.
metadata:
  author: only-one
  version: "1.0"
  generatedBy: "${cliVersion}"
---

${buildStructureSkillBody()}
`;

export const buildStructureCommandContent = (): import('../command-generation/types.js').CommandContent => ({
    body: buildStructureSkillBody(),
    category: 'Workflow',
    description: STRUCTURE_SKILL_DESCRIPTION,
    id: STRUCTURE_COMMAND_ID,
    name: STRUCTURE_SKILL_NAME,
    tags: ['only-one', 'structure'],
});

export const buildStructureCommandFile = (): string =>
    formatCursorCommandFile({
        body: buildStructureSkillBody(),
        category: 'Workflow',
        description: STRUCTURE_SKILL_DESCRIPTION,
        id: STRUCTURE_COMMAND_ID,
        slashName: STRUCTURE_SLASH,
    });

export type StructurePlaybookStep = {
    id: string;
    summary: string;
};

export const getStructurePlaybookSteps = (): StructurePlaybookStep[] => [
    { id: 'scaffold', summary: `CLI creates .only-one/${STRUCTURALS_DIR}/ (init or only-one structure-generate)` },
    { id: 'skills', summary: 'Ensure agent skills are installed (init or structure-generate will prompt if missing)' },
    { id: 'resolve', summary: 'Run only-one structure-generate [path] --json to confirm outputPath and blueprintFile' },
    { id: 'explore', summary: 'Map directory tree and tooling manifests; ignore business semantics' },
    { id: 'write', summary: 'Write blueprint to outputPath from JSON (structure/{org}-{project}-structural.md)' },
    { id: 'verify', summary: 'Confirm file exists and summarize' },
];
