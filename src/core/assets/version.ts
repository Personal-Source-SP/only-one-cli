export const DEFAULT_ASSET_VERSION = '0.0.1';

export const DECIMAL_VERSION_REGEX = /^(\d+)\.(\d+)\.(\d+)$/;

/**
 * Validates whether a given version string conforms to the decimal-rollover format (e.g. 0.0.1, 1.2.3).
 */
export function isValidDecimalVersion(version: string): boolean {
    if (!version || typeof version !== 'string') {
        return false;
    }
    return DECIMAL_VERSION_REGEX.test(version.trim());
}

/**
 * Increments a version string based on base-10 decimal rollover rules:
 * 0.0.1 -> 0.0.9 -> 0.1.0 -> 0.9.9 -> 1.0.0
 */
export function bumpDecimalVersion(currentVersion: string): string {
    if (!currentVersion || typeof currentVersion !== 'string') {
        throw new Error(`Invalid decimal version: "${currentVersion}". Expected "X.Y.Z" (e.g. 0.0.1).`);
    }

    const trimmed = currentVersion.trim();
    const match = trimmed.match(DECIMAL_VERSION_REGEX);
    if (!match) {
        throw new Error(`Invalid decimal version format: "${currentVersion}". Expected "X.Y.Z" (e.g. 0.0.1).`);
    }

    let major = Number.parseInt(match[1], 10);
    let minor = Number.parseInt(match[2], 10);
    let patch = Number.parseInt(match[3], 10);

    patch += 1;
    if (patch > 9) {
        patch = 0;
        minor += 1;
        if (minor > 9) {
            minor = 0;
            major += 1;
        }
    }

    return `${major}.${minor}.${patch}`;
}

/**
 * Compares two decimal rollover version strings.
 * Returns:
 *  - 1 if v1 > v2
 *  - -1 if v1 < v2
 *  - 0 if v1 == v2
 */
export function compareDecimalVersions(v1: string, v2: string): number {
    const m1 = (v1 || '').trim().match(DECIMAL_VERSION_REGEX);
    const m2 = (v2 || '').trim().match(DECIMAL_VERSION_REGEX);

    if (!m1 || !m2) {
        throw new Error(`Cannot compare invalid decimal versions: "${v1}" vs "${v2}"`);
    }

    const [maj1, min1, pat1] = [Number(m1[1]), Number(m1[2]), Number(m1[3])];
    const [maj2, min2, pat2] = [Number(m2[1]), Number(m2[2]), Number(m2[3])];

    if (maj1 !== maj2) return maj1 > maj2 ? 1 : -1;
    if (min1 !== min2) return min1 > min2 ? 1 : -1;
    if (pat1 !== pat2) return pat1 > pat2 ? 1 : -1;
    return 0;
}
