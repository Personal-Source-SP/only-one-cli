# ASD-STE100 Writing Rules for Agent Skills

## Core Rules
1. **Sentence Length Constraints**:
   - Instructions (`MUST_DO`, `NEVER_DO`, action lines): Maximum **20 words** per sentence.
   - Descriptions & Context: Maximum **25 words** per sentence.
2. **Active Voice Only**:
   - Good: "Run fast test command immediately after modifying file."
   - Bad: "The fast test command should be run immediately after the file has been modified."
3. **Approved Connectors & Modals**:
   - Use `MUST` for hard constraints.
   - Use `DO NOT` or `NEVER` for prohibitions.
   - Avoid passive constructions ("is required", "should be done").
4. **Action-Oriented Structure**:
   - Format rules as atomic bullet points:
     - **MUST_DO**: <Action>
     - **NEVER_DO**: <Forbidden Action>
     - **RATIONALE**: <Short reason>
5. **Anti-Bloat Heuristic**:
   - Replace multi-line prose with concise checklists.
   - Keep total skill word count below 2000 words.
