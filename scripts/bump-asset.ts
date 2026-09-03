#!/usr/bin/env node
import { bumpAssetManifestVersion } from '../src/core/assets/bump.js';

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
        console.log(`
Usage:
  pnpm asset:bump <type> <id>
  npx tsx scripts/bump-asset.ts <type> <id>

Arguments:
  <type>   Asset category (workflow, skill, rule, mcp, package, combo, git, vs, config)
  <id>     Unique identifier or name of the asset (e.g. only-one-idea, c4-diagrams)

Examples:
  pnpm asset:bump workflow only-one-idea
  pnpm asset:bump skill c4-diagrams
  pnpm asset:bump rule next-architecture-stack
  pnpm asset:bump vs default
`);
        process.exit(0);
    }

    const [typeInput, idInput] = args;

    if (!typeInput || !idInput) {
        console.error('❌ Error: Both <type> and <id> arguments are required.');
        process.exit(1);
    }

    try {
        const result = await bumpAssetManifestVersion(typeInput, idInput);
        console.log(`✓ Successfully bumped [${result.assetType}] "${result.id}": ${result.oldVersion} -> ${result.newVersion}`);
        console.log(`  Updated file: ${result.filePath}`);
    } catch (err: any) {
        console.error(`❌ Error bumping asset version: ${err.message || err}`);
        process.exit(1);
    }
}

main();
