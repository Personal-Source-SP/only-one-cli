import pc from 'picocolors';

export const COLORS = {
    // 1. Màu sắc theo vai trò (Semantic/Theme Colors)
    primary: (text: string) => pc.cyan(text),
    secondary: (text: string) => pc.blue(text),
    success: (text: string) => pc.green(text),
    warning: (text: string) => pc.yellow(text),
    error: (text: string) => pc.red(text),
    info: (text: string) => pc.blue(text),
    dim: (text: string) => pc.dim(text),
    bold: (text: string) => pc.bold(pc.cyan(text)),

    // 2. Màu sắc cụ thể cho CLI Elements (CLI-specific colors)
    cli: {
        header: (text: string) => pc.bold(pc.yellow(text)),
        description: (text: string) => pc.cyan(text),
        command: (text: string) => pc.bold(pc.green(text)),
        option: (text: string) => pc.bold(pc.blue(text)),
        example: (text: string) => pc.dim(text),
        accent: (text: string) => pc.magenta(text),
    },
} as const;
