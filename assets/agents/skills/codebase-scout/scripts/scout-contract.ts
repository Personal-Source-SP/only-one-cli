export interface ScoutDelegationOptions {
    fileCount: number;
    isKnownPath?: boolean;
    queryDepth?: 'shallow' | 'deep';
}

export function shouldDelegateToScout(options: ScoutDelegationOptions): boolean {
    const { fileCount, isKnownPath = false, queryDepth = 'shallow' } = options;
    if (fileCount <= 2 && isKnownPath && queryDepth === 'shallow') {
        return false;
    }
    return fileCount > 2 || !isKnownPath || queryDepth === 'deep';
}

export interface AstGrepCommandOptions {
    pattern: string;
    targetPath?: string;
    lang?: string;
}

export function buildAstGrepCommand(options: AstGrepCommandOptions): string {
    const { pattern, targetPath = '.', lang } = options;
    const langFlag = lang ? ` --lang ${lang}` : '';
    return `ast-grep scan -p '${pattern}'${langFlag} ${targetPath}`.trim();
}

export interface DigestValidationResult {
    valid: boolean;
    errors: string[];
}

export function validateTechnicalDigest(content: string): DigestValidationResult {
    const errors: string[] = [];

    if (!/seam anchors|anchors/i.test(content)) {
        errors.push('Missing Seam Anchors / line ranges in Technical Digest');
    }

    if (!/signatures|exported signatures|types/i.test(content)) {
        errors.push('Missing Exported Signatures / Types in Technical Digest');
    }

    if (!/invariants/i.test(content)) {
        errors.push('Missing Invariants / Constraints in Technical Digest');
    }

    const codeBlockRegex = /```(?:ts|tsx|js|json)?\s*[\r\n]+([\s\S]*?)```/g;
    let match: RegExpExecArray | null;
    while ((match = codeBlockRegex.exec(content)) !== null) {
        const lines = match[1].split(/\r?\n/).filter((line) => line.trim().length > 0).length;
        if (lines > 20) {
            errors.push('Excessive implementation code echo (> 20 lines) detected in Technical Digest');
            break;
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

