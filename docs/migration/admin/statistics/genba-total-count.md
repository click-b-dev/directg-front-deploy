# Genba 누적 주문현황 (#244)

> 통계 Genba 주문 분석 그룹 4번째. 전체 Genba 주문을 SKU별로 누적 집계하는 읽기전용 페이징 목록. 필터 없음.

## 원본
- 파일: `pc/_Admin_/statistics/order/genba_total_count.php`
- 도메인: `Admin::getOrderGenbaCount` (`../legacy-project/src/classes/Admin.php`)
- 참조: `docs/legacy-admin/60-statistics.md`, #241~#243 Genba 통계

## 화면·플로우
- **진입 URL**: `/statistics/order/genba_total_count?page=`
- **GET 파라미터**: `page`(기본 1). 필터 없음.
- **page_title**: "Genba 누적 주문현황" · breadcrumb: 홈 / 통계 / 주문분석 / page_title.
- **검색폼**: 없음.
- **테이블**: `table table-centered w-100 dt-responsive nowrap table-bordered table-sm mb-3`, thead `table-light font-13`, tbody `font-12 bg-white`.
  - 9컬럼: 번호 / Publisher / SKU / Name / 주문수량 / GrossAmount 합계 / NetAmount 합계 / ActualBuyingPrice 합계 / 이익.
  - 번호는 `num + (page - 1) * 100`. **페이지 크기는 30인데 번호 offset은 100인 quirk**를 그대로 유지한다.
  - **이익** = `NetAmount - ActualBuyingPrice`. 음수면 `text-danger`. NetAmount>0이면 다음 줄에 `(round(profit*100/NetAmount, 2)%)`.
  - tfoot: 현재 페이지 합계. colspan4 "합계" + count/gross/net/actual/profit(+비율).
- **페이지네이션**: `links_html` → `shared/ui/ServerPagination`.
- **세션/권한**: `lib.php` admin 가드.
- **dead JS**: 하단 `btn_order_batch` 핸들러는 버튼이 없어 동작하지 않는다. 미이식.

## 데이터 (legacy)
- DB: `$dsn` MAIN PDO.
- `Admin::getOrderGenbaCount($page,$add_where,$orderby,$param)`:
  ```sql
  select
    Sku,
    Name,
    Publisher,
    count(*) as total_count,
    sum(NetAmount) as total_NetAmount,
    sum(GrossAmount) as total_GrossAmount,
    sum(ActualBuyingPrice) as total_ActualBuyingPrice
  from tbl_order_item_genba
  where Sku is not null
  group by Sku
  order by sum(NetAmount)-sum(ActualBuyingPrice) desc
  ```
- `results_per_page`는 메서드 내부 하드코딩 **30**. 화면 호출부는 5번째 인자 `'10'`을 넘기지만 PHP 함수 파라미터에 없어 무시된다.
- `ActualBuyingPrice` 환산 없음(#241/#242와 다름).

## API 계약 (백엔드 전달)

### `GET /admin/statistics/order/genba-total-count`
- 요청: `page?: number` (기본 1)
- 응답:
  ```ts
  type StatGenbaTotalRow = {
    sku: string;
    name: string;
    publisher: string;
    total_count: number;
    total_net_amount: number;
    total_gross_amount: number;
    total_actual_buying_price: number;
  };
  type StatGenbaTotalCountResponse = {
    page: number;
    items: StatGenbaTotalRow[];
    pagination: { current_page: number; total_pages: number; total_results: number };
  };
  ```
- 백엔드 책임: `Sku is not null`, `Sku` group by, `sum(Net)-sum(Actual)` desc, 30/page. 프론트가 이익/비율/tfoot 계산.

## 타겟 매핑
- 라우트: `routes/statistics/order/genba_total_count.tsx` → `/statistics/order/genba_total_count`
- 스크린: `screens/statistics-genba-total-count`
- 엔티티: `entities/statistics` 확장(genba-total-count)
- mock: `handlers/statistics.ts` 확장(GET genba-total-count)
- 공용: `shared/ui/ServerPagination`

## Parity 체크리스트
- [ ] 검색폼 없음, page_title/breadcrumb "Genba 누적 주문현황"
- [ ] 9컬럼, 번호 `num + (page - 1) * 100`
- [ ] 정렬 profit desc, ActualBuyingPrice 환산 없음
- [ ] 이익 색상/비율, tfoot 현재 페이지 합계
- [ ] 30/page ServerPagination, mutation 없음
