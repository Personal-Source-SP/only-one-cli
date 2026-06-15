import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const readCliVersion = (): string => {
    const packagePath = join(dirname(fileURLToPath(import.meta.url)), '../../../package.json');
    const pkg = JSON.parse(readFileSync(packagePath, 'utf-8')) as { version?: string };
    return pkg.version ?? '0.0.0';
};
