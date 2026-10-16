# Asset 일별 주문현황 (#237)

> 통계 Asset 주문 분석 그룹 1번째. 선택 일자의 Asset별 주문수량 목록(연/월/일 필터·50/page). 읽기전용.

## 원본
- 파일: `pc/_Admin_/statistics/order/order_asset_day_count.php`
- 도메인: `Admin::getOrderAssetDayCount`(pagination)
- 참조: `docs/legacy-admin/60-statistics.md`

## 화면·플로우
- **진입 URL**: `/statistics/order/order_asset_day_count?search_year=&search_month=&search_day=&page=`
- **GET 파라미터**: `search_year`/`search_month`/`search_day`(각 기본 오늘 Y/m/d), `page`(기본 1). search_date = `{year}-{month}-{day}`.
- **page_title**: "Asset 일별 주문현황" · breadcrumb: 홈 / 통계 / Asset 주문 분석 / (page_title)
- **검색폼**(GET, `row row-cols-lg-auto`): 주문날짜 = 연도 select(2013~현재) + 월 select(01~12) + 일 select(01~해당월 일수) + `검색`. 기본 오늘.
  - **일 옵션은 제출된 연/월 기준 일수**(legacy 정적 — 월 변경 시 재제출 전까지 일 목록 미갱신, 그대로 이식).
- **테이블**(`table table-centered w-100 dt-responsive nowrap table-bordered table-sm mb-3`, thead `table-light font-13`): 7컬럼 — Asset ID(asset_id)/Asset Name(asset_name)/Asset Publisher(publisher)/Product Type(productType)/Asset Type(assetType)/Asset Platform(platform)/주문수량(total_count number_format).
  - **tfoot**(table-light): 합계(colspan3) + 빈 th 3 + 주문수량 합계(현재 페이지 합).
- **페이지네이션**: `links_html` → `shared/ui/ServerPagination`.
- **세션/권한**: `lib.php` admin 가드.
- **mutation/AJAX**: 없음. (하단 `btn_order_batch` JS는 대상 버튼 부재 → dead)

### legacy dead/quirk
- **50/page**: `getOrderAssetDayCount($page,$add_where,$orderby,$param)`는 4파라미터인데 호출은 `,'30'` 5번째 인자 전달 → **함수 미사용 → results_per_page 하드코딩 50 유지**(#193 등 선례와 동일 quirk).
- tfoot `<th class="text-end"></td>` 태그 불일치·빈칸 3(의도적). `btn_order_batch` dead.

## 데이터 (legacy)
- **DB**: `$dsn`(MAIN) PDO.
- **getOrderAssetDayCount**(Admin.php, 50/page):
  ```sql
  select a.asset_id, a.asset_name, a.publisher, a.assetType, a.platform, a.productType,
         count(b.asset_id) as total_count
  from tbl_asset a inner join tbl_order_item_asset b on a.asset_id=b.asset_id
  where a.publisher<>'Naverpay' and a.assetType<>'구매특전' [+ and b.ord_ymd='{date}']
  group by b.asset_id order by total_count desc
  ```

## API 계약 (백엔드 전달)

### `GET /admin/statistics/order/asset-day-count`
- 요청: `search_year`, `search_month`, `search_day`, `page`(기본 1). 프론트 기본값(오늘) 주입.
- 응답:
  ```ts
  type StatAssetDayRow = {
    asset_id: string;
    asset_name: string;
    publisher: string;
    productType: string;
    assetType: string;
    platform: string;
    total_count: number;
  };
  type StatAssetDayCountResponse = {
    search_year: string;
    search_month: string;
    search_day: string;
    items: StatAssetDayRow[];
    pagination: { current_page: number; total_pages: number; total_results: number };
  };
  ```
- 백엔드 책임: getOrderAssetDayCount(date 필터, total_count desc, 50/page). tfoot 합계는 프론트 계산(현재 페이지 합).

## 타겟 매핑
- 라우트: `routes/statistics/order/order_asset_day_count.tsx` → `/statistics/order/order_asset_day_count`
- 스크린: `screens/statistics-asset-day-count`
- 엔티티: `entities/statistics` 확장(asset-day-count)
- mock: `handlers/statistics.ts` 확장(GET asset-day-count)
- 공용: `shared/ui/ServerPagination`

## Parity 체크리스트
- [ ] 검색폼(연/월/일·기본 오늘·일 옵션은 제출 월 기준)
- [ ] 7컬럼·주문수량 nf·tfoot 합계(colspan3+빈칸3+합계)
- [ ] 50/page ServerPagination(5번째 '30' 무시 quirk)·페이지 파라미터 유지
- [ ] 읽기전용·page_title "Asset 일별 주문현황"
