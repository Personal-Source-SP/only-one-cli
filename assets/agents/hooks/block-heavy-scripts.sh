#!/usr/bin/env bash
# PreToolUse · Bash|run_command
# Chặn các lệnh kiểm tra nặng (build, lint, full test) khi đang ở phase planning/spec

INPUT=$(cat)
COMMAND=$(printf '%s' "$INPUT" | grep -o '"command":"[^"]*"' | cut -d'"' -f4)

if [ -z "$COMMAND" ]; then
    exit 0
fi

# Kiểm tra nếu lệnh chứa build, lint hoặc tsc
if echo "$COMMAND" | grep -qE "(npm run build|npm run lint|npm run format:check|tsc --noEmit)"; then
    # Kiểm tra xem có đang ở trong phase planning hay không (concept.md, plan.md, debug.md đang diagnosing)
    if [ -f "only-one/tasks/"*"/concept.md" ] || grep -q "status: planning" only-one/tasks/*/*.md 2>/dev/null; then
        echo "🛑 [ONLY-ONE HOOK] Lệnh '$COMMAND' bị chặn trong phase lập kế hoạch!" >&2
        echo "💡 Chỉ được phép chạy script kiểm tra nhẹ (validate-plan.ts) hoặc test reproducer đơn lẻ." >&2
        exit 1
    fi
fi

exit 0
