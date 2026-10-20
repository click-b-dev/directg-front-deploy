# AD-Member-List-01 — 회원 내역

- Figma 파일 `DxqbeoDNTxs5WBpqb25APg`
  - **디자인(구현 기준)**: `[AD] design` 페이지의 `회원_회원내역` — node `29991:3523`
  - 기획서(동작·항목 정의): `AD-Member-List-01` — node `30186:17146` (작성 2026.08.12 / 김나연)
  - 컴포넌트: `Admin` 섹션 — node `29489:3300`
- 라우트: `/renewal/member/list` (`src/routes/renewal/member/list.tsx`)
- 구현: `src/renewal/screens/member-list`, 레이아웃 `src/renewal/widgets/renewal-layout`, UI 래퍼 `src/renewal/shared/ui`
- 스타일 기준: 컴포넌트 파일 `Admin` 섹션의 변수·컴포넌트(값은 `get_variable_defs` 기준. design context의 fallback 색은 실제와 달라 사용하지 않음). 기획서(와이어프레임)는 항목·동작 기준.

## 기획 항목 ↔ 구현

| # | 기획 | 구현 | 사용 API 파라미터 |
|---|------|------|-------------------|
| 1 | 회원 검색 (Dropdown + Input) | 이름/닉네임/휴대폰 번호 + 검색어 | `search_type`(name/nickname/hp), `search_value` |
| 2 | 회원 등급 (Dropdown) | 기존 등급(일반/정회원/VIP) 목록 | `member_level` |
| 3 | 기간 조회 (Dropdown + 날짜 2개) | 가입일/최근 접속일 + `input[type=date]` | `start_reg_date`·`end_reg_date` / `start_log_date`·`end_log_date` |
| 4 | 기간 자동 선택 (오늘/7일/14일) | 폼 값만 채움 | — |
| 5 | 이메일 인증 (Radio) | 인증완료/미인증 | `is_auth` (Y/N) |
| 6 | 장기 미접속 (Dropdown) | 30/90/180일, 1년 | `old_login` (일수) |
| 7 | 이메일 수동 인증 (Btn) | 미인증(`status` 5) 행에만 노출, 기존 `apply` API 연결 | `POST /admin/member/apply` — [상세](AD-Member-Detail-EmailAuth.md) |
| 8 | 상세 (Btn) | legacy `/member/member_view`로 이동(임시) | — |

## 백엔드/기획 확인 필요

1. **이메일 인증 상태·수동 승인** — legacy는 `status`(5=미인증, 0=인증완료)로 표현하고, 수동 승인은 기존 `apply` API다. 목록 응답에 `status`가 없어 현재는 임시 조회(`/admin/member/status`)를 쓴다. 자세한 내용과 확인 사항은 [AD-Member-Detail-EmailAuth.md](AD-Member-Detail-EmailAuth.md).
2. **이메일 인증 필터** — `status` 기준 파라미터가 없어 임시로 `is_auth`로 보낸다(mock에서만 일치).
3. **페이지당 개수** — `GET /admin/member/list`에 `per_page`(20/50/100, 최대 100)를 추가한다(legacy는 30 고정). 응답 `pagination`은 `current_page`, `total_results`, `total_pages`, `per_page`. 페이지 번호 이동·마지막 페이지 이동·총 페이지 수 표시가 필요한 화면이라 커서가 아니라 `page + per_page` 방식이다. 범위를 벗어난 `page`는 빈 목록을 돌려준다. mock도 같은 방식으로 동작하며 250ms 지연을 둔다.
4. **회원 등급 목록** — 기획은 "회원 등급 설정(AD-Membership-01)에서 운영자가 정의한 등급"을 제공. 현재는 고정 3등급(`MEMBER_LEVEL_LABEL`).
5. **휴대폰 번호 검색** — 기획은 "뒤 4자리"로 검색. 서버 `hp` 검색 방식(LIKE 위치) 확인 필요.
6. **기간 기본값** — 기획: 시작일=이번달 1일, 종료일=오늘. 폼에는 기본값을 채우지만, 첫 진입(쿼리 없음)에는 기간 필터를 적용하지 않는다(적용하면 기존 mock 데이터가 모두 제외됨). 조회 버튼을 누르면 적용된다. 기획 의도 확인 필요.
7. **"최근 14일" 기획 문구 불일치** — 설명은 "시작일을 30일 전"이지만 예시(2026.09.22~2026.10.05)는 14일 기준(오늘 포함 14일)이다. 예시를 따라 `오늘-13일`로 구현. "최근 7일"도 같은 방식(`오늘-6일`).
8. **회원 상세** — `AD-Member-Detail-01`(주문 내역 탭) 미구현. 구현 전까지 legacy 상세로 연결한다.

## 구현 중 결정 사항

- 드롭다운은 `@click-b/ui`의 `NativeSelect`(네이티브 select)에 Figma `Select/Item` 스타일을 입혔다. 옵션 목록 팝업(`Dropdown/Item`)은 브라우저 기본 모양.
- 날짜 입력은 `2026.08.01` 형식의 텍스트 박스(직접 입력, 형식 검증). 기획의 "클릭 시 달력/timepicker 노출"은 미구현(`@click-b/ui`의 `DatePicker` 도입 검토).
- 검색 대상 드롭다운은 기본 "선택"(미선택)이다. 검색어만 입력하고 대상을 고르지 않으면 "회원 이름"으로 검색한다.
- GNB의 승인관리/연동관리/알림 버튼과 상단 탭(회원 외), SNB의 "회원 등급 설정"은 아직 리뉴얼 라우트가 없어 동작하지 않는다.
- 폰트: Figma는 Pretendard. 번들하지 않았고 `Pretendard, "Noto Sans KR", sans-serif` 스택만 지정(설치되어 있지 않으면 Noto Sans KR).
- 아이콘/로고는 Figma 자산을 `src/renewal/assets/`로 내려받아 사용.
