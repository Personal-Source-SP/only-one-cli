import type { ProgramDeps } from '@/cli/deps.js';
import type { checkExistingSkills } from '@/core/skill/index.js';

export const confirmSkillOverwriteStep = async (
    deps: ProgramDeps,
    selectedSkills: string[],
    allExistingSkills: Awaited<ReturnType<typeof checkExistingSkills>>,
): Promise<string[]> => {
    const alreadyExisting = allExistingSkills.filter((s) => selectedSkills.includes(s.skillName) && s.exists);
    let overwriteList: string[] = [];

    if (alreadyExisting.length > 0 && deps.prompts?.checkbox) {
        overwriteList = await deps.prompts.checkbox({
            message: 'The following skills already exist. Select which ones you want to overwrite/reinstall:',
            choices: alreadyExisting.map((s) => ({
                name: `${s.skillName} in ${s.toolName} (${s.destPath})`,
                value: `${s.toolId}:${s.skillName}`,
                checked: true,
            })),
        });
    }

    return overwriteList;
};
