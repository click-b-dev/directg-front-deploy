# Genba API - 퍼블리셔 관리

## 원본

- 파일: `pc/_Admin_/goods/genba/genba_publisher.php` (라이브), 토글 AJAX: `genba_ps.php` (mode=publisher_config)
- 데이터: `AdminGoods::getGenbaPublisherList()` (`AdminGoods.php:735`)

## 화면·플로우

- 진입 URL/파라미터: `/goods/genba/genba_publisher` (파라미터 없음)
- page_title `Genba 퍼블리셔 관리` / breadcrumb: 홈 > 상품 > Genba 관리 > Genba 퍼블리셔 관리
- card-header `Genba 퍼블리셔 현황` (`bg-secondary text-white`)
- 테이블 4컬럼:
  - 번호 (1부터 증가)
  - Publisher (`$value['publisher']`, text-start)
  - sku수 (`$value['cc']`, text-end) — **⚠️ legacy quirk**: `getGenbaPublisherList()`는 `select publisher,status`만 SELECT → `cc` 미존재 → **모든 행 빈칸**
  - Status: 체크박스 switch(`data-switch="primary"`), `status=="Y"`면 checked
- tfoot 합계: colspan=2 "합계" + `number_format($total)` — `$total`은 `$value['cc']`(undefined) 누적 → **항상 "0"**
- 필터/페이징 없음, 정렬은 `publisher asc` (백엔드)

## 폼 필드/검증

- Status 체크박스 change 이벤트:
  - checked → status="Y", 아니면 "N"
  - `POST genba_ps.php {mode:"publisher_config", publisher, status}` → `alert(data)`
  - **`location.reload()`는 주석처리 → 리로드/재조회 없음.** 체크박스는 사용자가 토글한 상태 그대로 유지.
  - 응답 본문 = `print_r($params)` = `Array\n(\n    [:publisher] => ...\n    [:status] => Y|N\n)` (디버그 덤프를 그대로 alert)

## 데이터 (legacy)

- `getGenbaPublisherList()`: `select publisher,status from genba_publisher order by publisher asc`
- `genba_ps.php` publisher_config: `insert into genba_publisher set publisher=:publisher,status=:status ON DUPLICATE KEY UPDATE status=:status` 후 `print_r($params)`

## API 계약 (백엔드 전달)

### `GET /admin/genba/publishers`

- 응답 `200`: `{ items: { publisher: string, status: "Y"|"N" }[] }` — `publisher asc` 정렬.
- (legacy는 sku수/합계를 계산하지 못하는 상태이므로 프론트도 sku수 빈칸·합계 0 유지. 백엔드 추가 필드 불필요.)

### `POST /admin/genba/publisher-config`

- 요청: `{ publisher: string, status: "Y"|"N" }`
- 백엔드 책임: `genba_publisher` upsert(publisher unique key, status 갱신).
- 응답 `200`: `{ message: string }` — legacy는 `print_r` 덤프를 그대로 반환하고 프론트가 alert. 프론트는 `message`를 alert.

## 타겟 매핑

- 라우트: `routes/goods/genba/genba_publisher.tsx` → `/goods/genba/genba_publisher`
- screens: `screens/genba-publisher`
- entities: `genba` 확장 — `GenbaPublisherItem`, `GenbaPublisherConfigRequest`, `GenbaActionResult`, `fetchGenbaPublisherList`, `configGenbaPublisher`, `useGenbaPublisherList`, `useConfigGenbaPublisher`(invalidate 없음)
- mock: `handlers/genba` 확장 — `GET /admin/genba/publishers`, `POST /admin/genba/publisher-config`

## Parity 체크리스트

- [ ] 화면 요소 일치 (4컬럼/card-header/tfoot)
- [ ] sku수 빈칸·합계 0 quirk 재현
- [ ] Status 토글 → POST → alert, 리로드 없음, 체크 상태 유지
- [ ] 분기/플로우 일치 (필터·페이징 없음)
