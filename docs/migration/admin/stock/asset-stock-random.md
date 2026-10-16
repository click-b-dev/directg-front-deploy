# Asset 랜덤박스 재고현황

## 원본
- 파일: `pc/_Admin_/goods/stock/asset_stock_random.php` (라이브) + `asset_stock_ps.php`(stock_chk 공유)
- 참조: [asset-stock](asset-stock.md)(#154 자매 — 동일 `getAssetList`)
- 도메인: `Admin::getAssetList/getAssetCodeList/getAssetCodeInfo`, `Asset::runAssetItemStock`

## 화면·플로우
- 진입 URL: `/goods/stock/asset_stock_random` — GET `page`, `asset_id`, `asset_name`, `publisherCd`, `productTypeCd`, `platformCd`
- **#154와 유사(동일 tbl_asset 데이터)**. 차이만 정리:
  - page title `Asset 랜덤박스 재고현황`
  - base 필터에 **`assetType='랜덤박스'` 고정**(랜덤박스 자산만)
  - 코드 드롭다운 **3종**(publisherCd/productTypeCd/platformCd) — **assetTypeCd 없음**(형식이 랜덤박스로 고정)
  - orderby **`stock asc, asset_id asc`**(#154는 `stock asc, update_dt desc`)
  - 안내문: `* 에셋 서버 실시간이 아닌 <strong>동기화된 재고</strong>입니다. (assetType='랜덤박스' 자산만 표시)`
  - **저재고 동기화 버튼 없음 · Asset 수정 버튼 없음**(개별 재고확인만)
  - 카운트 줄: `총 <strong id="total">{number_format}</strong> 개`(버튼 없이 plain col-12)
  - 목록 **9컬럼**(#154는 10 — 재고 버튼열 없이 재고확인이 비고열): Asset ID / Asset 이름 / Asset 유형(productType) / Asset 형식(assetType) / Asset 플랫폼(platform) / Asset 공급처(publisher) / 재고수량(number_format) / 업데이트 일자(update_dt) / 비고(**재고확인** 버튼, data-idx=asset_id)
  - **행 강조 없음 · colgroup 없음**(legacy getAssetList 계열, #154와 동일하게 자동 폭)
- 공통(= #154): breadcrumb 홈/재고/재고관리, 검색필터(asset_id text·asset_name text·코드 select), select2 native, ServerPagination(30/page), 재고확인 → asset_stock_ps.php `stock_chk` → LoadingOverlay → reload

## 데이터 (legacy)
- `getAssetList($page,$add_where,$orderby,$param)` (**#154와 동일 메서드**): `select * from tbl_asset where publisher<>'EA' and is_view='Y' {add_where} order by {orderby}`, **30/page**.
  - add_where: **`assetType='랜덤박스'`(고정)** + `asset_id='v'` / `asset_name like '%v%'` / `publisher=getAssetCodeInfo(publisherCd)` / `productType=getAssetCodeInfo(productTypeCd)` / `platform=getAssetCodeInfo(platformCd)`
  - orderby `stock asc, asset_id asc`.
- `getAssetCodeList('PUBL'|'PLFM'|'PDTP')` — **3종만**(ASTP 미사용). code_id/name, name asc.
- stock_chk(`asset_stock_ps.php`): `runAssetItemStock` → null 아니면 `tbl_asset`+`tbl_goods_item_delivery` 미러 갱신(null이면 기존유지). **batch 없음**.

## API 계약 (백엔드 전달)
- `GET /admin/goods/stock/asset-random` — 랜덤박스 자산 재고 목록 + 필터 코드
  - 쿼리: `page`, `asset_id`, `asset_name`, `publisherCd`, `productTypeCd`, `platformCd`
  - 응답 `200`:
    ```jsonc
    {
      "items": [
        { "asset_id": "string", "asset_name": "string", "productType": "string",
          "assetType": "string", "platform": "string", "publisher": "string",
          "stock": 0, "update_dt": "YYYY-MM-DD HH:MM:SS" }
      ],
      "pagination": { "total_results": 0, "total_pages": 0 },
      "codes": {
        "publisher": [{ "code_id": "string", "name": "string" }],   // 'PUBL'
        "product_type": [{ "code_id": "string", "name": "string" }], // 'PDTP'
        "platform": [{ "code_id": "string", "name": "string" }]      // 'PLFM'
      }
    }
    ```
  - **백엔드 책임**: base `publisher<>'EA' AND is_view='Y' AND assetType='랜덤박스'`, order `stock asc, asset_id asc`, 30/page. 필터 Cd→name 변환(getAssetCodeInfo, publisherCd→publisher·productTypeCd→productType·platformCd→platform). codes 3종. 관리자 세션 강제.
- `POST /admin/goods/stock/asset/check` — 개별 재고 동기화(**#154와 동일 엔드포인트**). body `{asset_id}`. (batch 없음)
- 에러: legacy PDOException 시 `Error!: <msg>`.

## 타겟 매핑
- 라우트: `routes/goods/stock/asset_stock_random.tsx`(search 6종)
- screens: `screens/asset-stock-random` / entities: `entities/asset-stock-random`(list+check)
- mock: `shared/mocks/handlers/asset-stock-random.ts`(+등록). check는 asset-stock 핸들러 공유(성공/무동작)
- 재사용: `shared/ui/ServerPagination`+`LoadingOverlay`. select2 native
- FSD: check 엔드포인트는 #154와 동일하나 entity 교차 import 금지 → 자체 fetcher(동일 URL) 정의

## Parity 체크리스트
- [ ] 검색필터(asset_id/asset_name + 코드 3종)·선택 유지·랜덤박스 고정
- [ ] 9컬럼·재고확인 비고열·행강조 없음·colgroup 없음
- [ ] **저재고 동기화·Asset 수정 버튼 없음**·재고확인(공유 엔드포인트)
- [ ] orderby stock asc/asset_id asc(백엔드)·ServerPagination 30/page·엣지(빈 목록)
