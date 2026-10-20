import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const pkgDir = path.join(rootDir, 'packages', 'tui-engine');
const binDir = path.join(rootDir, 'bin');

if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
}

const ext = process.platform === 'win32' ? '.exe' : '';
const outputPath = path.join(binDir, `only-one-ui${ext}`);

console.log(`[build-go] Compiling Go TUI Engine into ${outputPath}...`);
try {
    execSync(`go build -ldflags="-s -w" -o "${outputPath}" main.go`, {
        cwd: pkgDir,
        stdio: 'inherit',
    });
    if (process.platform !== 'win32' && fs.existsSync(outputPath)) {
        fs.chmodSync(outputPath, 0o755);
    }
    console.log('[build-go] Build succeeded!');
} catch (err) {
    console.error('[build-go] Failed to compile Go engine:', err.message);
    process.exit(1);
}
