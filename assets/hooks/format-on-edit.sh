#!/usr/bin/env bash
# PostToolUse · Write|Edit|replace_file_content
# Tự động format file vừa sửa bằng prettier cục bộ

INPUT=$(cat)
FILE=$(printf '%s' "$INPUT" | grep -o '"(TargetFile|path)":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
    exit 0
fi

PRETTIER_BIN="node_modules/.bin/prettier"
if [ -x "$PRETTIER_BIN" ] || command -v npx >/dev/null 2>&1; then
    npx prettier --write "$FILE" >/dev/null 2>&1 || true
fi

exit 0
