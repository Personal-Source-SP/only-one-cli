export const pageFileIsolationRule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Ensure Next.js page files only export the default Page component',
            category: 'Next.js',
        },
        schema: [],
        messages: {
            forbiddenNamedExport: 'Next.js page file must only export the default page component. Move "{{name}}" to a component file.',
        },
    },
    create(context) {
        const filename = context.filename || context.getFilename();
        const isPageFile = /(?:^|[/\\])page\.[tj]sx?$/.test(filename);
        if (!isPageFile) return {};

        return {
            ExportNamedDeclaration(node) {
                if (node.declaration) {
                    const name = node.declaration.id?.name || 'named export';
                    context.report({ node, messageId: 'forbiddenNamedExport', data: { name } });
                }
            },
        };
    },
};
export default pageFileIsolationRule;
