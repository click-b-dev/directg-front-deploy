# 포인트 지급 이벤트 (event_point_list)

## 원본
- 파일: `pc/_Admin_/event/event_point_list.php` (라이브 — "추가 포인트 지급 관리" 그룹, 사이드바 노출)
- 도메인: `AdminEvent::getEventPointList` (**메인 DB `$dsn`** — dgkr 아님! `tbl_add_repay a ⋈ tbl_goods_item b`)
- 참조 문서: `../legacy-project/docs/PROMOTION-EVENT-OPS.md`

## 화면·플로우
- 진입 URL/파라미터: `/event/event_point_list.php?page&search_flag&search_status&search_key&search_value`
- page title: **포인트 지급 이벤트**
- breadcrumb: 홈 / 이벤트 / 추가 포인트 지급 관리 / 포인트 지급 이벤트
- 검색필터 카드(`card-header bg-secondary text-white "검색필터"`):
  - **검색어**: `search_key` select(옵션상품명 `search_name` / 옵션상품명코드 `search_product_code`) + `search_value` text
  - **추가 포인트 지급여부**: radio `Y`(예)/`N`(아니오) — **전체 없음**(미선택=미적용)
  - **진행상태**: radio `upcoming`(진행예정)/`ing`(진행중)/`end`(종료) — **전체 없음**
  - `검색` 버튼(float-end)
- 상단: `{number_format(total_results)} 개`
- 표(6컬럼, `table-centered w-100 nowrap table-sm bg-white table-bordered`, colgroup 3%/*/10%/20%/10%/10%, thead `table-light font-13`, tbody `font-12 bg-white`):
  1. 번호 (`idx`)
  2. 옵션상품정보 (`[{product_code}] {product_name}`, text-start)
  3. 추가 포인트 지급여부 (`repay_flag` raw)
  4. 추가 포인트 지급기간 (`start_dt ~ end_dt`)
  5. 추가 포인트 정보:
     - `repay_type=="%"` → `주문금액의 {repay_point} %` (repay_point **number_format 없음**)
     - else → `{number_format(repay_point)} {repay_type}`
  6. 진행상태 (**계산값**, now 기준):
     - `end_dt>=NOW && start_dt<=NOW` → "진행중"
     - `elseif end_dt<NOW` → "종료"
     - else → "진행예정"
- 하단: `links_html` 서버 페이지네이션(30/page, `a.start_dt desc, a.end_dt desc`)
- 세션/권한: `lib.php` 관리자 가드(공통).

### 필터 WHERE (legacy)
- `search_flag` → `repay_flag='{flag}'`
- `search_value` + `search_key=search_name` → `(b.product_name LIKE '%{v}%' OR b.product_name_en LIKE '%{v}%')`
- `search_value` + `search_key=search_product_code` → `b.product_code='{v}'`
- `search_status=end` → `start_dt<NOW AND end_dt<NOW`
- `search_status=ing` → `start_dt<NOW AND end_dt>NOW`
- `search_status=upcoming` → `start_dt>NOW AND end_dt>NOW`

### quirk (원문 유지)
- **검색어 select(search_key)는 선택 유지 안 됨** — legacy가 `$selected['search_key']`를 세팅하지 않아(오직 `$checked`만 flag/status용) 재조회 시 항상 첫 옵션(옵션상품명)으로 표시. 실제 필터는 제출값 사용. → 이식(defaultValue 미바인딩, 첫 옵션 기본).
- 진행상태 컬럼은 진행상태 필터와 부등호(strict/non-strict)·구조가 미묘히 다름 — 컬럼 로직 그대로 이식.
- 지급여부·진행상태 radio에 "전체" 없음.
- 날짜 비교는 "Y-m-d H:i:s" 문자열 비교(legacy PHP 문자열 비교와 동일, 사전식=시간순).
- `success == true`일 때만 tbody 렌더.

## 데이터 (legacy)
- DB: **MAIN `$dsn`** (dgkr 아님).
- `getEventPointList`: `SELECT a.*, b.product_name FROM tbl_add_repay a INNER JOIN tbl_goods_item b ON a.product_code=b.product_code WHERE 1=1 {add_where} ORDER BY a.start_dt desc, a.end_dt desc`, 30/page.
  - 사용 컬럼: idx, product_code, product_name(b), product_name_en(b, 검색용), repay_flag, start_dt, end_dt, repay_type, repay_point.

## API 계약 (백엔드 전달)

### `GET /admin/event/point-list` — 포인트 지급 이벤트
- 요청(query): `page`(기본 1), `search_flag`(Y|N), `search_status`(upcoming|ing|end), `search_key`(search_name|search_product_code), `search_value`(string)
- 응답:
  ```json
  {
    "items": [
      {
        "idx": 5, "product_code": "PKG-000101", "product_name": "풋볼 매니저 26 (Standard)",
        "repay_flag": "Y", "start_dt": "2025-07-01 00:00:00", "end_dt": "2025-08-31 23:59:59",
        "repay_type": "%", "repay_point": 5
      }
    ],
    "pagination": { "current_page": 1, "results_per_page": 30, "total_results": 3, "total_pages": 1 }
  }
  ```
- 필터: repay_flag(등호)·상품명 LIKE(name/name_en)·상품코드 등호·진행상태(start/end vs NOW). 정렬 `start_dt desc, end_dt desc`. 30/page.
- 진행상태 컬럼은 **프론트에서 now 기준 계산**(legacy view 로직 그대로). 백엔드 timezone(서버=KST) 고려 사항.
- 백엔드 책임: **MAIN DB** `tbl_add_repay ⋈ tbl_goods_item` 조회. 관리자 권한 서버측 강제.
- 에러: legacy PDOException → `Error!` die. 프론트 계약은 표준 5xx 가정.

## 타겟 매핑
- 라우트: `/event/event_point_list` (`routes/event/event_point_list.tsx`, page/search_flag/search_status/search_key/search_value 검증)
- screen: `screens/event-point-list`
- entities: `entities/event` 확장 — `EventPointSearch`/`EventPointItem`/`EventPointListResponse`, `fetchEventPointList`, `useEventPointList`, `eventPointListQueryKey`
- mock: `handlers/event.ts`에 `GET /admin/event/point-list` + fixture(진행중/종료/진행예정·repay_type %/고정)
- 공용: `shared/ui` `ServerPagination`

## Parity 체크리스트
- [ ] 화면 요소 일치 (검색필터·6컬럼·colgroup·page title·breadcrumb·"N 개")
- [ ] 필드/포맷 일치 (옵션상품정보 `[code] name`·repay_flag raw·포인트정보 %/고정 분기·number_format)
- [ ] 분기/플로우 일치 (진행상태 계산·정렬 start_dt/end_dt desc·30/page·필터 WHERE)
- [ ] 엣지케이스 일치 (search_key 선택 미유지 quirk·radio 전체 없음·문자열 날짜 비교)
