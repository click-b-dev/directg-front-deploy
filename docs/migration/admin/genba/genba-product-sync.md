# Genba API - 상품 관리(카탈로그 현황)

## 원본

- 파일: `pc/_Admin_/goods/genba/genba_product_sync.php` (라이브, page_title "Genba 상품 관리"), mutation AJAX: `genba_api.php`
- 데이터: `AdminGoods::getGenbaProductList()` (`AdminGoods.php:802`), `getGenbaTitlePublisher()` (`:744`)
- 사이드바 라벨은 "Genba 카탈로그 현황"이나 page_title은 "Genba 상품 관리"(원문 유지).

## 화면·플로우

- 진입 URL: `/goods/genba/genba_product_sync?page&search_product_id&search_sku&search_name&search_publisher&PreLiveState`
- page_title `Genba 상품 관리` / breadcrumb: 홈 > 상품 > Genba 관리 > Genba 상품 관리

### 검색필터 (method=get)

- ProductID: text `search_product_id` → `a.ProductID='<v>'` (정확)
- Sku: text `search_sku` → `a.Sku='<v>'` (정확)
- Name: text `search_name` → `a.Name Regexp '<v>'`
- PreLiveState: radio 5개 (0 NO_PRE_LIVE / 1 LIVE / 2 PRE_LIVE_PENDING / 3 NO_RELATIONSHIP / 4 DECLINED) → `a.PreLiveState='<v>'`. **기본 선택 없음**(legacy 기본값 세팅 주석처리).
- Publisher: select `search_publisher`(옵션 = getGenbaTitlePublisher distinct) → `a.publisher Regexp '<v>'` (⚠️ title 화면은 `=`였으나 여기는 Regexp)
- 제출: "Genba 상품 검색"

### 목록

- 상단: `number_format(total) 개` + "Genba 상품 동기화" 버튼
- card-header `Genba 상품 현황`
- **행 색상(tr class)**: legacy는 ① `strpos(BlacklistCountryCodes,"KR")>0`이면 text-danger 설정 후 ② `strtotime(EndDate)>0`이면 text-danger/else "" 로 **무조건 덮어씀** → 실질적으로 **EndDate 유효 여부만** 행 색을 결정(①은 dead code, 게다가 base where가 KR 제외라 결과셋에 KR 없음). → 백엔드 `row_danger` 플래그로 재현.
- 12컬럼:
  1. 번호 = `total - (index + (page-1)*50)` (역순)
  2. ProductID `<br/>(Sku)`
  3. Name: `Name` + `IsBundle` + `<br/>` + badge(Publisher) + badge(RegionCode 대문자)
  4. ReleaseDate `<br/>(DigitalReleaseDate)<br/>(EndDate)` — 각 +9h
  5. PreReleaseDate: epoch('1970-01-01 09:00:00')가 아니면 +9h 표시. 추가로 `is_presale_available`이면 `<br/>(예약판매가능)`
  6. Srp = `number_format(Srp)`
  7. Wsp = `number_format(Wsp, 2)`
  8. EtailerSplitPercentage
  9. PreLiveState: `0`→라벨+`pre-live 요청`버튼(data-sku) / `1`,`2`→라벨만 / `3`,`4`→공란
  10. 가격업데이트: "가격동기화" 버튼(data-productid)
  11. 동기화: "동기화" 버튼(data-sku)
  12. 재고확인: `StockStatus=="0"`이면 "품절"(text-danger) `<br/>` + "재고확인" 버튼(data-sku)
- 페이징 50/page

## mutation (genba_api.php, 모두 alert)

- 전체 상품동기화(`#btn_genba_product_sync`): `api_type=product` → alert + reload
- 개별상품 동기화(`.btn_product_sync`): `api_type=product_sync, sku` → alert + reload
- 가격동기화(`.btn_price_sync`): `api_type=price, productid` → alert + reload
- 재고확인(`.btn_stock_sync`): `api_type=stock, sku` → alert + reload
- pre-live 요청(`.btn_prelive_request`): `api_type=prelive, sku` → alert, **reload 없음**(주석처리)

## 데이터 (legacy)

- `getGenbaProductList`: `select a.*,c.Srp,c.Wsp from genba_catalogue a inner join genba_publisher b on a.Publisher=b.publisher inner join genba_price c on a.Sku=c.Sku where b.status='Y' and (BlacklistCountryCodes NOT Regexp 'KR') and a.RegionCode<>'R' and a.RegionCode<>'LATAM' and a.RegionCode<>'TK' <add_where> order by DigitalReleaseDate desc,ReleaseDate desc` · 50/page

## API 계약 (백엔드 전달)

### `GET /admin/genba/products`

- 쿼리: `page`(1), `search_product_id`, `search_sku`, `search_name`, `search_publisher`, `PreLiveState`
- 백엔드 책임: base where(status='Y', BlacklistCountryCodes NOT Regexp 'KR', RegionCode NOT IN(R,LATAM,TK)) + add_where, 정렬/50 페이징. Name/publisher는 Regexp, ProductID/Sku/PreLiveState는 정확 일치. 날짜 표시 문자열은 +9h 적용, presale/row_danger 플래그는 서버 시간 기준 계산.
- 응답 `200`:
  ```
  { items: {
      ProductID, Sku, Name, IsBundle, Publisher, RegionCode,
      ReleaseDate, DigitalReleaseDate, EndDate,   // +9h "YYYY-MM-DD HH:mm:ss"
      PreReleaseDate,        // +9h 문자열, epoch(1970-01-01 09:00:00)면 ""
      is_presale_available,  // boolean (서버 now 기준)
      row_danger,            // boolean (strtotime(EndDate)>0)
      Srp,                   // number → number_format(Srp)
      Wsp,                   // number → number_format(Wsp,2)
      EtailerSplitPercentage,
      PreLiveState,          // "0".."4"
      StockStatus            // "0"이면 품절
    }[],
    pagination: { current_page, results_per_page: 50, total_results, total_pages }
  }
  ```

### mutation (POST, 응답 `{ message }`)

- `POST /admin/genba/product-sync` — `{}` (api_type=product) · 성공 후 재조회
- `POST /admin/genba/product-sync-item` — `{ sku }` (api_type=product_sync) · 성공 후 재조회
- `POST /admin/genba/price-sync` — `{ productid }` (api_type=price) · 성공 후 재조회 (#85와 공유)
- `POST /admin/genba/stock-sync` — `{ sku }` (api_type=stock) · 성공 후 재조회
- `POST /admin/genba/prelive-request` — `{ sku }` (api_type=prelive) · **재조회 없음**

## 타겟 매핑

- 라우트: `routes/goods/genba/genba_product_sync.tsx` → `/goods/genba/genba_product_sync`
- screens: `screens/genba-product-sync`
- entities: `genba` 확장 — `GenbaProductItem`, `GenbaProductSearch`, product/stock/prelive/product-item sync 훅(price-sync는 #85 것 재사용)
- mock: `handlers/genba` 확장

## Parity 체크리스트

- [ ] 검색필터 5종(+publisher Regexp, PreLiveState radio 기본 미선택)
- [ ] 12컬럼·번호 역순·복합 날짜셀(+9h)·PreReleaseDate epoch 처리·예약판매가능
- [ ] PreLiveState 분기(0 버튼/1·2 라벨/3·4 공란)·품절·row_danger(EndDate)
- [ ] mutation 5종(product/product_sync/price/stock/prelive), prelive만 재조회 없음
- [ ] 50/page
