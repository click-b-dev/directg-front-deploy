# Ztorm 월별 주문현황 (#240)

> 통계 Ztorm 주문 분석 그룹 2번째. #239 자매(월 범위). Ztorm 아이템별 주문수량 목록(연/월 필터). 페이지네이션 없음. 읽기전용.

## 원본
- 파일: `pc/_Admin_/statistics/order/order_ztorm_month_count.php` (inline SQL)
- 참조: #239(order-ztorm-day-count.md)

## 화면·플로우
- **진입 URL**: `/statistics/order/order_ztorm_month_count?search_year=&search_month=`
- **GET 파라미터**: `search_year`/`search_month`(각 기본 오늘 Y/m). page 없음. 기간 = `{year}-{month}-01` ~ `{year}-{month}-{말일}`.
- **page_title**: "Ztorm 월별 주문현황" · **breadcrumb 3번째 "Vaultn 주문 분석"**(legacy 오타 이식).
- **검색폼**(GET): 연도(2013~현재) + 월(01~12) + `검색`. (#239와 달리 **일 없음**)
- **테이블**: #239와 동일 8컬럼(Publisher/SKU/Name/주문수량/Gross/Net/ActualBuying/DGKR이익 색상·비율)·tfoot 합계.
  - **금액 3컬럼+DGKR이익 항상 0**: SQL이 `count(*)`만 SELECT, 화면은 미정의 `total_GrossAmount`/`total_NetAmount`/`total_ActualBuyingPrice` 표시 → 0(#239와 동일 legacy 버그, **금액0 유지 확정**).
- **페이지네이션**: 없음. **mutation/AJAX**: 없음(btn_order_batch dead).

## 데이터 (legacy)
- **쿼리**: `select ztorm_item_id, ztorm_item_name, ztorm_publisher, count(*) as total_count from tbl_order_item_ztorm where ord_ymd between :start and :end group by ztorm_item_id order by count(*) desc`. (금액 SUM 미포함)

## API 계약 (백엔드 전달)

### `GET /admin/statistics/order/ztorm-month-count`
- 요청: `search_year`, `search_month`. 프론트 기본값(오늘) 주입.
- 응답: `StatZtormMonthCountResponse` — `{ search_year, search_month, items: StatZtormDayRow[] }`. (row는 #239 `StatZtormDayRow` 재사용: ztorm_publisher/ztorm_item_id/ztorm_item_name/total_count + 금액 3필드 0)
- 백엔드 책임: tbl_order_item_ztorm 월 범위 group by ztorm_item_id count desc. 금액 필드는 legacy 현행상 0(확정). tfoot·DGKR이익·비율은 프론트 계산.

## 타겟 매핑
- 라우트: `routes/statistics/order/order_ztorm_month_count.tsx` → `/statistics/order/order_ztorm_month_count`
- 스크린: `screens/statistics-ztorm-month-count`
- 엔티티: `entities/statistics` 확장(ztorm-month-count, `StatZtormDayRow` 재사용)
- mock: `handlers/statistics.ts` 확장(GET ztorm-month-count, 금액 0)

## Parity 체크리스트
- [ ] 검색폼(연/월·기본 오늘·일 없음)·breadcrumb "Vaultn 주문 분석" 오타
- [ ] 8컬럼·금액 0·DGKR이익 로직·tfoot 합계
- [ ] 페이지네이션 없음·읽기전용·page_title "Ztorm 월별 주문현황"
