## PHP → Next.js 마이그레이션 규칙

이 프로젝트는 운영 중인 PHP 서비스를 Next.js로 이관하는 작업이다.
판단 기준은 항상 **기능 동일성(Function Parity)** — "더 낫게"가 아니라 "똑같이".

### 데이터 접근 토폴로지
프론트가 DB를 직접 쥐는지 먼저 판별한다.
- **A. 직접 접근형**: Next.js가 DB에 직접 연결. PHP SQL을 그대로 옮긴다.
- **B. 백엔드 분리형**: 프론트는 DB를 안 만지고 별도 백엔드 API만 호출. SQL/로직은 **API 계약으로 도출**해 `docs/migration/`에 기록하고 백엔드에 넘긴다. 프론트는 `packages/api-client`로만 호출.
> directg-front는 **B**다.

### 절대 하지 않는다
- 새 기능 추가, UI/구조 개선 (이관과 분리된 별도 작업)
- DB Schema 변경 (Table/Column/Index)
- Session 구조 선변경 (JWT 전환 등은 가장 마지막)
- 기존 SQL 최적화/리팩터링 (먼저 그대로 옮기고, 최적화는 이관 완료 후)
- (B) 프론트에 SQL·Route Handler·Repository·DB 계층을 만드는 것 — 프론트는 계약 호출만
- 여러 단위를 한 커밋에 몰아서 변경

### 반드시 한다
- 한 번에 한 단위만 이관 (Page / Function / API / Component)
- 구현 전 원본 PHP의 Request·Logic·DB·Session·Response 분석
- (B) legacy SQL/로직에서 API 계약을 도출해 `docs/migration/`에 기록
- 한 단위 = 한 커밋 (작게, 되돌리기 쉽게)
- 단위 완료 시 기존 화면과 결과·Validation·Error·Redirect·권한 동일성 검증
- 단위 완료 시 정지하고 parity 보고 → 개발자 승인 후에만 `docs/MIGRATION-MAP.md`에 ✅ 기록

### 막혔을 때
원본 PHP 동작이 불명확하면 추측하지 말고 분석을 더 한다. 동일성이 안 맞으면
"원본은 어떻게 동작했나"를 먼저 확인한다.
