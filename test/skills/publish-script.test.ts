import { describe, expect, it } from 'vitest';

export function resolvePublishTarget(args: string[], originalPkgName: string) {
    const hasGithub = args.includes('--github') || (args.indexOf('--target') !== -1 && args[args.indexOf('--target') + 1] === 'github');

    if (hasGithub) {
        return {
            target: 'github',
            pkgName: '@personal-source-sp/only-one',
            registry: 'https://npm.pkg.github.com',
        };
    }

    return {
        target: 'npm',
        pkgName: originalPkgName,
        registry: 'https://registry.npmjs.org',
    };
}

export function isSensitiveFilename(filename: string): boolean {
    const sensitivePatterns = [/\.npmrc$/, /\.env$/, /\.env\..*$/, /\.netrc$/, /\.pem$/, /\.key$/];

    return sensitivePatterns.some((pattern) => pattern.test(filename));
}

export function containsSensitiveContent(content: string): boolean {
    const sensitiveContentPattern = /(:_authToken\s*=\s*(?!<|YOUR|\$)[A-Za-z0-9_]{10,}|npm_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,})/;

    return sensitiveContentPattern.test(content);
}

describe('publish: resolvePublishTarget', () => {
    it('mặc định target là npm với tên package gốc', () => {
        const config = resolvePublishTarget([], 'only-one');

        expect(config.target).toBe('npm');
        expect(config.pkgName).toBe('only-one');
        expect(config.registry).toBe('https://registry.npmjs.org');
    });

    it('chuyển sang target github khi có cờ --target github', () => {
        const config = resolvePublishTarget(['--target', 'github'], 'only-one');

        expect(config.target).toBe('github');
        expect(config.pkgName).toBe('@personal-source-sp/only-one');
        expect(config.registry).toBe('https://npm.pkg.github.com');
    });

    it('chuyển sang target github khi có cờ --github', () => {
        const config = resolvePublishTarget(['--github'], 'only-one');

        expect(config.target).toBe('github');
        expect(config.pkgName).toBe('@personal-source-sp/only-one');
    });
});

describe('publish: sanitizer checks', () => {
    it('phát hiện đúng các file cấu hình nhạy cảm', () => {
        expect(isSensitiveFilename('.npmrc')).toBe(true);
        expect(isSensitiveFilename('.env')).toBe(true);
        expect(isSensitiveFilename('.env.production')).toBe(true);
        expect(isSensitiveFilename('README.md')).toBe(false);
    });

    it('phát hiện chuỗi auth token nguy hiểm trong nội dung', () => {
        expect(containsSensitiveContent('//npm.pkg.github.com/:_authToken=ghp_secretToken123456789012345')).toBe(true);
        expect(containsSensitiveContent('export const VERSION = "1.0.0";')).toBe(false);
    });
});
