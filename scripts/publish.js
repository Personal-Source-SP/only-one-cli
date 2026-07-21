import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Parse arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const localInstall = args.includes('--local');

let npmTag = 'latest';
const tagIdx = args.indexOf('--tag');
if (tagIdx !== -1 && args[tagIdx + 1]) {
  npmTag = args[tagIdx + 1];
}

let otp = '';
const otpIdx = args.indexOf('--otp');
if (otpIdx !== -1 && args[otpIdx + 1]) {
  otp = args[otpIdx + 1];
}

const info = (msg) => console.log(`\x1b[1;34m[publish]\x1b[0m ${msg}`);
const ok = (msg) => console.log(`\x1b[1;32m[publish]\x1b[0m ${msg}`);
const die = (msg) => {
  console.error(`\x1b[1;31m[publish]\x1b[0m ERROR: ${msg}`);
  process.exit(1);
};

// Pre-flight checks
try {
  execSync('node --version', { stdio: 'ignore' });
  execSync('npm --version', { stdio: 'ignore' });
} catch {
  die('node or npm is not installed/available in PATH.');
}

if (!localInstall) {
  try {
    const whoami = execSync('npm whoami', { encoding: 'utf8' }).trim();
    ok(`Logged in to npm as: ${whoami}`);
  } catch {
    die('Not logged in to npm. Run: npm login');
  }
} else {
  ok('Local install mode — skipping npm login check.');
}

// Read package.json
const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const pkgName = pkg.name;
const pkgVersion = pkg.version;

let publishVersion = pkgVersion;
if (npmTag !== 'latest') {
  const rcTimestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  publishVersion = `${pkgVersion.split('-')[0]}-${npmTag}.${rcTimestamp}`;
  info(`RC version : ${publishVersion} (package.json stays at ${pkgVersion})`);
}

if (localInstall) {
  info(`Package : ${pkgName}@${publishVersion} (local install)`);
} else {
  info(`Package : ${pkgName}@${publishVersion} (tag: ${npmTag})`);
}

if (!localInstall && npmTag === 'latest') {
  try {
    const infoVersion = execSync(`npm info ${pkgName}@${publishVersion} version`, { encoding: 'utf8', stdio: [] }).trim();
    if (infoVersion) {
      die(`Version ${publishVersion} is already published on npm. Bump the version first.`);
    }
  } catch {
    // Version does not exist, safe to proceed
  }
}

// Build
info('Building TypeScript...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: ROOT });
  ok('Build complete');
} catch {
  die('Build failed.');
}

// Package & Publish
const packDir = fs.mkdtempSync(path.join(os.tmpdir(), 'only-one-publish-'));
const packRoot = path.join(packDir, 'package');
fs.mkdirSync(packRoot, { recursive: true });

const copyRecursive = (src, dest) => {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
};

info('Copying files for packaging...');
copyRecursive(path.join(ROOT, 'dist'), path.join(packRoot, 'dist'));
fs.copyFileSync(path.join(ROOT, 'package.json'), path.join(packRoot, 'package.json'));

const scriptsDir = path.join(packRoot, 'scripts');
fs.mkdirSync(scriptsDir, { recursive: true });
const docScript = path.join(ROOT, 'scripts', 'cocoindex_documents.py');
if (fs.existsSync(docScript)) {
  fs.copyFileSync(docScript, path.join(scriptsDir, 'cocoindex_documents.py'));
}

for (const file of ['README.md', 'LICENSE']) {
  const filePath = path.join(ROOT, file);
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, path.join(packRoot, file));
  }
}

const assetsDir = path.join(ROOT, 'assets');
if (fs.existsSync(assetsDir)) {
  copyRecursive(assetsDir, path.join(packRoot, 'assets'));
}

// Update package.json in packRoot
const packPkgPath = path.join(packRoot, 'package.json');
const packPkg = JSON.parse(fs.readFileSync(packPkgPath, 'utf8'));
packPkg.version = publishVersion;
delete packPkg.devDependencies;
packPkg.scripts = {};
fs.writeFileSync(packPkgPath, JSON.stringify(packPkg, null, 2) + '\n');

// Sensitive file check
const sensitivePatterns = [/\.npmrc$/, /\.env$/, /\.env\..*$/, /\.netrc$/, /\.pem$/, /\.key$/];
const sensitiveContentPattern = /(_authToken|npm_[A-Za-z0-9]{20,})/;

const checkSensitive = (dir) => {
  for (const child of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, child);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      checkSensitive(fullPath);
    } else {
      if (sensitivePatterns.some((pat) => pat.test(child))) {
        die(`Sensitive config file found: ${path.relative(packRoot, fullPath)}`);
      }
      const content = fs.readFileSync(fullPath, 'utf8');
      if (sensitiveContentPattern.test(content)) {
        die(`Sensitive npm token content found in file: ${path.relative(packRoot, fullPath)}`);
      }
    }
  }
};
checkSensitive(packRoot);

if (dryRun) {
  info('Files that will be included in the package (dry-run):');
  try {
    execSync('npm pack --dry-run', { stdio: 'inherit', cwd: packRoot });
  } catch (err) {
    die(`npm pack --dry-run failed: ${err.message}`);
  }
  fs.rmSync(packDir, { recursive: true, force: true });
  ok('Dry-run mode — skipping actual publish.');
} else if (localInstall) {
  info('Creating local tarball...');
  try {
    const stdout = execSync('npm pack --silent', { cwd: packRoot, encoding: 'utf8' }).trim();
    const tarballName = stdout.split('\n').pop();
    const tarballPath = path.join(packRoot, tarballName);
    
    info(`Installing globally from tarball: ${tarballName}`);
    execSync(`npm install -g "${tarballPath}"`, { stdio: 'inherit', cwd: ROOT });
    fs.rmSync(packDir, { recursive: true, force: true });
    ok('Installed locally. Test with: only-one --version');
  } catch (err) {
    fs.rmSync(packDir, { recursive: true, force: true });
    die(`Local installation failed: ${err.message}`);
  }
} else {
  info(`Publishing ${pkgName}@${publishVersion} to npm (tag: ${npmTag})...`);
  try {
    let publishCmd = 'npm publish --access public --tag ' + npmTag;
    if (otp) {
      publishCmd += ` --otp ${otp}`;
    }
    execSync(publishCmd, { stdio: 'inherit', cwd: packRoot });
    fs.rmSync(packDir, { recursive: true, force: true });
    if (npmTag === 'latest') {
      ok(`Published! Install with: npm install -g ${pkgName}`);
    } else {
      ok(`Published as '${npmTag}'! Install with: npm install -g ${pkgName}@${npmTag}`);
    }
  } catch (err) {
    fs.rmSync(packDir, { recursive: true, force: true });
    die(`Publish failed: ${err.message}`);
  }
}
