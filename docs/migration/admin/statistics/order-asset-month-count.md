# Asset 월별 주문현황 (#238)

> 통계 Asset 주문 분석 그룹 2번째. #237 자매(월 범위). Asset별 주문수량 목록(연/월 필터·50/page). 읽기전용.

## 원본
- 파일: `pc/_Admin_/statistics/order/order_asset_month_count.php`
- 도메인: `Admin::getOrderAssetMonthCount`(pagination)
- 참조: #237(order-asset-day-count.md)

## 화면·플로우
- **진입 URL**: `/statistics/order/order_asset_month_count?search_year=&search_month=&page=`
- **GET 파라미터**: `search_year`/`search_month`(각 기본 오늘 Y/m), `page`(기본 1). 기간 = `{year}-{month}-01` ~ `{year}-{month}-{말일}`.
- **page_title**: "Asset 월별 주문현황" · breadcrumb: 홈 / 통계 / Asset 주문 분석 / (page_title)
- **검색폼**(GET): 주문날짜 = 연도 select(2013~현재) + 월 select(01~12) + `검색`. (#237과 달리 **일 select 없음**)
- **테이블**(동일 클래스, thead `table-light font-13`): 7컬럼 — **Asset Publisher(publisher) 먼저**, Asset ID(asset_id), Asset Name(asset_name), Product Type(productType), Asset Type(assetType), Asset Platform(platform), 주문수량(total_count). **#237 대비 컬럼 순서 상이**(#237은 Asset ID 먼저).
  - tfoot 합계(colspan3 + 빈칸3 + 주문수량 합, 현재 페이지 합).
- **페이지네이션**: `links_html`(50/page, 5번째 '30' 무시 quirk) → `shared/ui/ServerPagination`.
- **세션/권한**: `lib.php` admin 가드.
- **mutation/AJAX**: 없음. (btn_order_batch dead)

## 데이터 (legacy)
- **getOrderAssetMonthCount**(Admin.php, 50/page):
  ```sql
  select a.asset_id, b.asset_name, a.publisher, a.assetType, a.platform, a.productType,
         count(b.asset_id) as total_count
  from tbl_asset a inner join tbl_order_item_asset b on a.asset_id=b.asset_id
  where a.publisher<>'Naverpay' and a.assetType<>'구매특전' [+ and b.ord_ymd between '{start}' and '{end}']
  group by b.asset_id order by total_count desc
  ```

## API 계약 (백엔드 전달)

### `GET /admin/statistics/order/asset-month-count`
- 요청: `search_year`, `search_month`, `page`(기본 1). 프론트 기본값(오늘) 주입.
- 응답: `StatAssetMonthCountResponse` — `{ search_year, search_month, items: StatAssetDayRow[], pagination }`. (row는 #237 `StatAssetDayRow` 재사용: asset_id/asset_name/publisher/productType/assetType/platform/total_count)
- 백엔드 책임: getOrderAssetMonthCount(월 범위 필터, total_count desc, 50/page). tfoot 합계는 프론트 계산.

## 타겟 매핑
- 라우트: `routes/statistics/order/order_asset_month_count.tsx` → `/statistics/order/order_asset_month_count`
- 스크린: `screens/statistics-asset-month-count`
- 엔티티: `entities/statistics` 확장(asset-month-count, `StatAssetDayRow` 재사용)
- mock: `handlers/statistics.ts` 확장(GET asset-month-count)
- 공용: `shared/ui/ServerPagination`

## Parity 체크리스트
- [ ] 검색폼(연/월·기본 오늘·일 없음)
- [ ] 7컬럼(Publisher 먼저 — #237과 순서 상이)·주문수량 nf·tfoot 합계
- [ ] 50/page ServerPagination·페이지 파라미터 유지
- [ ] 읽기전용·page_title "Asset 월별 주문현황"
