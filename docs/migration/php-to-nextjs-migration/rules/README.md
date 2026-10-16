# 마이그레이션 대상 프로젝트 가드 (선택 적용)

운영 서비스 이관은 프로젝트마다 가드를 두는 것이 안전하다. 전역 설정을 건드리지 않고,
**이관 대상 Next.js 프로젝트 안에** 아래 파일들을 복사해 넣는다.

## 적용 방법

1. `CLAUDE.md` 내용을 대상 프로젝트 루트의 `CLAUDE.md`에 추가한다.
   (이미 있으면 "## PHP → Next.js 마이그레이션 규칙" 섹션만 append)

2. (선택) 위험 작업 경고 hook을 켠다:
   - `migration-guard.sh`를 대상 프로젝트 `.claude/hooks/migration-guard.sh`로 복사
   - `chmod +x .claude/hooks/migration-guard.sh`
   - `settings.json`의 `hooks` 항목을 대상 프로젝트 `.claude/settings.json`에 병합

## 설계 방침

- hook은 **차단하지 않고 경고만** 한다(advisory). SI Harness 게이트 철학과 동일 —
  경고를 출력하되 최종 판단은 개발자에게 맡긴다.
- 감지 대상: 스키마 변경 SQL(`ALTER TABLE`, `DROP`, `CREATE TABLE`, `ADD COLUMN` 등),
  `mysqldump`/마이그레이션 도구 호출 → 철칙 4 위반 가능성 알림.
