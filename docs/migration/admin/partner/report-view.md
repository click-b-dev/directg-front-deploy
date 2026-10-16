# 리포트 상세보기

> P2 파트너·정산 아홉 번째 단위(리포트 관리 그룹 상세). 생성된 리포트(tbl_report_config + tbl_report) read-only 상세. **#261 리포트 내역의 상세보기 링크 대상**. Invoice 형태(정산 설정 요약 + 12컬럼 상세 + Royalty Payable).

## 원본
- 파일: `pc/_Admin_/partner/report_view.php` (라이브 — report_list 상세보기 `report_view.php?idx=` 진입)
- 데이터: `AdminPartner::getPartnerReportInfo()`, `getPartnerReportData()`
- 참조: `../legacy-project/docs/PARTNER-SETTLEMENT.md`

## 화면·플로우 (read-only)
- 진입 URL: `/partner/report_view?idx=` — GET `idx`(리포트 config idx).
- breadcrumb: 홈/파트너/리포트 관리/**리포트 상세보기**.
- 카드(Invoice 레이아웃):
  - 헤더: **"Product Statistics - {publisher}"**(publisher=tbl_publisher.publisher).
  - 좌측 리스트: Period / Royalty: `KRW 1-> {currency_converter} {royalty} ({royalty_info})` / Default currency: KRW / Revenue Share: (빈값) / Payment Gateway Fee: `Bank Transfer - {account_fee}%, Credit Card - {card_fee}%, Mobile Payment - {mobile_fee}%`.
    - **Period**: 월별 → `{year}.{month}.01~{month}.{말일}`. 분기별 → `{year}Q{month} ({분기범위})`. 분기범위 맵: 1=`01.01~03.31`, 2=`04.01~06.30`, 3=`07.01~09.30`, **4=`010.01~12.31`(오타 010, 그대로 이식)**.
  - 우측: **알림메일발송 버튼**(`#btn_email_notice`, data-idx/publisher/year/month) + 리포트 생성일(reg_date)/수정일(update_date)/알림메일 발송일(notice_date)/승인일(approval_date)/진행상태(status **badge**).
- 12컬럼 테이블: Platform / Product(product_nm_en) / SRP(publisher_srp) / Rate(%) / Price(publisher_price) / **Product Cost**(rate=="0"→product_cost, else `product_cost*(1-rate/100)`) / Payment Gateway / Units Sold(gross_units_sold) / Gross Sales(gross_sales_ex_vat) / PG Fee(payment_gateway_fee) / Net Sales / Revenue Share.
  - **`$color`(gross_units_sold<0→text-danger) 계산은 있으나 td에 미적용 → dead(색상 없음)** 그대로 이식.
  - tfoot: 합계(units_sold, gross_sales_ex_vat, payment_gateway_fee, net_sales, revenue_share). colspan 7.
- **Royalty Payable**: `{currency_converter} number_format(sum_revenue_share * royalty, 2)`.
- 하단: **"목록가기"**(report_list.php 링크) / Print 버튼(주석 dead).

### 인터랙션
- **알림메일발송**(`#btn_email_notice`): **JS 핸들러 없음(dead)** — report_view.php에 `<script>` 블록 자체가 없음. 클릭 무동작. (report_ps.php에 `email_notice` case 있으나 이 화면에서 호출 안 됨). **버튼 렌더만, 무동작** 이식.
- **목록가기**: `report_list.php` 링크 → `/partner/report_list`.
- **Print**: 주석 처리(dead). 미이관.
- 세션/권한: `$_SESSION['admin']` 가드.

### 데이터 (legacy)
- `getPartnerReportInfo(idx)`:
  ```sql
  select a.publisher_code, a.currency_converter, a.account_fee, a.card_fee, a.mobile_fee,
         a.report_year, a.report_month, a.royalty, a.royalty_info, b.publisher,
         a.reg_date, a.update_date, a.status, a.idx, a.notice_date, a.approval_date, a.report_term
  from directgames.tbl_report_config a
  inner join directgames.tbl_publisher b on a.publisher_code = b.idx
  where a.idx = :idx
  ```
  - **status는 raw**(ready/notice/approval/transfer) — report_list(#261)와 달리 **한글 변환 없음**. badge에 raw 표시(quirk).
- `getPartnerReportData(idx)`:
  ```sql
  select a.product_code, a.product_nm_en, a.publisher_srp, a.rate, a.publisher_price, a.product_cost,
         sum(a.gross_units_sold) as gross_units_sold, sum(a.gross_sales_ex_vat) as gross_sales_ex_vat,
         sum(a.payment_gateway_fee) as payment_gateway_fee, sum(a.net_sales) as net_sales,
         sum(a.revenue_share) as revenue_share, c.platform, a.payment_gateway
  from directgames.tbl_report a
  inner join tbl_goods_item b on a.product_code=b.product_code
  inner join directgames.tbl_platform c on b.product_platform=c.idx
  where a.parent_idx = :idx
  group by a.product_code, a.publisher_price, a.payment_gateway
  order by a.product_nm_en asc, a.publisher_price desc, a.payment_gateway desc
  ```

## API 계약 (백엔드 전달)
- `GET /admin/partner/report/view` — query `idx` → `{ config: {...}, items: [...] }`.
  - config: {idx, publisher, publisher_code, currency_converter, account_fee, card_fee, mobile_fee, report_year, report_month, report_term, royalty, royalty_info, reg_date, update_date, notice_date, approval_date, **status(raw, 미변환)**}.
  - items: {product_code, product_nm_en, publisher_srp, rate, publisher_price, product_cost, gross_units_sold, gross_sales_ex_vat, payment_gateway_fee, net_sales, revenue_share, platform, payment_gateway}. 정렬 product_nm_en asc/publisher_price desc/payment_gateway desc.
- **알림메일발송은 계약 없음**(legacy dead — 핸들러 없음). report_ps.php email_notice는 미연결.
- 백엔드 책임: tbl_publisher.publisher(퍼블리셔명) join, tbl_report 집계.

## 타겟 매핑
- 라우트: `/partner/report_view` (`routes/partner/report_view.tsx`)
- screens: `screens/partner-report-view`
- entities: `entities/partner` 확장(report-view 조회)
- mock: `handlers/partner.ts` 확장(report view fixture)

## 의도적 parity 판단 (게이트 승인 대상)
- **알림메일발송 dead 버튼**(핸들러 없음) — 렌더만, 무동작. 그대로 이식.
- **status raw 표시**(report_list 한글과 대비, report_view는 미변환 quirk).
- **분기 Period "4" 오타(010.01)**·`$color` dead·Print 주석 dead — 그대로.
- **Product Cost 계산 프론트 재현**(rate=="0"→cost, else cost*(1-rate/100)).

## Parity 체크리스트
- [ ] Invoice 헤더/좌측 리스트(Period·Royalty·PG Fee)·Period 월/분기 포맷(4분기 010 오타)
- [ ] 우측 날짜/status badge(raw)·알림메일발송 버튼(dead)
- [ ] 12컬럼·Product Cost 계산·tfoot 합계
- [ ] Royalty Payable(sum_revenue_share*royalty round2)
- [ ] 목록가기 링크(report_list)·$color dead·Print dead
