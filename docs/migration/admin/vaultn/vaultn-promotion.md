# Vaultn - 프로모션 현황 (promotion, DB)

## 원본
- 파일: `pc/_Admin_/goods/vaultn/vaultn_promotion.php` (라이브)
- 데이터: `AdminGoods::getVaultnPromotionList($page, $add_where, $orderby, $param)`
- SQL: `select a.*, b.title as product_name, b.srp, b.purchasePrice from vaultn_promotion a inner join vaultn_catalogue b on a.sku=b.sku where b.currencyCode='KRW' and b.srp>0 order by validFrom desc, validTo desc` — **50/page**

## 화면·플로우
- 진입 URL: `/goods/vaultn/vaultn_promotion?page` (사이드바 외)
- page_title `Valutn 프로모션 현황`(breadcrumb active + h4)
- "N 개"(total_results) + card(h5 `Vaultn Product`) > table 9컬럼
- 컬럼: No / promotion name(title) / validFrom / validTo / product(product_name)+(sku) / discountPercentage / discountSrp=`round(srp*(1-disc/100))`+(srp) / discountPurchasePrice=`purchasePrice*(1-disc/100)`(2자리)+(purchasePrice 2자리) / 비고=reg_date+(update_date)
- **legacy 버그 이식**: No 계산이 `total_results-(num+(page-1)*30)` — 페이지 크기는 50인데 오프셋 배수는 30 하드코딩. 그대로 보존.
- ServerPagination(links_html, 50/page). 필터 없음(param 빈 문자열).

## API 계약 (백엔드 전달)
### `GET /admin/vaultn/promotions`
- 쿼리: `page` (50/page)
- 응답 `200`: `{ items: [{ title, validFrom, validTo, product_name, sku, discountPercentage, srp, purchasePrice, reg_date, update_date }], pagination: { current_page, results_per_page, total_results, total_pages } }`
- 백엔드 책임: 위 SQL. 계산(discountSrp/discountPurchasePrice)·번호는 프론트.

## 타겟 매핑
- 라우트: `routes/goods/vaultn/vaultn_promotion.tsx`
- screens: `vaultn-promotion` / entities: `vaultn`(promotions) / mock: `handlers/vaultn` / `shared/ui/ServerPagination`

## Parity 체크리스트
- [ ] 9컬럼 · 할인가 계산(0자리/2자리) · No 오프셋 30 버그 보존 · ServerPagination 50/page
