#!/usr/bin/env bash
# Stop Hook · Chạy khi agent định kết thúc lượt.
# Test fail thì exit 2 => agent PHẢI sửa tiếp, không được tự ý báo xong.

INPUT=$(cat)
# Tránh lặp vô hạn nếu đã có cờ kích hoạt
printf '%s' "$INPUT" | grep -q '"stop_hook_active":true' && exit 0

[ -f package.json ] || exit 0
grep -q '"test":' package.json || exit 0

TEMP_LOG=$(mktemp 2>/dev/null || echo "/tmp/only-one-test-gate.log")

if ! npm test --silent > "$TEMP_LOG" 2>&1; then
    echo "🛑 [ONLY-ONE TEST-GATE] Kiểm tra thất bại! Bạn không được phép kết thúc lượt." >&2
    echo "🔍 Chi tiết lỗi kiểm thử:" >&2
    cat "$TEMP_LOG" >&2
    rm -f "$TEMP_LOG"
    exit 2
fi

rm -f "$TEMP_LOG"
exit 0
