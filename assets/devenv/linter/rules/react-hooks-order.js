const HOOK_PRIORITY = {
    useState: 1,
    useReducer: 1,
    useRef: 2,
    useMemo: 3,
    useCallback: 3,
    useEffect: 4,
    useLayoutEffect: 4,
};

export const reactHooksOrderRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce deterministic declaration order of React Hooks',
            category: 'React',
        },
        schema: [],
        messages: {
            invalidHookOrder: 'Hook "{{current}}" should not appear after "{{previous}}". Maintain state -> memo/callback -> effect order.',
        },
    },
    create(context) {
        let maxPriority = 0;
        let lastHookName = '';

        return {
            CallExpression(node) {
                const name = node.callee?.name;
                if (name && HOOK_PRIORITY[name]) {
                    const priority = HOOK_PRIORITY[name];
                    if (priority < maxPriority) {
                        context.report({
                            node,
                            messageId: 'invalidHookOrder',
                            data: { current: name, previous: lastHookName },
                        });
                    } else {
                        maxPriority = priority;
                        lastHookName = name;
                    }
                }
            },
        };
    },
};
export default reactHooksOrderRule;
