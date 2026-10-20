import { architecturalBoundariesRule } from './rules/architectural-boundaries.js';
import { asyncSafetyRule } from './rules/async-safety.js';
import { interfaceMemberOrderingRule } from './rules/interface-member-ordering.js';
import { pageFileIsolationRule } from './rules/page-file-isolation.js';
import { reactHooksOrderRule } from './rules/react-hooks-order.js';
import { strictDesignTokensRule } from './rules/strict-design-tokens.js';
import { strictI18nRule } from './rules/strict-i18n.js';
import { presets } from './presets/index.js';

export const customRulesPlugin = {
    rules: {
        'architectural-boundaries': architecturalBoundariesRule,
        'async-safety': asyncSafetyRule,
        'interface-member-ordering': interfaceMemberOrderingRule,
        'page-file-isolation': pageFileIsolationRule,
        'react-hooks-order': reactHooksOrderRule,
        'strict-design-tokens': strictDesignTokensRule,
        'strict-i18n': strictI18nRule,
    },
    configs: {
        presets,
    },
};

export { presets };
export default customRulesPlugin;
