export function stripAnsiColors(text: string): string {
    // ANSI escape code matching pattern
    const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
    return text.replace(ansiRegex, '');
}

export function isolateFailureStackTrace(rawLog: string, maxLines = 20): string {
    const cleanText = stripAnsiColors(rawLog);
    const lines = cleanText
        .split(/\r?\n/)
        .map((l) => l.trimEnd())
        .filter((l) => l.length > 0);

    // Find first error occurrence
    const errorIndex = lines.findIndex((line) => /(?:Error|Exception|FAIL|failed):/i.test(line));
    if (errorIndex === -1) {
        return lines.slice(-maxLines).join('\n');
    }

    return lines.slice(errorIndex, errorIndex + maxLines).join('\n');
}

export function formatTerminalDigest(status: 'PASS' | 'FAIL', exitCode: number, summary: string): string {
    return [
        '### Terminal Digest',
        `- Status: ${status}`,
        `- Exit Code: ${exitCode}`,
        `- Summary: ${summary.trim()}`,
    ].join('\n');
}

