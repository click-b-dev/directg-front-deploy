# 회원 영역 기반 (사이드바 전환 + 회원 대시보드)

M-계열(회원 관리) 영역의 첫 단위. legacy `sidebar_member.php` 사이드바 트리 전환 + `dashboard_crm.php` 실데이터 대시보드를 함께 이관한다. (선례: #169 프로모션 영역 기반 = 사이드바+대시보드 묶음.)

## 원본
- 파일:
  - `pc/_Admin_/inc/sidebar_member.php` (회원 영역 사이드바 — 라이브 버전, 변형 없음)
  - `pc/_Admin_/member/dashboard_crm.php` (회원 대시보드 — 실데이터 집계, 변형 없음)
  - `pc/_Admin_/lib/lib_func.php:68` — `pct($n,$d)` 헬퍼
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§회원), `../legacy-project/docs/MEMBER-LIFECYCLE.md`

## 화면·플로우

### 진입 URL/파라미터
- `/member/dashboard_crm` (GET). optional `?refresh=1` → 캐시 무시 강제 재집계.
- topmenu `member` active. sidebar = `sidebar_member.php`.

### 사이드바 트리 (라이브 = 주석 제외)
- **회원 대시보드** (link) → `/member/dashboard_crm` (icon `uil-comments-alt`)
- **회원 관리** (group `sidebarMember`, collapse show)
  - 회원 리스트 → `/member/member_list`
  - (회원 상세 → `/member/member_view` — `style="display:none"` 링크 대상, 트리 미노출)
  - 승인대기 리스트 → `/member/member_list_ready`
  - 간편로그인 연동현황(NAVER) → `/member/member_naver_list`
  - 간편로그인 연동현황(KAKAO) → `/member/member_kakao_list`
  - 간편로그인 연동현황(PAYCO) → `/member/member_payco_list`
  - (주석 dead: 탈퇴완료/휴면예정/휴면리스트/보유포인트/보유쿠폰/블랙리스트 — 미노출)
- **포인트 관리** (group `sidebarEmoney`, collapse show)
  - 포인트 지급/차감 내역 → `/member/member_point_list`
  - 포인트 지급/차감 → `/member/member_point_form`
- **자동메일 관리** (group `sidebarAutoEmail`, collapse show)
  - (주석 dead: mail_join/mail_password_auto 등 — 미노출)
  - 자동메일 잔액조회 → `/member/directsend_remaining_emoney`
  - 자동메일발송 로그 → `/member/directsend_mail_log`
- 그룹 아이콘 3종 모두 `uil-shop`(기본 크기), 대시보드 link만 `uil-comments-alt`.
- 그룹 전부 `collapse show` → expandAll: true (프로모션/이벤트 선례).

### 대시보드 화면 요소 (legacy 렌더 순서 그대로)
> legacy 주석은 섹션 1·2·4·6 (3·5는 과거 제거됨). 순서·번호 그대로.

- **page-title-box**: 우측 `기준 HH:MM`(cached_at의 시각, `date('H:i')`) + `새로고침` 버튼(`?refresh=1`). h4 "회원 대시보드".
- **1. 회원 현황** (h5 `mdi-account-group`): 4 카드(col-lg-3 col-6)
  - 총 회원 `total` (border) / 회원 `active_all` (border-success text-success) / 리셀러 `type_r` (border-info text-info) / 승인대기 `pending` (border-warning text-warning). 전부 `number_format`.
- **2. 신규가입 / 분포 / SNS**
  - 신규가입 카드(col-lg-4): 헤더 bg-primary. table 3행(오늘/이번주/이번달) × (신규가입 `join_today/week/month` h5 / 승인대기 `pending_today/week/month` text-warning). 각주 "승인대기 = 해당 기간 가입자 중 status=5".
  - 회원 등급 분포(col-lg-6, `(전체회원 기준)`): lv1 일반 / lv2 정회원 / lv3 VIP. 각 `number_format(cnt)` + `(pct(cnt,total)%)` + 막대(width=pct%, `.crm-dist-bar` #3b7ddd h10 radius4).
  - 회원 유형 분포(col-lg-6, `(전체회원 기준)`): type_p 일반(P) / type_r 리셀러(R) / type_s 휴면(S). 동일 막대.
  - SNS 연동 회원(col-12): 헤더 우측 `연동 회원 {sns_total}명 (전체의 pct(sns_total,total)%)`. 각 sns_type 행: `{cnt} (전체 pct(cnt,total)%)` + 막대(width=pct(cnt,**sns_max**)% — 최대값 기준 스케일). 빈 목록 "SNS 연동 데이터가 없습니다.".
- **4. 활동성** (h5 `mdi-clock-outline`, `(최근 접속 log_date 기준 · 전체회원)`): 5 카드(col-lg col-6)
  - 최근 7일 `login_7`(text-success) / 30일 `login_30` / 90일 `login_90` / 1년+ 미접속 `login_1y`(border-warning text-warning) / 접속기록 없음 `login_never`(text-muted).
- **6. 자동메일 현황** (h5 `mdi-email-outline`, `(어제부터 · tbl_email_api)`)
  - 요약 카드(col-lg-4): 발송 `mail_total` / 성공 `mail_total-mail_fail`(text-success) / 실패 `mail_fail`(text-danger). 각주 `실패율 pct(fail,total)% (failed IN 1,4)`.
  - 구분별 발송(col-lg-8): 헤더 우측 `발송로그` 버튼 → `/member/directsend_mail_log`. table 각 gubun 행: 구분 라벨(`join`→가입/`password`→비밀번호/`qna`→문의/그 외 raw, 빈값→`(미분류)`) / 발송 cnt / 성공 cnt-fail(text-success) / 실패 fail(text-danger) / 실패율 `pct(fail,cnt)%`. 빈 목록 colspan5 "최근 30일 발송 내역 없음".

### 분기/리다이렉트
- 없음(단일 GET 렌더). 새로고침 버튼만 `?refresh=1` 재요청.

### 세션/권한 의존 (백엔드)
- `$_SESSION['crm_dash']` 10분 TTL 세션 캐시(무거운 200만 회원 스캔). `?refresh=1` 강제 갱신. → **백엔드 책임**(응답의 `cached_at` 기준시각 제공).
- lib.php 관리자 세션 가드(공통) — #2 route-guard로 이미 처리.

## 데이터 (legacy)
- 도메인: 크로스DB PDO. 회원 `directgames.tbl_member`·`sns_info`, 자동메일 `directgames.tbl_email_api`.
- SQL 요약:
  - `summary`: `tbl_member` 1회 스캔. status(0=회원/5=승인대기/1=탈퇴)·mem_type(R/P/S)·mem_level(1/2/3)·reg_date(오늘/이번주 weekday 기준/이번달)·pending(reg_date+status=5)·log_date(7/30/90일·1년+·null) 집계.
  - `sns_rows`: `sns_info` `sns_type`별 `count(distinct m_no)` desc. `sns_total`: 전체 distinct m_no.
  - `mail_rows`: `tbl_email_api` `reg_date >= curdate()-interval 1 day`, `gubun`별 count·`sum(failed in (1,4))` desc.
- **quirk(원문 유지)**: 자동메일 섹션 부제 "어제부터"·SQL `interval 1 day` vs 빈 메시지/코드 주석 "최근 30일" 불일치 → 라벨 그대로 이식(동작은 어제부터 집계).

## API 계약 (백엔드 전달)

### `GET /admin/member/dashboard?refresh=0|1`
회원 대시보드 집계 스냅샷. 백엔드가 10분 세션(또는 서버) 캐시 관리, `refresh=1`이면 강제 재계산.

**응답 200** `MemberDashboard`:
```jsonc
{
  "cached_at": 1753776000,          // 기준시각(unix seconds). 프런트 date H:i 포맷
  "summary": {
    "total": 1234567, "active_all": 1200000, "pending": 320, "leave_cnt": 34567,
    "type_r": 4500, "type_p": 1195000, "type_s": 500,
    "lv1": 1100000, "lv2": 95000, "lv3": 5000,
    "join_today": 120, "join_week": 800, "join_month": 3400,
    "pending_today": 12, "pending_week": 80, "pending_month": 300,
    "login_7": 45000, "login_30": 120000, "login_90": 300000,
    "login_1y": 400000, "login_never": 250000
  },
  "sns_rows": [ { "sns_type": "KAKAO", "cnt": 82000 }, { "sns_type": "NAVER", "cnt": 41000 } ],
  "sns_total": 110000,               // distinct m_no
  "mail_rows": [ { "gubun": "join", "cnt": 320, "fail": 4 }, { "gubun": "password", "cnt": 88, "fail": 0 } ]
}
```
- 모든 summary/cnt/fail 필드는 정수. `cached_at` unix seconds.
- 에러: 500 (`Error!: {message}` — legacy PDOException echo). 프런트는 표준 에러 처리.
- **백엔드 책임**: 크로스DB 집계·세션 캐시·refresh 강제 갱신·distinct m_no·failed IN(1,4) 계산.

## 타겟 매핑
- 라우트:
  - `/member/dashboard_crm` (`routes/member/dashboard_crm.tsx`)
- entities: `entities/member-dashboard` (신규) — `fetchMemberDashboard`(refresh 파라미터) + `useMemberDashboard` + `MemberDashboard` 타입.
- screen: `screens/member-dashboard` — 실데이터 렌더, `pct` 로컬 헬퍼(`(n,d)=>d>0?round1(n/d*100):0`), `cached_at` HH:MM 포맷.
- 사이드바: `widgets/sidebar` — `MEMBER_SIDE_NAV`(신규) + `resolveSideNav` `/member` 분기(expandAll: true).
- mock: `shared/mocks/handlers/member-dashboard.ts` (신규) + `handlers.ts` 등록. 고정 payload(legacy 실데이터 형태 재현).
- topbar: 기존 member 엔트리(`/member/dashboard_crm`) 이미 존재 — 재사용.

## Parity 체크리스트
- [ ] 사이드바 트리(대시보드+3그룹, 라벨/링크/아이콘/expandAll) 일치, 주석 dead 미노출
- [ ] page-title(기준시각·새로고침·h4) 일치
- [ ] 1 회원현황 4카드(값/색상/border) 일치
- [ ] 2 신규가입 table·등급/유형 분포 막대(pct)·SNS(sns_max 스케일·빈 메시지) 일치
- [ ] 4 활동성 5카드(값/색상) 일치
- [ ] 6 자동메일 요약+구분별 table(gubun 라벨 매핑·실패율·빈 메시지) 일치
- [ ] quirk("어제부터" vs "최근 30일" 라벨) 원문 유지
- [ ] refresh 버튼 재요청 동작
