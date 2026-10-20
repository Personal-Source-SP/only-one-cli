export const presets = {
    'typescript-core': {
        'custom/async-safety': 'error',
        'custom/interface-member-ordering': 'warn',
    },
    architecture: {
        'custom/architectural-boundaries': 'error',
    },
    'react-nextjs': {
        'custom/react-hooks-order': 'warn',
        'custom/page-file-isolation': 'error',
    },
    'design-system': {
        'custom/strict-design-tokens': 'warn',
    },
    i18n: {
        'custom/strict-i18n': 'warn',
    },
};
export default presets;
