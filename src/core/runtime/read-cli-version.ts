import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolvePackageRoot } from './package-root.js';

export const readCliVersion = (): string => {
    const packagePath = join(resolvePackageRoot(import.meta.url), 'package.json');
    const pkg = JSON.parse(readFileSync(packagePath, 'utf-8')) as { version?: string };
    return pkg.version ?? '0.0.0';
};
