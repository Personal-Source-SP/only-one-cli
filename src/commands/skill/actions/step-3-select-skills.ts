import type { ProgramDeps } from '@/cli/deps.js';
import { checkExistingSkills } from '@/core/skill/index.js';
import type { TargetSelectionOption } from '@/core/target-selection/types.js';
import { parseCsv } from '@/utils/index.js';

export const selectSkillsStep = async (
    deps: ProgramDeps,
    projectDir: string,
    namesArg: string | undefined,
    availableSkills: string[],
    targetTool: TargetSelectionOption,
    targetTools: TargetSelectionOption[],
): Promise<{ selectedSkills: string[]; allExistingSkills: Awaited<ReturnType<typeof checkExistingSkills>> }> => {
    const allExistingSkills = await checkExistingSkills(projectDir, targetTools, availableSkills);

    let selectedSkills = parseCsv(namesArg);
    if (!selectedSkills?.length) {
        if (!deps.prompts?.checkbox) {
            throw new Error('Skill selection is required in non-interactive mode. Pass skill names positionally.');
        } else {
            selectedSkills = await deps.prompts.checkbox({
                message: `Select custom skills to add for ${targetTool.name}:`,
                choices: availableSkills.map((name) => {
                    const isExisting = allExistingSkills.some((s) => s.skillName === name && s.exists);
                    return {
                        name: isExisting ? `${name} (already exists)` : name,
                        value: name,
                        checked: !isExisting,
                    };
                }),
            });
        }
    } else {
        for (const skill of selectedSkills) {
            if (!availableSkills.includes(skill)) {
                throw new Error(`Skill '${skill}' not found in libraries/skills`);
            }
        }
    }

    return { selectedSkills, allExistingSkills };
};
