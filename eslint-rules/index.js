import { architecturalBoundariesRule } from './rules/architectural-boundaries.js';
import { asyncSafetyRule } from './rules/async-safety.js';
import { interfaceMemberOrderingRule } from './rules/interface-member-ordering.js';
import { presets } from './presets/index.js';

export const customRulesPlugin = {
    rules: {
        'architectural-boundaries': architecturalBoundariesRule,
        'async-safety': asyncSafetyRule,
        'interface-member-ordering': interfaceMemberOrderingRule,
    },
    configs: {
        presets,
    },
};

export { presets };
export default customRulesPlugin;

