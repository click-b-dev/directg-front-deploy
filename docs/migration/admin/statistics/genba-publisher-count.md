# Genba 퍼블리셔 주문현황 (#243)

> 통계 Genba 주문 분석 그룹 3번째. 전체 Genba 주문을 Publisher별로 집계하는 읽기전용 표. 필터 없음. 페이지 파라미터는 읽지만 쿼리 페이징은 없다.

## 원본
- 파일: `pc/_Admin_/statistics/order/genba_publisher_count.php` (inline SQL)
- 참조: `docs/legacy-admin/60-statistics.md`, #241/#242 Genba 일/월별 주문현황

## 화면·플로우
- **진입 URL**: `/statistics/order/genba_publisher_count?page=`
- **GET 파라미터**: `page`(기본 1). 실제 SQL에는 미사용. 번호 표시만 `num + (page - 1) * 100`.
- **page_title**: "Genba 퍼블리셔 주문현황" · breadcrumb: 홈 / 통계 / 주문분석 / page_title.
- **검색폼**: 없음.
- **테이블**: `table table-centered w-100 dt-responsive nowrap table-bordered table-sm mb-3`, thead `table-light font-13`, tbody `font-12 bg-white`.
  - 8컬럼: 번호 / Publisher / 주문수량 / GrossAmount 합계 / NetAmount 합계 / ActualBuyingPrice 합계 / DGKR 이익 / 주문비율.
  - **DGKR 이익** = `NetAmount - ActualBuyingPrice`. 음수면 `text-danger`. NetAmount>0이면 다음 줄에 `(round(profit*100/NetAmount, 2)%)`.
  - **주문비율** = `round(GrossAmount * 100 / total_GrossAmount, 3)%`. 분모 0 가드 없음(데이터가 없으면 PHP warning/NaN 가능). 프론트는 빈 문자열로 방어하되 mock은 0 분모를 만들지 않는다.
  - tfoot: colspan2 "합계" + total_count/gross/net/actual/profit(+비율) + 마지막 빈 th.
- **페이지네이션**: 없음. `page`는 번호 offset quirk용.
- **세션/권한**: `lib.php` admin 가드.
- **dead JS**: 하단 `btn_order_batch` 클릭 핸들러가 남아있지만 버튼이 없어 동작하지 않는다. 미이식.

## 데이터 (legacy)
- DB: `$dsn` MAIN PDO.
- SQL:
  ```sql
  select
    Publisher,
    count(*) as total_count,
    sum(NetAmount) as total_NetAmount,
    sum(GrossAmount) as total_GrossAmount,
    sum(ActualBuyingPrice) as total_ActualBuyingPrice
  from tbl_order_item_genba
  where Sku is not null
  group by Publisher
  order by sum(GrossAmount) desc
  ```
- PHP 후처리: Publisher를 key로 배열화하면서 합계 누적. ActualBuyingPrice 환산 없음(#241/#242와 다름).

## API 계약 (백엔드 전달)

### `GET /admin/statistics/order/genba-publisher-count`
- 요청: `page?: number` (프론트 번호 offset용. 백엔드 쿼리 페이징 없음)
- 응답:
  ```ts
  type StatGenbaPublisherRow = {
    publisher: string;
    total_count: number;
    total_net_amount: number;
    total_gross_amount: number;
    total_actual_buying_price: number;
  };
  type StatGenbaPublisherCountResponse = {
    page: number;
    items: StatGenbaPublisherRow[]; // GrossAmount desc
  };
  ```
- 백엔드 책임: `tbl_order_item_genba`에서 `Sku is not null`, `Publisher` 그룹, GrossAmount desc 정렬. 프론트가 DGKR 이익/비율/tfoot 계산.

## 타겟 매핑
- 라우트: `routes/statistics/order/genba_publisher_count.tsx` → `/statistics/order/genba_publisher_count`
- 스크린: `screens/statistics-genba-publisher-count`
- 엔티티: `entities/statistics` 확장(genba-publisher-count)
- mock: `handlers/statistics.ts` 확장(GET genba-publisher-count)

## Parity 체크리스트
- [ ] 검색폼 없음, page_title/breadcrumb "Genba 퍼블리셔 주문현황"
- [ ] 8컬럼, 번호 `num + (page - 1) * 100`
- [ ] DGKR 이익 색상/비율, 주문비율 3자리 반올림
- [ ] tfoot 합계, ActualBuyingPrice 환산 없음
- [ ] 페이지네이션/mutation 없음
