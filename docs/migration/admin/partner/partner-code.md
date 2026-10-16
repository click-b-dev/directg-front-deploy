# 파트너 현황 (파트너 코드 관리)

> P2 파트너·정산 두 번째 단위. 사이드바 "파트너 현황" 링크 → `partner_code.php`(page_title "파트너 코드 관리"). 파트너 마스터(`tbl_partner`) 목록 + 검색필터 + 추가/수정 모달 + is_system 토글.

## 원본
- 파일: `pc/_Admin_/partner/partner_code.php` + `partner_ps.php`(mode partner_add/partner_config/partner_report_config)
- 데이터: `AdminPartner::getPartnerList()`, `getSupplierList()`
- 참조: `docs/legacy-admin/70-partner-code-china.md`, `../legacy-project/docs/PARTNER-SETTLEMENT.md`

## 화면·플로우
- 진입 URL: `/partner/partner_code` — GET `page`, `search_publisher_name`(LIKE), `report_term`(M/T 등호), `is_system`(Y/N 등호)
- breadcrumb: 홈/파트너/파트너 관리/**파트너 코드 관리**(page_title). h4 동일.
- **검색필터 카드**(`card`, header `bg-secondary text-white` "파트너 검색필터"): GET form
  - 파트너 이름 text(`search_publisher_name`, placeholder="상품명" quirk 이식)
  - 리포트 주기 radio(M 월별 / T 분기별, checked 상태 GET 반영)
  - 파트너 시스템 사용 radio(Y 사용 / N 미사용, checked 반영)
  - 검색 button(btn-primary)
- 상단 바: 좌 `{number_format(total)} 개`, 우 `파트너 추가` button(btn-danger, 추가 모달 오픈)
- 테이블 5컬럼(`table-sm table-bordered border-light`, thead `table-light`):
  - 번호 / 파트너 정보(`[publisher_code] publisher_name`, text-start) / 리포트 주기(`M`→월별, else→분기별) / 파트너 시스템 사용(**체크박스 스위치** `data-switch="primary"`, checked=is_system=="Y") / 수정(btn `mdi-square-edit-outline`, data-publishercode/name/term)
- 정렬: `publisher_name asc` / 50/page
- **행 번호 quirk(그대로 이관)**: `total - (num + (page-1)*20)` — 50/page인데 오프셋 20(partner_list와 동일 버그).
- 서버 페이지네이션(links_html → ServerPagination)

### 모달·인터랙션 (모두 AJAX, 응답은 plain text → `alert(data)`)
- **추가 모달**(#partner-modal): 파트너 select(`getSupplierList`=tbl_partner 미등록 공급처, legacy select2 → native select), 리포트 주기 radio M/T. `파트너 등록` 버튼 → `partner_ps.php` mode=`partner_add` {publisher_code, publisher_name, report_term} → `alert(data)` + **`window.location.reload()`**(목록 invalidate).
- **수정 모달**(#partner-modify-modal): 파트너명(plaintext), 리포트 주기 radio. `파트너 설정 저장` 버튼 → mode=`partner_report_config` {publisher_code, report_term} → alert + reload.
- **is_system 토글**(행 스위치 change): mode=`partner_config` {publisher_code, is_system Y/N} → `alert(data)` + **reload 없음(주석, quirk)** → 체크 상태는 로컬 유지, 목록 미갱신.
- 세션/권한: `$_SESSION['admin']` 가드(공통). admin_level 서버차단 없음.

## 데이터 (legacy)
- `getPartnerList($page,$add_where,$orderby,$param,'50')`:
  ```sql
  select * from tbl_partner where publisher_code>0 [add_where] order by publisher_name asc
  -- 컬럼: publisher_code, publisher_name, report_term, is_system, flag
  -- add_where: and publisher_name like '%v%' / and report_term='v' / and is_system='v'
  ```
- `getSupplierList()`:
  ```sql
  select a.publisher_code,a.publisher_name from tbl_publisher a
  where NOT EXISTS (select b.publisher_code from tbl_partner b where a.publisher_code=b.publisher_code)
  order by a.publisher_name asc
  ```
- `partner_ps.php`:
  - partner_add: `insert into tbl_partner set publisher_code,publisher_name,report_term,flag='Y'` → "등록되었습니다."
  - partner_config: `update tbl_partner set is_system where publisher_code` → "수정되었습니다."
  - partner_report_config: `update tbl_partner set report_term where publisher_code` → "수정되었습니다."

## API 계약 (백엔드 전달)
- `GET /admin/partner/partners` — query page/search_publisher_name/report_term/is_system → `{ items: [{publisher_code, publisher_name, report_term, is_system}], pagination }`. 정렬 publisher_name asc, 50/page.
- `GET /admin/partner/suppliers` — 미등록 공급처 목록 → `[{publisher_code, publisher_name}]`(publisher_name asc).
- `POST /admin/partner/partners` — body {publisher_code, publisher_name, report_term} → `{ message: "등록되었습니다." }`. 백엔드: tbl_partner insert(flag='Y').
- `POST /admin/partner/partners/system` — body {publisher_code, is_system} → `{ message: "수정되었습니다." }`. tbl_partner is_system update.
- `POST /admin/partner/partners/report-term` — body {publisher_code, report_term} → `{ message: "수정되었습니다." }`. tbl_partner report_term update.
- 응답은 legacy 원문이 plain text이나 china/genba 선례대로 `{message}` JSON으로 계약(alert 내용 동일).

## 타겟 매핑
- 라우트: `/partner/partner_code` (`routes/partner/partner_code.tsx`)
- screens: `screens/partner-code`
- entities: `entities/partner` 확장(list/suppliers/add/config/report-term)
- mock: `shared/mocks/handlers/partner.ts` 확장(가변 fixture로 add/toggle 반영)

## Parity 체크리스트
- [ ] 검색필터 카드(파트너명 text·리포트주기 radio·시스템사용 radio·검색), placeholder "상품명" quirk
- [ ] 상단 `{n} 개` + 파트너 추가(btn-danger)
- [ ] 5컬럼·파트너정보 `[code] name`·리포트주기 라벨·스위치·수정 버튼
- [ ] 추가 모달(공급처 select·주기 radio) → alert + reload
- [ ] 수정 모달(파트너명 plaintext·주기 radio) → alert + reload
- [ ] is_system 토글 → alert·**reload 없음**·로컬 상태 유지
- [ ] 행 번호 quirk(offset 20, 50/page)·publisher_name asc
