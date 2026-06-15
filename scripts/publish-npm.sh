#!/usr/bin/env bash
# publish-npm.sh — Build and publish/install the only-one-cli CLI
# Usage: ./scripts/publish-npm.sh [--dry-run] [--local] [--tag <tag>] [--otp <code>]
#   --local      Build, pack, and install the tarball globally for local testing
#   --tag next   Publish as a release candidate (won't affect 'latest')
#   --tag beta   Same idea with a different label
#   --otp 123456 Provide 2FA one-time password for npm publish

set -euo pipefail

DRY_RUN=false
LOCAL_INSTALL=false
NPM_TAG="latest"
OTP=""
ARGS=("$@")
for i in "${!ARGS[@]}"; do
  [[ "${ARGS[$i]}" == "--dry-run" ]] && DRY_RUN=true
  [[ "${ARGS[$i]}" == "--local" ]] && LOCAL_INSTALL=true
  if [[ "${ARGS[$i]}" == "--tag" ]]; then
    NPM_TAG="${ARGS[$((i+1))]:-next}"
  fi
  if [[ "${ARGS[$i]}" == "--otp" ]]; then
    OTP="${ARGS[$((i+1))]:-}"
  fi
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

NPM_CONFIG_ARGS=()
if [[ -f "$ROOT/.npmrc" ]]; then
  NPM_CONFIG_ARGS=(--userconfig "$ROOT/.npmrc")
fi

# ── Helpers ──────────────────────────────────────────────────────────────────
info()  { echo -e "\033[1;34m[publish]\033[0m $*"; }
ok()    { echo -e "\033[1;32m[publish]\033[0m $*"; }
die()   { echo -e "\033[1;31m[publish]\033[0m ERROR: $*" >&2; exit 1; }
npm_registry() { npm "${NPM_CONFIG_ARGS[@]}" "$@"; }

assert_no_sensitive_files() {
  local pack_root="$1"
  local found_files=""
  local found_content=""

  found_files=$(
    find "$pack_root" \
      \( \
        -name ".npmrc" -o \
        -name ".env" -o \
        -name ".env.*" -o \
        -name ".netrc" -o \
        -name "*.pem" -o \
        -name "*.key" \
      \) \
      -print
  )

  if [[ -n "$found_files" ]]; then
    echo "$found_files" | sed "s#^$pack_root/#  #" >&2
    die "Sensitive config file found in package root."
  fi

  if command -v rg >/dev/null; then
    found_content=$(
      rg --hidden --no-messages -I -l \
        '(_authToken|npm_[A-Za-z0-9]{20,})' \
        "$pack_root" || true
    )
  else
    found_content=$(
      grep -RIlE \
        '(_authToken|npm_[A-Za-z0-9]{20,})' \
        "$pack_root" || true
    )
  fi

  if [[ -n "$found_content" ]]; then
    echo "$found_content" | sed "s#^$pack_root/#  #" >&2
    die "Sensitive npm token content found in package root."
  fi
}

# ── Pre-flight checks ─────────────────────────────────────────────────────────
command -v node >/dev/null || die "node is not installed"
command -v npm  >/dev/null || die "npm is not installed"

if $LOCAL_INSTALL; then
  ok "Local install mode — skipping npm login check."
else
  if ! npm_registry whoami &>/dev/null; then
    die "Not logged in to npm. Run: npm login"
  fi
  NPM_USER=$(npm_registry whoami)
  ok "Logged in to npm as: $NPM_USER"
fi

PKG_NAME=$(node -p "require('./package.json').name")
PKG_VERSION=$(node -p "require('./package.json').version")

PUBLISH_VERSION="$PKG_VERSION"
if [[ "$NPM_TAG" != "latest" ]]; then
  RC_TIMESTAMP=$(date +%Y%m%d%H%M%S)
  PUBLISH_VERSION="${PKG_VERSION%-*}-${NPM_TAG}.${RC_TIMESTAMP}"
  info "RC version : $PUBLISH_VERSION (package.json stays at $PKG_VERSION)"
fi

if $LOCAL_INSTALL; then
  info "Package : $PKG_NAME@$PUBLISH_VERSION (local install)"
else
  info "Package : $PKG_NAME@$PUBLISH_VERSION (tag: $NPM_TAG)"
fi

if ! $LOCAL_INSTALL && [[ "$NPM_TAG" == "latest" ]] && npm_registry info "$PKG_NAME@$PUBLISH_VERSION" version &>/dev/null; then
  die "Version $PUBLISH_VERSION is already published on npm. Bump the version first."
fi

# ── Build ─────────────────────────────────────────────────────────────────────
info "Building TypeScript..."
npm run build

ok "Build complete"

# ── Package & Publish ─────────────────────────────────────────────────────────
PACK_DIR=$(mktemp -d)
PACK_ROOT="$PACK_DIR/package"
mkdir -p "$PACK_ROOT"

cp -R dist "$PACK_ROOT/"
cp package.json "$PACK_ROOT/"
mkdir -p "$PACK_ROOT/scripts"
[[ -f scripts/cocoindex_documents.py ]] && cp scripts/cocoindex_documents.py "$PACK_ROOT/scripts/"
[[ -f README.md ]] && cp README.md "$PACK_ROOT/"
[[ -f LICENSE ]] && cp LICENSE "$PACK_ROOT/"

# Stamp version into the packaged package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('$PACK_ROOT/package.json', 'utf8'));
pkg.version = '$PUBLISH_VERSION';
delete pkg.devDependencies;
delete pkg.scripts;
pkg.scripts = { };
fs.writeFileSync('$PACK_ROOT/package.json', JSON.stringify(pkg, null, 2) + '\n');
"

assert_no_sensitive_files "$PACK_ROOT"

info "Files that will be included in the package:"
(cd "$PACK_ROOT" && npm pack --dry-run 2>&1)

if $DRY_RUN; then
  rm -rf "$PACK_DIR"
  ok "Dry-run mode — skipping actual publish."
  info "Run without --dry-run to publish for real."
elif $LOCAL_INSTALL; then
  info "Creating local tarball..."
  TARBALL_NAME=$(cd "$PACK_ROOT" && npm pack --pack-destination "$PACK_DIR" --silent)
  TARBALL_PATH="$PACK_DIR/$TARBALL_NAME"

  info "Installing globally from tarball: $TARBALL_NAME"
  npm install -g "$TARBALL_PATH"
  rm -rf "$PACK_DIR"

  ok "Installed locally. Test with: only-one-cli --version"
else
  info "Publishing $PKG_NAME@$PUBLISH_VERSION to npm (tag: $NPM_TAG)..."
  if [[ -n "$OTP" ]]; then
    (cd "$PACK_ROOT" && npm_registry publish --access public --tag "$NPM_TAG" --otp "$OTP")
  else
    (cd "$PACK_ROOT" && npm_registry publish --access public --tag "$NPM_TAG")
  fi
  rm -rf "$PACK_DIR"
  if [[ "$NPM_TAG" == "latest" ]]; then
    ok "Published! Install with: npm install -g $PKG_NAME"
  else
    ok "Published as '$NPM_TAG'! Install with: npm install -g $PKG_NAME@$NPM_TAG"
  fi
fi
