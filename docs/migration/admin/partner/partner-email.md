# 파트너 알림 주소록 관리

> P2 파트너·정산 네 번째 단위. 파트너별 알림 이메일 주소록 목록. **legacy 미완성 화면** — 목록 표시만 실제 동작하고 등록/수정/삭제 UI는 모두 죽어있다(핸들러 없음, `partner_email_ps.php`는 0B 빈 파일).

## 원본
- 파일: `pc/_Admin_/partner/partner_email.php` (라이브 — `yjs_`/`kdy_`/날짜접미 변형 없음, 사이드바 `sidebar_partner.php` "파트너 알림 주소록 관리" 링크 대상)
- 처리: `pc/_Admin_/partner/partner_email_ps.php` — **0B 빈 파일**(등록 버튼이 죽어있어 호출되지 않음)
- 데이터: `AdminPartner::getPartnerNotificationEmail()`, `getNonEmailPartner()`
- 참조: `docs/legacy-admin/70-partner-code-china.md`, `../legacy-project/docs/PARTNER-SETTLEMENT.md`

## 화면·플로우
- 진입 URL: `/partner/partner_email` — GET `page`만. **검색필터 없음**(partner_pg_fee와 달리 검색폼 UI 자체가 없음).
- breadcrumb: 홈/파트너/파트너 관리/**파트너 알림 주소록 관리**. h4 동일.
- 상단 바: `{number_format(total)} 개` + **"파트너 일림 주소록 등록"** button(btn-danger, `#partner-email-modal` 트리거)
  - **오타 "일림"**(알림 아님) — legacy 그대로 이식.
- 테이블(`<form class="align-items-center">`로 감쌈, colgroup 10/30/*/10/10, `table w-100`):
  - **5컬럼**: 번호 / 파트너정보(publisher_name) / 알림이메일 주소(`<textarea name="email[]" rows="4">` — `json_decode(email)` 배열을 줄바꿈으로 출력) / 수정 / 삭제
  - **행 번호(quirk 없음)**: `total-(num+(page-1)*20)` — offset 20 = 페이지크기 20 일치(정상).
- 정렬: `b.publisher_name asc` / **20/page**
- 서버 페이지네이션(links_html → ServerPagination)

### 죽은 UI (legacy 미완성 — 그대로 이식, 동작 없음)
- **수정 버튼**(`<button class="btn action-icon">`): `btn_modify` 클래스·data-idx 없음, **JS 바인딩 없음** → 클릭해도 아무 동작 없음.
- **삭제 버튼**(동일): 핸들러 없음 → 동작 없음.
- **textarea `email[]`**: 편집 가능하나 저장 수단 없음(수정 버튼 죽음).
- **등록 모달**(`#partner-email-modal`): `data-bs-toggle`로 **열리기는 함**.
  - 파트너 select(`getNonEmailPartner`=이메일 미등록 파트너, select2 → native), 알림이메일 textarea(`partner_email`).
  - 등록 버튼: `id="btn_pg_fee_add"`, **type=button**, 텍스트 **"파트너 PG 수수료 등록"**(복붙 오타). **클릭 핸들러 없음**(JS는 select2 초기화만) → 등록 불가.
  - form `action="partner_pg_fee_ps.php"`(복붙 실수 — pg_fee ps 가리킴), `mode=register` hidden. **submit도 안 됨**(버튼 type=button).
- **실제 동작하는 것**: 목록 조회 + 등록 모달 select 후보 조회(`getNonEmailPartner`)뿐.
- 세션/권한: `$_SESSION['admin']` 가드(공통). admin_level 서버차단 없음.

### 레거시 quirk 요약
- `partner_email_ps.php` 0B(빈 파일) — 등록/수정/삭제 백엔드 미구현.
- 상단 버튼 오타 "일림", 모달 버튼 텍스트 "파트너 PG 수수료 등록", 모달 form action이 pg_fee ps — 모두 복붙 잔재. **그대로 이식**.
- `$add_where`/`$param` 미초기화(검색 없어 빈 값) — 목록 SQL에 영향 없음.

## 데이터 (legacy)
- `getPartnerNotificationEmail($page,$add_where,$orderby,$param,'20')`:
  ```sql
  select a.*, b.publisher_name
  from directgames.tbl_publisher_email a
  inner join tbl_partner b on a.publisher_code = b.publisher_code
  where b.publisher_code > 0 [add_where]
  order by b.publisher_name asc
  -- a.* = tbl_publisher_email(publisher_code, email(JSON 배열 문자열), ...)
  -- 화면 사용 컬럼: publisher_name, email
  ```
  - `email` 컬럼은 JSON 배열 문자열(예: `["a@x.com","b@y.com"]`). 화면은 `json_decode` 후 각 요소를 `\n`으로 join해 textarea에 표시.
- `getNonEmailPartner()`:
  ```sql
  select a.publisher_code, a.publisher_name from tbl_partner a
  where NOT EXISTS (select b.publisher_code from directgames.tbl_publisher_email b where a.publisher_code=b.publisher_code)
  order by a.publisher_name asc
  ```

## API 계약 (백엔드 전달)
- `GET /admin/partner/notification-emails` — query `page` → `{ items: [{publisher_code, publisher_name, email: string[]}], pagination }`. 정렬 `b.publisher_name asc`, 20/page. **email은 백엔드가 JSON 파싱해 문자열 배열로 반환**(legacy `json_decode` 동작을 계약으로).
- `GET /admin/partner/notification-emails/candidates` — 이메일 미등록 파트너 → `[{publisher_code, publisher_name}]`(publisher_name asc). 등록 모달 select 채우기용.
- **등록/수정/삭제: 계약 없음.** legacy가 미완성(dead UI + `partner_email_ps.php` 0B)이라 프론트에서 호출하는 mutation이 없다. 추후 기능을 완성할 경우 별도 계약으로 신규 정의(현 이관 범위 밖 — 동작 동일성 원칙상 죽은 UI를 그대로 이식).
- 백엔드 책임: `tbl_publisher_email.email` JSON 배열 파싱. `b.publisher_code>0` 필터.

## 타겟 매핑
- 라우트: `/partner/partner_email` (`routes/partner/partner_email.tsx`)
- screens: `screens/partner-email`
- entities: `entities/partner` 확장(notification-email list/candidates — **읽기 전용, mutation 없음**)
- mock: `shared/mocks/handlers/partner.ts` 확장(고정 fixture — 등록/수정/삭제 없어 가변 불필요)

## Parity 체크리스트
- [ ] breadcrumb/제목 "파트너 알림 주소록 관리"
- [ ] 상단 `{n} 개` + **"파트너 일림 주소록 등록"**(오타 "일림", btn-danger)
- [ ] 5컬럼·textarea rows=4(이메일 배열 줄바꿈 표시)·수정/삭제 버튼(죽은 UI)
- [ ] 검색필터 없음
- [ ] 등록 모달: 열림·후보 select·textarea·**등록 버튼 동작 없음**·버튼 텍스트 "파트너 PG 수수료 등록"
- [ ] 수정/삭제 버튼 클릭 시 동작 없음
- [ ] 행번호 offset 20·b.publisher_name asc·20/page
- [ ] (확인) 죽은 UI(등록/수정/삭제 무동작) + 오타 그대로 이식 결정
