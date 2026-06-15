/** Ported from open-spec-source/src/utils/command-references.ts */
export const transformToHyphenCommands = (text: string): string => text.replace(/\/opsx:/g, '/opsx-');
