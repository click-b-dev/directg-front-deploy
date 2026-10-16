# 리포트 생성

> P2 파트너·정산 일곱 번째 단위(리포트 관리 그룹 3/4). **파트너 영역 최대 화면**(26.9K). 정산 리포트 미리보기(16컬럼, 정산 계산 로직) + 리포트 생성(tbl_report insert) + 동기화 2종 + 행 수정. 정산 정확성(SRP·rate·PG fee·VAT·revenue share·royalty)이 핵심.

## 원본
- 파일: `pc/_Admin_/partner/report_register.php` (라이브 — 사이드바 리포트 관리 그룹 "리포트 생성")
- 처리: `report_ps.php` `mode=report_register`(생성)·`report_batch`/`refund_batch`(동기화)·`revenue_edit`(행 수정)
- 데이터: `AdminPartner::setPartnerReport()`, `getPartnerPGFee()`, `getPartnerListAll('')`
- 참조: `../legacy-project/docs/PARTNER-SETTLEMENT.md`

## 화면·플로우
- 진입 URL: `/partner/report_register` — GET(미리보기 = GET submit). 파라미터: `currency_converter`, `account_fee`, `card_fee`, `mobile_fee`, `royalty`, `royalty_info`, `search_year`, `search_month`, `publisher_code`, `search_report_term`(M/T), `search_month_term`(분기 1~4).
- **기본값 로직**(sales/refund와 다름):
  - `search_year` 없으면 `date("Y")`, `search_flag=false`(있으면 true).
  - `search_month`/`search_month_term` 둘 다 없으면 `search_month`=전월. **전월=="12" && !search_flag → `search_year -= 1`**(연도 보정, search_flag 조건 추가 — refund보다 조건 하나 더).
  - `search_report_term` 없으면 "M"(월별).
  - report_term=="T"면 `search_month = search_month_term`.
  - 월별(M): `search_date=year-month`, sales_where=`ord_ymd between start~말일`, refund_where=`date_format(canceldt,'%Y-%m')=search_date`.
  - 분기별(T): search_month_term 없으면 `ceil(현재월/3)`(현재 분기). sales_where=`year(ord_ymd)+QUARTER(ord_ymd)`, refund_where=`year(canceldt)+QUARTER(canceldt)`.
- **동기화 버튼 표시**: `report_term=="M" && publisher_code && year && month` → Sales/Refund 동기화 버튼 노출. **분기별이면 숨김**.
- breadcrumb: 홈/파트너/리포트 관리/**리포트 생성**.

### 검색필터 카드
- 리포트 주기 radio(월별 M / 분기별 T)
- 기간검색: year select(**2020**~현재) + month radio(1~12, `#choice_month`) + month_term radio(1~4분기, `#choice_month_term`, 기본 `display:none`). **JS로 주기에 따라 토글**.
- 파트너 select — **옵션 라벨 `{publisher_name} / {Quarterly|Monthly}`**(report_term 파생).
- 환율설정: `currency_converter` select(USD/EUR/JPY, "KRW 1 => X") + `royalty` input(환율값).
- 환율기준참조: `royalty_info` input.
- 결제수수료: `account_fee` / `card_fee` / `mobile_fee` input(%).
- "리포트 미리보기" submit(btn-secondary).

### 데이터 (publisher_code 있을 때만)
- `setPartnerReport(publisher_code, report_term, sales_where, refund_where)` → 정산 raw. publisher 12/14/86은 **DB만 다른**(`tbl_sales_publisher` vs `dgkrshop.tbl_sales_publisher`) 특수 케이스, 로직 동일.
  - 판매(status '2', +qty) union all 환불(status '9', -qty). settlekind 매핑(SC0010→Credit, SC0030/40→Account, SC0060→Mobile, DG0000→Account, POINT→Credit, PAYCO→Credit, samsung→Mobile, toss_bank/pay→Account 등). `tbl_goods_item` join(product_name_en, product_srp, product_ppr, product_rs, product_platform), `tbl_platform` join(platform). group by product_code, settlekind, order_srp. **order by product_name_en asc, order_srp desc, settlekind asc, status asc**.
  - 결과 컬럼: product_code, product_nm, order_srp, publisher_code, settlekind(Account/Credit/Mobile), price, ord_ymd, status('2'/'9'), cc, sum_settleprice, product_name_en, product_srp, product_ppr, product_rs, platform, product_platform.
- `getPartnerPGFee(publisher_code)` → `tbl_pg_fee` 단건 {account, credit_card, mobile_payment}. **truthy면 폼 account_fee/card_fee/mobile_fee를 override**(URL/사용자 값보다 우선).
- `getPartnerListAll('')` → 파트너 select(전체).

### 정산 계산 로직 (legacy PHP, 프론트에서 재현)
행마다 (settlekind별 fee = Account→account_fee, Credit→card_fee, Mobile→mobile_fee):
```
gross_sales_in_vat = sum_settleprice
gross_sales_ex_vat = round(in_vat / 1.1)
payment_fee        = round(ex_vat / 100 * fee)
net_sales          = ex_vat - payment_fee
// rate / product_name
if (product_srp == order_srp) { product_name = product_name_en; rate = "0"; }
else if (product_srp > 0)     { rate = round((product_srp-order_srp)*100/product_srp); product_name = product_name_en + "_" + rate; }
// 환불행 색상
text_class = (status == '9') ? 'text-danger' : ''
// revenue share
if (product_rs == "0") revenue_share = cc * (int)product_ppr * (1 - (int)rate/100)
else                   revenue_share = round(net_sales / 100 * product_rs)
```
- tfoot 합계: cc / in_vat / ex_vat / payment_fee / net_sales / revenue_share 합계. **Royalty payable({currency}) = round2(sum_revenue_share * royalty)**. (심볼 `$current_bul`은 **미정의 변수 → 빈값** quirk, 그대로 이식)
- **round 주의**: PHP `round(x,0)`은 상용 반올림. JS `Math.round`는 음수 `.5`에서 다름(PHP round(-0.5)=-1 vs JS 0). 환불행 음수 금액 시 미세 차이 가능 → `Math.round` 사용하되 게이트 확인 대상. `(int)`는 정수부 truncate(`Math.trunc`).

### 테이블 (16컬럼, `#excelData`/`#listTable`)
ITEM_ID(product_code) / Product(product_name_en) / **Balence(%) input**(빈값) / rate / Payment Gateway(settlekind) / **Publisher SRP input**(product_srp) / Sales Price(price) / **Publisher Price input**(order_srp) / Gross Units Sold(cc) / Gross Sales in VAT / Gross Sales ex VAT / Payment Gateway FEE / Net Sales / **Revenue(%) input**(product_rs) / Revenue Share / **Edit 버튼**. 환불행은 text-danger.
- hidden: platform_code[], goods_ppr[].

### 인터랙션
- **리포트 주기 radio**: `#choice_month`/`#choice_month_term` 토글(JS).
- **미리보기**: GET submit → 재조회(setPartnerReport).
- **리포트 생성**(`#btn_report`): `#listTable` 각 행을 listArray로 수집(product_code, product_nm_en, platform_code, balence, rate, payment_gateway, publisher_srp[goods_srp uncomma], sales_price, publisher_price[order_srp], product_cost[goods_ppr], gross_units_sold, gross_sales_in_vat, gross_sales_ex_vat, payment_gateway_fee, net_sales, revenue, revenue_share) → POST `report_ps.php` {mode:report_register, ...폼값, report_data(JSON), report_term, search_month(=report_month)}. tbl_report_config(ON DUP UPDATE) + tbl_report(delete+insert) → `go(report_list.php)`.
  - report_data는 `"`+JSON.stringify+`"`로 감싼 문자열(ps에서 substr로 벗김) — 계약은 clean JSON 배열.
- **Sales/Refund 동기화**(`#btn_sales_sync`/`#btn_refund_sync`): 파트너 미선택 alert("파트너를..."/"퍼블리셔를..."). POST report_batch/refund_batch → **`location.reload()`**(sales_list와 달리 reload).
- **행 수정**(`.btn_edit`): {mode:revenue_edit, product_code, revenue, goods_srp[uncomma], publisher_price[order_srp uncomma], sales_price} → `update tbl_goods_item set product_rs, product_srp` → reload.
- 세션/권한: `$_SESSION['admin']` 가드.

## API 계약 (백엔드 전달)
- `GET /admin/partner/report/preview` — query {publisher_code, report_term(M/T), year, month} → `{ items: [{product_code, product_nm, product_name_en, order_srp, settlekind, price, status, cc, sum_settleprice, product_srp, product_ppr, product_rs, platform, product_platform}], pg_fee: {account, credit_card, mobile_payment} | null }`. 정렬 product_name_en asc/order_srp desc/settlekind asc/status asc. publisher_code 없으면 빈 items·pg_fee null. 백엔드: settlekind 매핑·판매/환불 union·goods_item/platform join·publisher 12/14/86 DB 분기.
- `GET /admin/partner/list-all` — (#258 정의, 재사용).
- `POST /admin/partner/report` — body {publisher_code, report_term, currency_converter, account_fee, card_fee, mobile_fee, royalty, royalty_info, search_year, search_month, report_data:[행 배열]} → `{ message }`. tbl_report_config ON DUP UPDATE + tbl_report delete+insert. 성공 후 프론트 report_list 이동.
- `POST /admin/partner/sales-list/sync`·`refund-list/sync` — (#258/#259 재사용).
- `POST /admin/partner/report/revenue-edit` — body {product_code, revenue, goods_srp, publisher_price, sales_price} → `{ message }`. tbl_goods_item product_rs/product_srp update.
- 백엔드 책임: 정산 raw 조회, 리포트 저장, goods_item 수정. **정산 계산(VAT/fee/revenue share)은 프론트 재현**(legacy PHP와 동일 렌더 시 계산).

## 타겟 매핑
- 라우트: `/partner/report_register` (`routes/partner/report_register.tsx`)
- screens: `screens/partner-report-register` (+ 계산 유틸 `lib/`)
- entities: `entities/partner` 확장(report preview/pg-fee 단건/report 생성/revenue-edit; list-all·sales/refund sync 재사용)
- mock: `handlers/partner.ts` 확장(report fixture + pg_fee + mutations)

## 의도적 parity 판단 (게이트 승인 대상)
- **정산 계산 프론트 재현**(legacy PHP 계산식 그대로). round는 `Math.round`(음수 `.5` 미세차 가능 — 확인 대상), `(int)`=`Math.trunc`.
- **엑셀 버튼 없음**(이 화면엔 미리보기/생성만).
- **동기화는 reload**(sales_list와 달리 legacy가 location.reload). React는 preview 목록 invalidate.
- **리포트 생성/행수정/동기화 = 백엔드 mutation**. mock은 흐름만, 실제 저장/프로시저는 백엔드.
- `$current_bul` 미정의(빈값) 그대로.
- **PG fee override**: 조회 시 pg_fee truthy면 결제수수료 폼값 덮어씀(사용자 입력보다 우선) — legacy quirk 이식.

## Parity 체크리스트
- [ ] 기본값(연/전월·전월12+search_flag=false시 연도-1·주기 M 기본)
- [ ] 리포트 주기 토글(월 radio ↔ 분기 radio)
- [ ] 파트너 옵션 라벨 `{name} / {Quarterly|Monthly}`
- [ ] 환율/수수료 폼·PG fee override
- [ ] 16컬럼·정산 계산(VAT/fee/net/rate/revenue share)·환불행 text-danger
- [ ] tfoot 합계·Royalty payable(=share*royalty round2)
- [ ] 미리보기 GET·동기화 버튼 조건부 노출(M+선택 시)·reload
- [ ] 리포트 생성(행 수집→POST→report_list 이동)
- [ ] 행 수정(revenue_edit→reload)
