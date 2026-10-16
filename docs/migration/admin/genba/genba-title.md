# Genba API - 타이틀 현황

## 원본

- 파일: `pc/_Admin_/goods/genba/genba_title.php` (라이브), mutation AJAX: `genba_api.php` (api_type=price / product)
- 데이터: `AdminGoods::getGenbaTitleList()` (`AdminGoods.php:780`), `getGenbaTitlePublisher()` (`:744`)

## 화면·플로우

- 진입 URL/파라미터: `/goods/genba/genba_title?page&search_product_id&search_publisher&search_name`
- page_title `Genba 타이틀 현황` / breadcrumb: 홈 > 상품 > Genba 관리 > Genba 타이틀 현황

### 검색필터 카드 (`검색필터`, method=get)

- ProductID: text `search_product_id` → `a.ProductID='<v>'` (정확 일치)
- Publisher: select `search_publisher` (옵션 = `getGenbaTitlePublisher()`의 distinct Publisher) → `a.Publisher='<v>'`
- Name: text `search_name` → `a.Name Regexp '<v>'`
- 제출 버튼: "Genba 상품 검색"
- **base where 항상**: `a.is_krw='N'`

### 목록 영역

- 상단: `number_format(total_results) 개` (float-start) + "Genba 상품 동기화" 버튼(float-end)
- card-header `Genba 상품 현황`
- 테이블 8컬럼:
  - 번호 = `total_results - (index + (page-1)*50)` (역순 감소)
  - ProductID (text-center)
  - Name (text-start)
  - Publisher (text-start)
  - ReleaseDate = `date("Y-m-d H:i:s", strtotime('+9 hours', ReleaseDate))` (+9h/KST)
  - EtailerSplitPercentage + `<br/>(is_krw)` — base where로 is_krw는 항상 'N'
  - 동기화날짜 = `batch_date` (raw)
  - 가격업데이트 = "가격동기화" 버튼(`data-productid`)
- 페이징 50/page, 하단 `links_html`

## 폼/mutation

- 개별 가격동기화(`.btn_price_sync`): `GET genba_api.php {api_type:"price", productid}` → `alert(data)` + `location.reload()`
- 전체 상품동기화(`#btn_genba_product_sync`): `GET genba_api.php {api_type:"product"}` → `alert(data)` + `location.reload()`

## 데이터 (legacy)

- `getGenbaTitleList`: `select a.* from genba_title a inner join genba_publisher b on a.Publisher=b.publisher where b.status='Y' <add_where> order by date_format(a.batch_date,'%Y-%m-%d') desc, a.ReleaseDate desc, a.Publisher desc` · 50/page
- `getGenbaTitlePublisher`: `select Publisher,count(*) from genba_title group by Publisher order by publisher asc`

## API 계약 (백엔드 전달)

### `GET /admin/genba/titles`

- 쿼리: `page`(기본 1), `search_product_id`, `search_publisher`, `search_name`
- 백엔드 책임: base where `is_krw='N'` + publisher status='Y' inner join, 위 정렬/페이징(50) 적용. `search_name`은 Regexp.
- 응답 `200`:
  ```
  { items: {
      ProductID, Name, Publisher,
      ReleaseDate,   // +9h 적용된 "YYYY-MM-DD HH:mm:ss" 표시 문자열
      EtailerSplitPercentage, is_krw, batch_date
    }[],
    pagination: { current_page, results_per_page: 50, total_results, total_pages }
  }
  ```

### `GET /admin/genba/title-publishers`

- 응답 `200`: `{ items: { Publisher: string }[] }` (select 옵션, publisher asc)

### `POST /admin/genba/price-sync`

- 요청: `{ productid: string }` (legacy `genba_api.php?api_type=price`)
- 응답 `200`: `{ message: string }` — 성공 후 목록 재조회(legacy reload).

### `POST /admin/genba/product-sync`

- 요청: `{}` (legacy `genba_api.php?api_type=product`)
- 응답 `200`: `{ message: string }` — 성공 후 목록 재조회.

## 타겟 매핑

- 라우트: `routes/goods/genba/genba_title.tsx` → `/goods/genba/genba_title` (validateSearch: page + search_*)
- screens: `screens/genba-title`
- entities: `genba` 확장 — `GenbaTitleItem`, `GenbaTitleSearch`, `GenbaTitlePublisherOption`, `GenbaTitleListResponse`, `GenbaPriceSyncRequest`, fetch/query 훅(price/product sync는 onSuccess titles invalidate)
- mock: `handlers/genba` 확장 — titles/title-publishers/price-sync/product-sync

## Parity 체크리스트

- [ ] 검색필터 3종(ProductID/Publisher select/Name) + base is_krw='N'
- [ ] 번호 역순·8컬럼·ReleaseDate +9h·EtailerSplit(is_krw)·batch_date
- [ ] 상단 total 개수 + 상품동기화 버튼
- [ ] 개별 가격동기화/전체 상품동기화 → alert + 재조회
- [ ] 50/page 페이징
