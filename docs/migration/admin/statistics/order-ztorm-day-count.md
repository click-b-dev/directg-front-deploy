# Ztorm 일별 주문현황 (#239)

> 통계 Ztorm 주문 분석 그룹 1번째. 선택 일자의 Ztorm 아이템별 주문수량 목록(연/월/일 필터). 페이지네이션 없음. 읽기전용.

## 원본
- 파일: `pc/_Admin_/statistics/order/order_ztorm_day_count.php` (inline SQL, 도메인 클래스 미경유)
- 참조: #237(order-asset-day-count.md)

## 화면·플로우
- **진입 URL**: `/statistics/order/order_ztorm_day_count?search_year=&search_month=&search_day=`
- **GET 파라미터**: `search_year`/`search_month`/`search_day`(각 기본 오늘 Y/m/d). **page 없음**(페이지네이션 없음). search_date = `{year}-{month}-{day}`.
- **page_title**: "Ztorm 일별 주문현황" · **breadcrumb 3번째 "Vaultn 주문 분석"**(legacy copy-paste 오타 — 그대로 이식).
- **검색폼**(GET): 연도(2013~현재) + 월(01~12) + 일(01~해당월 일수, 제출 월 기준) + `검색`. 기본 오늘.
- **테이블**(동일 클래스, thead `table-light font-13`): 8컬럼 — Publisher(ztorm_publisher)/SKU(ztorm_item_id)/Name(ztorm_item_name)/주문수량(total_count)/GrossAmount 합계/NetAmount 합계/ActualBuyingPrice 합계/DGKR 이익.
  - **DGKR 이익** = `NetAmount - ActualBuyingPrice`. `<0`이면 `text-danger`. NetAmount>0이면 `(비율%)` 병기(`round((net-actual)*100/net, 2)`).
  - tfoot 합계: total_count/Gross/Net/Actual 합 + DGKR 이익 합(total_net>0이면 비율).
- **페이지네이션**: 없음.
- **세션/권한**: `lib.php` admin 가드.
- **mutation/AJAX**: 없음. (btn_order_batch dead)

### legacy 버그/quirk (파악됨 — 개발자 판단 필요)
- **금액 3컬럼 + DGKR 이익 항상 0**: SQL은 `select ztorm_item_id, ztorm_item_name, ztorm_publisher, count(*) as total_count`만 SELECT하는데 화면은 `total_GrossAmount`/`total_NetAmount`/`total_ActualBuyingPrice`(미정의 PHP 배열 키)를 표시 → `number_format(null)`=0. 따라서 **Gross/Net/Actual/DGKR이익 열은 항상 "0", 비율·text-danger 미발동**. 실제 의미 있는 데이터는 Publisher/SKU/Name/주문수량뿐.
  - **이식 방침**: 동작 동일성 원칙상 legacy대로 **0으로 재현**. 실제 금액 집계를 원하면 의도적 동작 변경(개발자 승인 필요) — 게이트에서 질의.
- breadcrumb "Vaultn 주문 분석" 오타 이식. btn_order_batch dead.

## 데이터 (legacy)
- **DB**: `$dsn`(MAIN) PDO. inline SQL.
- **쿼리**: `select ztorm_item_id, ztorm_item_name, ztorm_publisher, count(*) as total_count from tbl_order_item_ztorm where ord_ymd=:date group by ztorm_item_id order by count(*) desc`.
  - **금액 SUM 미포함**(위 quirk 참조).

## API 계약 (백엔드 전달)

### `GET /admin/statistics/order/ztorm-day-count`
- 요청: `search_year`, `search_month`, `search_day`. 프론트 기본값(오늘) 주입.
- 응답:
  ```ts
  type StatZtormDayRow = {
    ztorm_publisher: string;
    ztorm_item_id: string;
    ztorm_item_name: string;
    total_count: number;
    total_gross_amount: number;         // legacy 쿼리 미SELECT → 0(현행 재현)
    total_net_amount: number;           // 0
    total_actual_buying_price: number;  // 0
  };
  type StatZtormDayCountResponse = {
    search_year: string;
    search_month: string;
    search_day: string;
    items: StatZtormDayRow[];           // count desc
  };
  ```
- 백엔드 책임: tbl_order_item_ztorm ord_ymd=date group by ztorm_item_id, count desc. **금액 필드는 legacy 현행상 0**(향후 실집계 원하면 SUM 추가 — 개발자 결정). tfoot 합계·DGKR 이익·비율은 프론트 계산.

## 타겟 매핑
- 라우트: `routes/statistics/order/order_ztorm_day_count.tsx` → `/statistics/order/order_ztorm_day_count`
- 스크린: `screens/statistics-ztorm-day-count`
- 엔티티: `entities/statistics` 확장(ztorm-day-count)
- mock: `handlers/statistics.ts` 확장(GET ztorm-day-count, 금액 0)

## Parity 체크리스트
- [ ] 검색폼(연/월/일·기본 오늘)·breadcrumb "Vaultn 주문 분석" 오타
- [ ] 8컬럼·주문수량 nf·금액 3열 0(legacy 재현)·DGKR 이익 0·비율/색상 미발동
- [ ] tfoot 합계
- [ ] 페이지네이션 없음·읽기전용·page_title "Ztorm 일별 주문현황"
