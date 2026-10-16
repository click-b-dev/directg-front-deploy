# Genba 월별 주문현황 (#242)

> 통계 Genba 주문 분석 그룹 2번째. #241 자매(월 범위). Genba SKU별 주문·금액 집계(연/월 필터). 동기화 없음. 페이지네이션 없음.

## 원본
- 파일: `pc/_Admin_/statistics/order/order_genba_month_count.php` (inline SQL)
- 참조: #241(order-genba-day-count.md)

## 화면·플로우
- **진입 URL**: `/statistics/order/order_genba_month_count?search_year=&search_month=`
- **GET 파라미터**: `search_year`/`search_month`(각 기본 오늘 Y/m). page 없음. 기간 = `{year}-{month}-01` ~ `{year}-{month}-{말일}`.
- **page_title**: "Genba 월별 주문현황" · breadcrumb: 홈 / 통계 / 주문분석 / (page_title) — **정상**.
- **검색폼**(GET): 연/월(기본 오늘) + `검색`. (일 없음)
- **테이블**(동일 클래스, thead `table-light font-13`): **8컬럼**(#241과 달리 **동기화 컬럼 없음**) — Publisher/SKU/Name/주문수량/GrossAmount 합계/NetAmount 합계/ActualBuyingPrice 합계/DGKR 이익.
  - **ActualBuyingPrice 환산 quirk**: raw `total_ActualBuyingPrice < 500`이면 **×1500**(일별 #241은 <300 — **임계값 상이**), else raw.
  - **DGKR 이익** = `NetAmount - ActualBuyingPrice(환산)`. `<0` text-danger. NetAmount>0이면 `(비율%)`.
  - tfoot: colspan**3** 합계 + count/gross/net/actualBuying(환산 합)/DGKR이익.
- **페이지네이션**: 없음. **mutation/AJAX**: 없음(btn_order_batch dead, 동기화 버튼 없음).

## 데이터 (legacy)
- **쿼리**: `select Sku, Name, Publisher, count(*) as total_count, sum(NetAmount) as total_NetAmount, sum(GrossAmount) as total_GrossAmount, sum(ActualBuyingPrice) as total_ActualBuyingPrice from tbl_order_item_genba where ord_ymd between :start and :end and Sku is not null group by Sku order by sum(GrossAmount) desc`.

## API 계약 (백엔드 전달)

### `GET /admin/statistics/order/genba-month-count`
- 요청: `search_year`, `search_month`. 프론트 기본값(오늘) 주입.
- 응답: `StatGenbaMonthCountResponse` — `{ search_year, search_month, items: StatGenbaDayRow[] }`. (row는 #241 `StatGenbaDayRow` 재사용: sku/name/publisher/total_count/net/gross/actual RAW)
- 백엔드 책임: tbl_order_item_genba 월 범위·Sku not null group by Sku, sum 금액, GrossAmount desc. **환산(<500 ×1500)·DGKR이익·tfoot·비율은 프론트 계산**.

## 타겟 매핑
- 라우트: `routes/statistics/order/order_genba_month_count.tsx` → `/statistics/order/order_genba_month_count`
- 스크린: `screens/statistics-genba-month-count`
- 엔티티: `entities/statistics` 확장(genba-month-count, `StatGenbaDayRow` 재사용)
- mock: `handlers/statistics.ts` 확장(GET genba-month-count)

## Parity 체크리스트
- [ ] 검색폼(연/월·기본 오늘·일 없음)·breadcrumb "주문분석"
- [ ] 8컬럼(동기화 없음)·환산 <500 ×1500(일별과 임계값 상이)·DGKR이익 색상·비율
- [ ] tfoot colspan3 합계
- [ ] 페이지네이션·mutation 없음·page_title "Genba 월별 주문현황"
