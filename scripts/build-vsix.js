import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const info = (msg) => console.log(`\x1b[1;34m[build-vsix]\x1b[0m ${msg}`);
const ok = (msg) => console.log(`\x1b[1;32m[build-vsix]\x1b[0m ${msg}`);
const warn = (msg) => console.log(`\x1b[1;33m[build-vsix]\x1b[0m ${msg}`);
const die = (msg) => {
    console.error(`\x1b[1;31m[build-vsix]\x1b[0m ERROR: ${msg}`);
    process.exit(1);
};

// 1. Build extension project
info('Building project...');
try {
    execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
    ok('Build successful!');
} catch {
    die('Project build failed.');
}

// 2. Package into .vsix using vsce
info('Packaging extension into .vsix file...');
const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const vsixName = `${pkg.name}-${pkg.version}.vsix`;
const vsixPath = path.join(ROOT, vsixName);

try {
    execSync('npx @vscode/vsce package --no-dependencies --allow-missing-repository', { cwd: ROOT, stdio: 'inherit' });
    ok(`Created .vsix package: ${vsixName}`);
} catch (err) {
    die(`Failed to package .vsix: ${err.message}`);
}

// 3. Direct sync into IDE extension directories (Antigravity IDE, VS Code, Cursor)
const homeDir = os.homedir();
const targetExtensionDirName = `only-one.${pkg.name}-${pkg.version}`;
const candidateDirs = [
    path.join(homeDir, '.antigravity-ide', 'extensions'),
    path.join(homeDir, '.vscode', 'extensions'),
    path.join(homeDir, '.cursor', 'extensions'),
];

let directSynced = false;
for (const baseDir of candidateDirs) {
    if (fs.existsSync(baseDir)) {
        const destFolder = path.join(baseDir, targetExtensionDirName);
        info(`Deploying directly to IDE extensions folder: ${destFolder}...`);
        
        // Remove existing target folder if present
        if (fs.existsSync(destFolder)) {
            fs.rmSync(destFolder, { recursive: true, force: true });
        }
        fs.mkdirSync(destFolder, { recursive: true });

        // Copy required production files
        const itemsToCopy = ['package.json', 'README.md', 'dist', 'assets'];
        for (const item of itemsToCopy) {
            const srcItem = path.join(ROOT, item);
            const destItem = path.join(destFolder, item);
            if (fs.existsSync(srcItem)) {
                fs.cpSync(srcItem, destItem, { recursive: true });
            }
        }
        ok(`Successfully deployed to: ${destFolder}`);
        directSynced = true;
    }
}

if (directSynced) {
    ok(`🚀 Extension ${pkg.name} installed successfully!`);
    info(`Press Ctrl+Shift+P -> "Developer: Reload Window" (hoặc Restart IDE) để VS Code/Antigravity nạp extension mới.`);
} else {
    warn('No IDE extension folder detected.');
}
