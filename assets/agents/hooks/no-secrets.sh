#!/usr/bin/env bash
# PreToolUse · Write|Edit|replace_file_content
# Quét nội dung sắp ghi để chặn hardcode secret trước khi chạm đĩa

INPUT=$(cat)
CONTENT=$(printf '%s' "$INPUT" | grep -o '"(CodeContent|ReplacementContent|content)":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -z "$CONTENT" ]; then
    exit 0
fi

# Regex phát hiện các token nhạy cảm phổ biến
SECRET_REGEX="(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|postgres://[^:]+:[^@]+@)"

if echo "$CONTENT" | grep -qE "$SECRET_REGEX"; then
    echo "🛑 [ONLY-ONE NO-SECRETS] Bị chặn: Phát hiện secret hoặc access token bị hardcode trong nội dung!" >&2
    echo "💡 Vui lòng sử dụng process.env hoặc biến môi trường thay vì ghi trực tiếp vào mã nguồn." >&2
    exit 2
fi

exit 0
