import customRulesPlugin, { presets } from './eslint-rules/index.js';

export default [
    {
        plugins: {
            custom: customRulesPlugin,
        },
        rules: {
            ...presets['typescript-core'],
            ...presets['architecture'],
            ...presets['react-nextjs'],
        },
    },
];
