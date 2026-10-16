# 자동메일 잔액조회

M6(회원 관리) — 자동메일 관리 그룹 첫 화면. legacy `directsend_remaining_emoney.php` — DirectSend 메일 API 잔액 표시(정적 안내 + 잔액 1건).

## 원본
- 파일: `pc/_Admin_/member/directsend_remaining_emoney.php` (라이브, 81줄)
- `src/classes/DirectSendMail.php` remainingMoney() — 외부 DirectSend API(`https://directsend.co.kr/index.php/api_v2/remaining_money`) POST → point.
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§회원), `../legacy-project/docs/NOTIFICATION-EMAIL.md`

## 화면·플로우

### 진입 URL/파라미터
- `/member/directsend_remaining_emoney` (GET, 파라미터 없음).
- topmenu member active. sidebar_member.

### 화면 요소
- page-title-box: breadcrumb(홈/회원/**자동메일 관리**/자동메일 잔액조회), h4 "자동메일 잔액조회".
- **정보 table** (table-centered nowrap table-sm table-bordered, tbody table-light) 3행:
  - 연동시스템 → `다이렉트샌드 메일발송 API (https://directsend.co.kr/)`
  - 계정정보 → `dcpinter / 비밀번호는 별도 문의`
  - 잔액조회 → `{remaining_point} 원` (legacy는 number_format 없이 raw 출력이나 **개발자 지시로 천단위 콤마 포매팅 적용 — parity 이탈**)
- **alert-info 2개**(dripicons-information):
  - `메일발송 비용은 발송 1건당 0.5원입니다.` + `<br/>`
  - `잔액이 얼마 남지 않은 것을 확인 할 경우 충전요청 부탁드립니다.`

### 분기/세션
- 단일 GET 렌더(읽기 전용). mutation 없음. lib.php 관리자 세션 가드(공통).

## 데이터 (legacy)
- DirectSendMail::remainingMoney(): 외부 API POST(username/key) → JSON `point` 반환. **외부 연동 → 백엔드 책임**.

## API 계약 (백엔드 전달)

### `GET /admin/member/directsend/remaining`
DirectSend 메일 API 잔액 조회. 백엔드가 외부 API 호출(계정/키 보관).

**응답 200** `DirectSendRemaining`:
```jsonc
{ "remaining_point": 152340 }
```
- 백엔드: DirectSend remaining_money API 호출, point 반환. (계정 dcpinter·key는 백엔드 시크릿)
- 에러: 외부 API 실패 시 처리(legacy는 int 캐스팅, 실패 시 0).

## 타겟 매핑
- 라우트: `/member/directsend_remaining_emoney` (`routes/member/directsend_remaining_emoney.tsx`)
- entities: `entities/member` 확장 — DirectSendRemaining 타입, `fetchDirectSendRemaining`·`useDirectSendRemaining`
- screen: `screens/member-directsend-remaining` — 정적 table + 잔액 + alert 2개
- mock: `handlers/member.ts` 확장 — directsend/remaining 고정 payload

## Parity 체크리스트
- [ ] breadcrumb(자동메일 관리) 일치
- [ ] 정보 table 3행(연동시스템/계정정보/잔액 raw+원) 일치
- [ ] alert-info 2개 문구 일치
