# PG별 결제현황

## 원본
- 파일: `pc/_Admin_/statistics/sales/sales_pg.php` (sidebar_statistics.php `결제 분석` 그룹에 노출된 라이브 링크)
- 참조 문서: `docs/legacy-admin/60-statistics.md`, `../legacy-project/docs/STATISTICS-REPORTING.md`
- 자매 단위: #250 일별 매출현황(`sales_day`), #251 월별 매출현황(`sales_month`)

## 화면·플로우
- 진입 URL/파라미터: `/_Admin_/statistics/sales/sales_pg.php?search_year=&search_month=`
- 기본값: `search_year=date('Y')`, `search_month=date('m')`
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈 / 통계 / 결제분석 / PG별 결제현황
  - page_title / h4: "PG별 결제현황"
  - 검색 카드: 주문날짜 연도(2013~현재), 월(01~12), 검색 버튼 (sales_day와 동일 마크업)
  - 결과 테이블: 2행 헤더
    - 1행: 날짜(rowspan=2) / KCP(colspan=2) / 네이버페이(colspan=2) / 페이코(colspan=2) / 토스페이먼츠(colspan=2) / 토스페이(colspan=2)
    - 2행: (각 PG) 결제건수 / 결제금액
  - 본문: 선택 월의 1일부터 말일까지 **모든 일자 행** 출력. 각 셀은 `건수/금액` + 그 아래 `(비율 %)`.
  - tfoot 합계: 각 PG의 월 전체 결제건수·결제금액 합계 + `(비율 %)`.
- 폼 필드/검증: GET select만 사용, 클라이언트 검증 없음.
- 분기/리다이렉트: 없음. 페이지네이션 없음.
- 세션/권한 의존: admin 공통 include, statistics topmenu/sidebar. 서버 권한 강제는 백엔드 책임.

## PG 컬럼 ↔ pg_provider 키 매핑 (표시 순서)
| 컬럼 라벨 | `pg_provider` 값 |
|-----------|------------------|
| KCP | `kcp` |
| 네이버페이 | `naverpay` |
| 페이코 | `payco` |
| 토스페이먼츠 | `toss` |
| 토스페이 | `toss_pay` |

## 표시 계산 (legacy 그대로 — quirk 포함)
- 각 셀 = `number_format(건수)` `<br/>` `(비율 %)`, 금액 셀도 동일 형식.
- **일별 셀 비율의 분모 = `$sales_data[date]['total_count' | 'total_price']`** — SQL `foreach` 누적으로 **해당 일자의 모든 pg_provider 합산**(표시되지 않는 provider 포함, 예: kakao/빈값).
  - 건수 비율 = `total_count>0 ? round(건수*100/total_count, 2) : "0"`
  - 금액 비율 = `total_price>0 ? round(금액*100/total_price, 2) : "0"`
  - 가드 false(데이터 없는 날/total 0)면 문자열 `"0"` → `(0 %)`로 표시.
- **tfoot 합계 비율의 분모 = `$total_count` / `$total_price`** — 일자 루프에서 **표시 5개 PG만** 누적한 총합.
  - 즉 표시되지 않는 provider(kakao 등)가 존재하면 **일별 행 비율의 분모(전체 provider)와 tfoot 비율의 분모(5개 PG만)가 달라진다.** 이 불일치를 그대로 이식한다.
  - tfoot 비율 = `PG합계>0 ? round(PG합계*100/총합, 2) : "0"` (자기 PG 합계 기준 가드).
- 데이터 없는 provider/일자는 `number_format(null)` → `0`, 비율 `(0 %)`.
- `round(x, 2)`는 PHP 숫자 echo(예: `50`, `33.33`, `0`) — 소수 고정 자리 없음.

## 데이터 (legacy)
- 도메인 클래스·메서드: 없음. 페이지 inline PDO SQL.
- SQL 요약:
  - 쿼리: `select ord_ymd, pg_provider, count(*) as checkout_count, sum(total_price) as checkout_price from tbl_order where step='2' and ord_ymd between :start_date and :end_date group by ord_ymd, pg_provider`
  - 파라미터: `start_date = {year}-{month}-01`, `end_date = {year}-{month}-{말일}`
  - 정렬: SQL 명시 없음. 화면은 날짜 루프(1~말일) 기준 출력. 각 (일자,provider) 유일.
  - 페이징 없음.

## API 계약 (백엔드 전달)
- `GET /admin/statistics/sales/pg`
  - query:
    - `search_year: string` — 빈값이면 현재 연도
    - `search_month: string` — 빈값이면 현재 월
  - response:
    ```ts
    {
      search_year: string;
      search_month: string;
      rows: Array<{
        ord_ymd: string;      // "YYYY-MM-DD"
        pg_provider: string;  // kcp | naverpay | payco | toss | toss_pay | (그 외)
        checkout_count: number;
        checkout_price: number;
      }>;
    }
    ```
  - 백엔드 책임:
    - `tbl_order` `step='2'` + `ord_ymd between start_date and end_date`, `group by ord_ymd, pg_provider`의 **raw 그룹 행을 그대로** 내려준다(가공 최소).
    - 표시 5개 이외의 `pg_provider`(kakao 등)도 **누락 없이** 포함한다 — 프론트가 legacy처럼 일별 비율 분모(전체 provider)와 tfoot 분모(5개 PG)를 구분 계산한다.
    - 없는 일자 0 채움·피벗·비율·합계는 프론트가 legacy 로직으로 수행한다.
    - 숫자 컬럼 null은 0으로 정규화한다.
    - 서버측 권한 강제는 백엔드 책임(프론트는 legacy 동일하게 표시만).

## 타겟 매핑
- 라우트: `apps/directg-admin/src/routes/statistics/sales/sales_pg.tsx` → `/statistics/sales/sales_pg`
- screen: `apps/directg-admin/src/screens/statistics-sales-pg`
- entities: `apps/directg-admin/src/entities/statistics` (sales-pg 슬라이스 확장)
- mock: `apps/directg-admin/src/shared/mocks/handlers/statistics.ts` (sales/pg 핸들러 추가)
- 사이드바: `widgets/sidebar` STATISTICS_SIDE_NAV `PG별 결제현황` 링크는 #228에서 이미 등록됨(별도 수정 불필요).

## Parity 체크리스트
- [x] 화면 요소 일치 (2행 헤더 5 PG·검색폼·breadcrumb "결제분석")
- [x] 필드/검증 일치 (연/월 select, 기본 당월)
- [x] 분기/플로우 일치 (전일 행 출력·페이지네이션 없음)
- [x] 엣지케이스 일치 (일별 분모=전체 provider vs tfoot 분모=5 PG 불일치·데이터 없는 셀 `(0 %)`)
