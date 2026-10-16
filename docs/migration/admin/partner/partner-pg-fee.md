# 파트너 PG수수료 관리

> P2 파트너·정산 세 번째 단위. 파트너별 PG 수수료율(Account/Credit Card/Mobile Payment, %) 목록·인라인 수정·삭제 + 등록 모달. 이 수수료율은 리포트 생성(report_register) 시 결제수수료 기본값으로 사용.

## 원본
- 파일: `pc/_Admin_/partner/partner_pg_fee.php` + `partner_pg_fee_ps.php`(register/modify/delete/select)
- 데이터: `AdminPartner::getPartnerPGFeeList()`, `getNonPgfeePartner()`
- 참조: `docs/legacy-admin/70-partner-code-china.md`, `../legacy-project/docs/PARTNER-SETTLEMENT.md`

## 화면·플로우
- 진입 URL: `/partner/partner_pg_fee` — GET `page`, `search_publisher_name`(LIKE `b.publisher_name`)
- breadcrumb: 홈/파트너/파트너 관리/**파트너 PG수수료 관리**. h4 동일.
- 검색필터 카드(header `bg-secondary` "파트너 검색필터"): 파트너 이름 text(placeholder "파트너 이름") + 검색 button. (단일 필터, radio 없음)
- 상단 바: `{number_format(total)} 개` + `파트너 PG 수수료 등록` button(btn-danger, #partner-pg-modal)
- 테이블(`<form class="align-items-center">`로 감쌈, colgroup 5/*/10/10/10/5/5):
  - 7컬럼: 번호 / 파트너정보(publisher_name) / **Account**(input `account[]` + `%`) / **Credit Card**(input `credit_card[]` + `%`) / **Mobile Payment**(input `mobile_payment[]` + `%`) / 수정(btn_modify data-idx=publisher_code) / 삭제(btn_delete data-idx=publisher_code)
  - **인라인 편집 인풋**: 각 행의 3개 수수료 값이 텍스트 인풋(초기값=DB값). 수정 버튼은 해당 행 인풋값을 읽어 update.
- 정렬: `b.publisher_name asc` / **30/page**
- **행 번호(quirk 없음)**: `total - (num + (page-1)*30)` — 오프셋 30 = 페이지크기 30 일치(partner_list/partner_code의 20/50 버그와 달리 정상).
- 서버 페이지네이션(links_html → ServerPagination)

### 모달·인터랙션 (모두 AJAX, 응답 plain text → `alert(data)`)
- **등록 모달**(#partner-pg-modal): 파트너 select(`getNonPgfeePartner`=수수료 미등록 파트너, legacy select2 → native), Account/Credit Card/Mobile Payment text 인풋. `btn_pg_fee_add` → mode=`register` {publisher_code, account, credit_card, mobile_payment} → `alert(data)` + **`location.reload()`**(목록+후보 invalidate).
- **수정**(btn_modify): 행 인풋값 읽어 mode=`modify` {publisher_code, account, credit_card, mobile_payment} → `alert(data)` + **reload 없음(주석)** → 인라인 인풋이 이미 새 값 보유.
- **삭제**(btn_delete): mode=`delete` {publisher_code} → `alert(data)` + **`location.reload()`**(invalidate).
- **select** mode: `{account,credit_card,mobile_payment}` JSON 반환하나 **화면 JS에서 미호출(dead)** — 계약엔 기록, 프론트 미구현.
- 세션/권한: `$_SESSION['admin']` 가드(공통). admin_level 서버차단 없음.

### 레거시 quirk
- **`print_r($_POST)` 디버그 출력**: ps 상단에 `print_r($_POST)`가 있어 register/modify/delete 응답이 POST 덤프 + 메시지로 반환됨(alert에 노출). **china/genba 선례대로 디버그 아티팩트는 미재현**(clean `{message}` 계약) — 게이트에서 개발자 확인 대상.
- fee sanitize: publisher_code=INT, account/credit_card/mobile_payment=FLOAT(소수 허용).

## 데이터 (legacy)
- `getPartnerPGFeeList($page,$add_where,$orderby,$param,'30')`:
  ```sql
  select a.*,b.publisher_name from directgames.tbl_pg_fee a
  inner join tbl_partner b on a.publisher_code=b.publisher_code
  where b.publisher_code>0 [add_where] order by b.publisher_name asc
  -- 컬럼: publisher_code, account, credit_card, mobile_payment, publisher_name
  ```
- `getNonPgfeePartner()`:
  ```sql
  select a.publisher_code,a.publisher_name from tbl_partner a
  where NOT EXISTS (select b.publisher_code from directgames.tbl_pg_fee b where a.publisher_code=b.publisher_code)
  order by a.publisher_name asc
  ```
- `partner_pg_fee_ps.php`:
  - register: `insert into tbl_pg_fee set publisher_code,account,credit_card,mobile_payment,reg_date=now()` → "등록되었습니다."
  - modify: `update tbl_pg_fee set account,credit_card,mobile_payment where publisher_code` → "수정되었습니다."
  - delete: `delete from tbl_pg_fee where publisher_code` → "삭제되었습니다."
  - select(dead): `select account,credit_card,mobile_payment where publisher_code` → JSON

## API 계약 (백엔드 전달)
- `GET /admin/partner/pg-fees` — query page/search_publisher_name → `{ items: [{publisher_code, publisher_name, account, credit_card, mobile_payment}], pagination }`. 정렬 b.publisher_name asc, 30/page.
- `GET /admin/partner/pg-fees/candidates` — 수수료 미등록 파트너 → `[{publisher_code, publisher_name}]`(publisher_name asc).
- `POST /admin/partner/pg-fees` — body {publisher_code, account, credit_card, mobile_payment} → `{ message: "등록되었습니다." }`. tbl_pg_fee insert(reg_date=now).
- `POST /admin/partner/pg-fees/modify` — body {publisher_code, account, credit_card, mobile_payment} → `{ message: "수정되었습니다." }`.
- `POST /admin/partner/pg-fees/delete` — body {publisher_code} → `{ message: "삭제되었습니다." }`.
- (참고, 프론트 미사용) `select` → 단건 fee JSON. 백엔드 유지.
- 백엔드 책임: publisher_code INT·fee FLOAT sanitize. 응답 plain text는 `{message}` JSON 계약(print_r 디버그 미포함).

## 타겟 매핑
- 라우트: `/partner/partner_pg_fee` (`routes/partner/partner_pg_fee.tsx`)
- screens: `screens/partner-pg-fee`
- entities: `entities/partner` 확장(pg-fee list/candidates/register/modify/delete)
- mock: `shared/mocks/handlers/partner.ts` 확장(가변 fixture)

## Parity 체크리스트
- [ ] 검색필터(파트너명 text, placeholder "파트너 이름")
- [ ] 상단 `{n} 개` + PG 수수료 등록(btn-danger)
- [ ] 7컬럼·인라인 편집 인풋 3종(+% suffix)·수정/삭제 버튼
- [ ] 등록 모달(후보 select·3 인풋) → alert + reload
- [ ] 수정 → alert·**reload 없음**·인풋 값 유지
- [ ] 삭제 → alert + reload
- [ ] 행번호 offset 30·b.publisher_name asc·30/page
- [ ] (확인) print_r 디버그 미재현 결정
