import { resolve } from 'node:path';

export function formatScreenshotPath(relativePath: string): string {
    const absPath = resolve(process.cwd(), relativePath).replace(/\\/g, '/');
    return `file:///${absPath.replace(/^\//, '')}`;
}

export interface BrowserDigestValidationResult {
    valid: boolean;
    errors: string[];
}

export function validateBrowserDigest(content: string): BrowserDigestValidationResult {
    const errors: string[] = [];

    if (!/status:\s*(?:pass|fail)/i.test(content)) {
        errors.push('Missing Status (PASS|FAIL) in Browser Digest');
    }

    if (!/visual evidence|screenshot/i.test(content)) {
        errors.push('Missing Visual Evidence / Screenshot reference in Browser Digest');
    }

    if (!/devtools console|console/i.test(content)) {
        errors.push('Missing DevTools Console section in Browser Digest');
    }

    // Strict Anti-DOM Dump check: reject HTML tags like <div>, <button>, <span>
    if (/<(?:div|span|button|input|table|form|header|footer)[^>]*>/i.test(content)) {
        errors.push('Excessive DOM dump detected in Browser Digest (Raw HTML tags are forbidden)');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

