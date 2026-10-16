# Genba 일별 주문현황 (#241)

> 통계 Genba 주문 분석 그룹 1번째. 선택 일자의 Genba SKU별 주문·금액 집계(연/월/일 필터) + 카탈로그 동기화 버튼. 페이지네이션 없음.

## 원본
- 파일: `pc/_Admin_/statistics/order/order_genba_day_count.php` (inline SQL) + `goods/genba/genba_catalogue_sync.php`(동기화 POST)
- 참조: #239(Ztorm 일별)

## 화면·플로우
- **진입 URL**: `/statistics/order/order_genba_day_count?search_year=&search_month=&search_day=`
- **GET 파라미터**: `search_year`/`search_month`/`search_day`(각 기본 오늘 Y/m/d). page 없음. search_date = `{year}-{month}-{day}`.
- **page_title**: "Genba 일별 주문현황" · breadcrumb: 홈 / 통계 / 주문분석 / (page_title) — **정상**(Ztorm과 달리 오타 없음).
- **검색폼**(GET): 연/월/일(기본 오늘) + `검색`.
- **테이블**(동일 클래스, thead `table-light font-13`): **9컬럼** — 동기화/Publisher/SKU/Name/주문수량/GrossAmount 합계/NetAmount 합계/ActualBuyingPrice 합계/DGKR 이익.
  - **ActualBuyingPrice 환산 quirk**: raw `total_ActualBuyingPrice < 300`이면 **×1500**(통화 환산 KRW), else raw. → 표시·DGKR이익·tfoot 모두 환산값 사용.
  - **DGKR 이익** = `NetAmount - ActualBuyingPrice(환산)`. `<0`이면 `text-danger`. NetAmount>0이면 `(비율%)`(`round((net-actual)*100/net, 2)`).
  - **동기화 컬럼**: `Name==""`(카탈로그 미동기화)일 때만 `btn_genba_sync`(`btn btn-info`, uil-refresh) 노출. 클릭 → POST `genba_catalogue_sync.php {sku}` → reload.
  - tfoot: colspan4 합계 + count/gross/net/actualBuying(환산 합)/DGKR이익(net>0이면 비율).
- **페이지네이션**: 없음.
- **세션/권한**: `lib.php` admin 가드.
- **mutation**: btn_genba_sync(카탈로그 동기화, 성공 시 reload=invalidate).

## 데이터 (legacy)
- **DB**: `$dsn`(MAIN) PDO. inline SQL.
- **쿼리**: `select Sku, Name, Publisher, count(*) as total_count, sum(NetAmount) as total_NetAmount, sum(GrossAmount) as total_GrossAmount, sum(ActualBuyingPrice) as total_ActualBuyingPrice from tbl_order_item_genba where ord_ymd=:date and Sku is not null group by Sku order by sum(GrossAmount) desc`.
- 환산·합계는 PHP 후처리(위 quirk).

## API 계약 (백엔드 전달)

### `GET /admin/statistics/order/genba-day-count`
- 요청: `search_year`, `search_month`, `search_day`. 프론트 기본값(오늘) 주입.
- 응답:
  ```ts
  type StatGenbaDayRow = {
    sku: string;
    name: string;              // 빈값이면 동기화 버튼 노출
    publisher: string;
    total_count: number;
    total_net_amount: number;
    total_gross_amount: number;
    total_actual_buying_price: number; // RAW(프론트 <300?×1500 환산)
  };
  type StatGenbaDayCountResponse = {
    search_year: string; search_month: string; search_day: string;
    items: StatGenbaDayRow[]; // GrossAmount desc
  };
  ```
- 백엔드 책임: tbl_order_item_genba ord_ymd=date·Sku not null group by Sku, sum 금액, GrossAmount desc. **환산·DGKR이익·tfoot·비율은 프론트 계산**.

### `POST /admin/statistics/order/genba-day-count/sync`
- legacy `genba_catalogue_sync.php` {sku}.
- 요청: `{ sku: string }`. 응답: `{ success: boolean }`.
- 백엔드 책임: Genba 카탈로그 동기화(SKU). 프론트는 성공 시 day-count invalidate(reload).

## 타겟 매핑
- 라우트: `routes/statistics/order/order_genba_day_count.tsx` → `/statistics/order/order_genba_day_count`
- 스크린: `screens/statistics-genba-day-count`
- 엔티티: `entities/statistics` 확장(genba-day-count + genba-sync)
- mock: `handlers/statistics.ts` 확장(GET genba-day-count + POST sync)

## Parity 체크리스트
- [ ] 검색폼(연/월/일·기본 오늘)·breadcrumb "주문분석"(정상)
- [ ] 9컬럼·ActualBuyingPrice 환산(<300 ×1500)·DGKR이익 색상·비율
- [ ] 동기화 버튼(Name 빈값만)→sync→reload(invalidate)
- [ ] tfoot 합계(환산 반영)
- [ ] 페이지네이션 없음·page_title "Genba 일별 주문현황"
