#!/usr/bin/env bash
# PHP → Next.js 마이그레이션 가드 (advisory, 비차단)
# PreToolUse hook. stdin으로 받은 JSON에서 도구 입력을 검사해
# 철칙 위반 가능성이 있으면 stderr로 경고만 출력한다 (exit 0 = 차단 안 함).
#
# 설치: 대상 프로젝트 .claude/hooks/migration-guard.sh 로 복사 후 chmod +x,
#       .claude/settings.json 의 hooks 에 등록 (settings.json 참고).

input=$(cat)

# 검사 대상 텍스트: Bash command + Edit/Write content + file_path 를 한 덩어리로
payload=$(printf '%s' "$input" | tr '\n' ' ')

warn() {
  echo "⚠️  [migration-guard] $1" >&2
  echo "    철칙 확인 후 진행하세요. (가드는 차단하지 않습니다)" >&2
}

# 1. DB 스키마 변경 (철칙 4)
if printf '%s' "$payload" | grep -iqE 'ALTER[[:space:]]+TABLE|DROP[[:space:]]+(TABLE|DATABASE|COLUMN|INDEX)|CREATE[[:space:]]+TABLE|ADD[[:space:]]+COLUMN|RENAME[[:space:]]+(TABLE|COLUMN)|TRUNCATE'; then
  warn "DB 스키마 변경으로 보이는 SQL이 감지되었습니다 (철칙 4: 스키마 변경 금지)."
fi

# 2. 마이그레이션/덤프 도구 (스키마에 영향)
if printf '%s' "$payload" | grep -iqE 'mysqldump|prisma[[:space:]]+migrate|sequelize[[:space:]]+db:migrate|knex[[:space:]]+migrate|drizzle-kit'; then
  warn "스키마에 영향을 줄 수 있는 마이그레이션 도구 호출이 감지되었습니다 (철칙 4)."
fi

# 3. 세션 구조 선변경 (철칙 5) — 휴리스틱
if printf '%s' "$payload" | grep -iqE 'jsonwebtoken|jwt\.sign|next-auth|new[[:space:]]+JWT'; then
  warn "세션/인증 구조 변경 신호가 감지되었습니다. 세션 전환은 이관의 가장 마지막입니다 (철칙 5)."
fi

exit 0
