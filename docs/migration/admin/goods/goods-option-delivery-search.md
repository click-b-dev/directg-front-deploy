# 옵션상품 배송아이템 검색·추가 (#41, sales 분리 후속)

> 영역: 상품 > 옵션상품 관리 > 판매 설정의 **배송아이템 tfoot 검색·추가 subsystem**. #40(sales)에서 분리한 후속 단위. 연동시스템 5종(Asset·Ztorm·Genba·Vaultn·PointNexus) 검색 → 모달 → 추가.

## 원본
- 파일: `pc/_Admin_/goods/goods_option_sales_register.php`(tfoot 검색 UI + 5 모달 + JS) + `goods_option_ps.php`(asset/ztorm/genba/vaultn/pointnexus _search/_add). 처리 후 모두 `setGoodsOptionDeliveryItem`.
- 도메인: `Asset::runAssetDetail`, `Ztorm::runGetProduct`, `AdminGoods::searchGenbaProduct/searchVaultnProduct/searchPointNexusProduct`, `setGoodsOptionDeliveryItem(product_code,platform,id,name,publisher,order_system,type)`. asset_add는 추가 시 `upsertAsset`(tbl_asset 동기화).
- 참조: [goods-option-sales](goods-option-sales.md)(배송 목록·삭제).

## 화면·플로우
- 위치: sales 화면 배송아이템 카드 tfoot(전폭). 연동시스템 라디오(Asset=1/Ztorm=2/Genba=9/Vaultn=8/PointNexus=10) + 5개 검색 입력행(asset_find/ztorm_find/genba_find/vaultn_find/pointnexus_find, 각 input+버튼; PointNexus는 test/prod select 추가).
- 검색: 라디오 미선택 시 "연동시스템을 선택해 주세요." 알림, 입력 미입력 시 시스템별 알림. 검색 → HTML 행 반환 → 해당 시스템 **모달**에 표시(결과값은 편집 가능 input). 결과 없음 시 "검색된 결과가 없습니다." (PointNexus는 별도 안내문).
- 추가: 모달 행의 "○○ 추가" 버튼 → `{system}_add`(order_system은 **시스템 고정값**) → `setGoodsOptionDeliveryItem` → `location.reload`.
- 시스템별 검색 파라미터/필드:
  - **Asset**(1): `search_value`(Asset ID) → platform/productType/id/name(title|name)/publisher. add 시 tbl_asset upsert(백엔드).
  - **Ztorm**(2): `search_value`(ProductID) → Provider.Name/CategoryName/ID/Name/PublisherName(hidden)+Channel.
  - **Genba**(9): `sku` → ProtectionSystem/Sku/Name/Publisher (유형 없음).
  - **Vaultn**(8): `sku` → provider/sku/title/publisher/productType(hidden).
  - **PointNexus**(10): `productID`+`pn_mode`(test/prod) → platform/productID/genericName/publisher/type.

## 데이터 (legacy)
- 검색: 각 외부 API/DB 조회(백엔드 책임). 반환은 후보 1건(또는 없음).
- 추가: `setGoodsOptionDeliveryItem(product_code, item_platform, item_id, item_name, item_publisher, order_system, item_type)` INSERT tbl_goods_item_delivery. asset은 `upsertAsset` 선행.

## API 계약 (백엔드 전달)
- **`POST /admin/goods/options/:productCode/deliveries/search`** — body `{ system: "asset"|"ztorm"|"genba"|"vaultn"|"pointnexus", order_system, query, pn_mode? }` → `{ items: [{ item_platform, item_type, item_id, item_name, item_publisher, providers_channel }] }`. 미검색/없음 시 `items: []`. 백엔드: 시스템별 외부 조회.
- **`POST /admin/goods/options/:productCode/deliveries`** — body `{ order_system, item_platform, item_type, item_id, item_name, item_publisher, providers_channel }` → `{ success }`. 백엔드: setGoodsOptionDeliveryItem(+asset 시 upsertAsset). reload.
- (삭제는 #40 `DELETE .../deliveries` 재사용.)

## 타겟 매핑
- feature: `features/option-delivery-search`(tfoot 검색 UI + React 제어 모달, createPortal). sales 화면 배송아이템 tfoot에 배선.
- entities/goods-option 확장: `DeliverySystemKey`/`DeliverySearchRequest`/`DeliverySearchItem`/`AddDeliveryItemRequest` + `searchDeliveryItem`/`addDeliveryItem` + `useSearchDeliveryItem`(mutation)/`useAddDeliveryItem`(sales key invalidate).
- 모달: search-recommand(#14) React 제어 패턴 재사용(display:block + `.show` + backdrop). 결과 행 편집 input(legacy 재현). 통합 모달 1개(시스템별 컬럼 config).
- mock: 검색은 query 기반 후보 1건 생성, 추가는 deliveriesStore append.
- 시각: 라디오/검색행/모달 legacy 클래스 유지. product_viewer 시 추가 버튼 숨김.

## Parity 체크리스트
- [ ] tfoot 연동시스템 라디오 5종 + 검색 입력행 5종(PointNexus mode select)
- [ ] 검색 유효성(라디오/입력 알림), 결과 모달 표시(편집 input)
- [ ] 시스템별 order_system 고정 추가 → 배송목록 갱신(reload)
- [ ] product_viewer 추가 버튼 숨김
- [ ] 결과 없음 안내

## 보류/단순화
- 통합 모달 1개로 5 시스템 처리(legacy는 5 bespoke 모달) — 컬럼 config로 근사, 편집·추가 동작 동일. legacy의 일부 hidden 필드(ztorm publisher/vaultn·pointnexus type)는 편집 input으로 노출(값·전송 동일, 표시만 차이).
- 외부 API 실제 조회·asset upsert는 백엔드 책임(mock 후보 생성).
