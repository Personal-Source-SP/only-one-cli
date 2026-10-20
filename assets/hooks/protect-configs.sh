#!/usr/bin/env bash
# PreToolUse · Write|Edit|replace_file_content
# Ngăn chặn agent tự ý chỉnh sửa các file hook an toàn

INPUT=$(cat)
TARGET=$(printf '%s' "$INPUT" | grep -o '"(TargetFile|path)":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -z "$TARGET" ]; then
    exit 0
fi

if echo "$TARGET" | grep -qE "(\.agents/hooks|\.claude/settings\.json|hooks\.json)"; then
    echo "🛑 [ONLY-ONE SECURITY] Bị từ chối: Agent không được phép chỉnh sửa file cấu hình an toàn '$TARGET'!" >&2
    exit 1
fi

exit 0
