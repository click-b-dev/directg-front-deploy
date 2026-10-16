# 어드민 — 재고 · 외부 공급사 연동

> 대상: `pc/_Admin_/` 재고(stock)·외부 공급사 연동 어드민 화면.
> 순수 카탈로그(title/option/group) 화면은 다른 문서에서 다룬다. 여기서는 연결 링크만 "연계"로 언급한다.
>
> 교차 참조(중복 서술 금지, 도메인 계약의 단일 진실 원천):
> - `../legacy-project/docs/STOCK-MANAGEMENT.md` — 재고 모델·차감 계약
> - `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md` — 주문 이행/키발급 흐름
>
> 공통 인프라(세션 `$_SESSION['admin']`/tbl_admin/dgkr, DB 2종 `$conn`·`$conn_dgkr`, admin_head+topbar+sidebar_stock+footer 레이아웃, jQuery/Bootstrap5, LoadingOverlay/escHtml/renderPaging, `*_list/_view/_ps/_json/_sync/_excel` 유형 관례)는 공통 문서를 따르며 페이지마다 반복하지 않는다.

---

## 개요

### 재고 관리의 두 축

directg 어드민의 재고 관리는 **두 층위**로 나뉜다.

1. **외부 공급사 실시간(API) 층** — 공급사 서버에 실시간 조회/주문. 재고를 자체 DB에 보관하지 않거나, 참조용으로만 동기화한다.
   - Asset(자체 API 서버), Vaultn, Genba, Ztorm, PointNexus.
2. **자체 DB 재고 층** — 동기화된 스냅샷 또는 자체 관리 재고를 `tbl_goods_item`/`tbl_goods_item_delivery`/`asset_*`/`*_catalogue` 테이블에 저장하고 어드민에서 조회한다.
   - 사이드바 "재고 관리(DB)" 그룹(Asset 재고현황, 옵션상품 재고현황, 할인 프로모션 재고현황, Asset 랜덤박스 재고현황).

Asset 재고현황 화면 안내문에 명시: *"에셋 서버 데이터가 아니고 동기화 된 데이터입니다."* — 즉 DB 층은 API 층의 스냅샷이다. 재고 0이어도 **자동 품절되지 않고 관리자 수동 처리**가 원칙(대시보드 안내문).

### order_system 코드 ↔ 공급사 매핑

주문 이행은 배송상품(`tbl_goods_item_delivery`)의 `order_system` 코드로 공급사를 구분한다. 이 코드는 `OrderFulfillment` 디스패처(`src/classes/OrderFulfillment.php`)가 핸들러 클래스로 위임하는 키이기도 하다.

| order_system | 공급사 | 이행 핸들러 클래스 | 재고 모델 |
|:---:|---|---|---|
| 1 | **Asset** | `OrderFulfillment_Asset` | 자체 API 서버 키풀(reserve 방식) |
| 2 | **Ztorm** | `OrderFulfillment_Ztorm` | 공급사 실시간, 재고체크 페이지 없음 |
| 8 | **Vaultn** | `OrderFulfillment_Vaultn` | 공급사 재고(owned/total) 실시간 |
| 9 | **Genba** | `OrderFulfillment_Genba` | 공급사 상품 상태(PreLiveState)·webhook |
| 10 | **PointNexus** | `OrderFulfillment_PointNexus` | 공급사 오퍼레이션(reveal/book) 기반 |

- 디스패처: `OrderFulfillment::processItem($order_system, ...)` 이 코드별 핸들러 `process()` 를 호출한다. 매핑 없는 코드는 `order_status=1, send_status=fail` 반환.
- PointNexus("10")는 조건부로만 핸들러 등록(생성자에서 `$this->handlers["10"]` 조건 추가).
- 성공 결과: 선불(pay_type) 시 `order_status=3/pending`, 그 외 `order_status=2/delivered` (`OrderFulfillment::successResult`).

### stock_check_link 라우팅 (`lib/lib_func.php`)

`stock_check_link($order_system, $item_id)` 는 배송상품 item_id 기준으로 공급사별 재고체크 페이지 URL을 반환한다(대상 없으면 `''`).

| order_system | 반환 링크 |
|:---:|---|
| 1 (Asset) | `asset_stock_link()` → `/_Admin_/goods/stock/asset_stock.php?asset_id={item_id}` |
| 8 (Vaultn) | `/_Admin_/goods/vaultn/vaultn_catalogue.php?search_sku={item_id}` |
| 9 (Genba) | `/_Admin_/goods/genba/genba_product_sync.php?search_sku={item_id}` |
| 10 (PointNexus) | `/_Admin_/goods/pointnexus/pointnexus_catalogue.php?keyword={item_id}` |
| 2 (Ztorm) 및 기타 | `''` (재고체크 페이지 없음) |

관련 헬퍼(같은 파일): `goods_link($product_code)`(옵션상품 상세), `asset_link($item_id)`(옵션상품 재고현황 Asset ID 검색), `member_link($m_no)`, 표시 헬퍼 `soldout_badge($soldout)`, `pct($n,$d)`.

---

## 메뉴 트리 (`inc/sidebar_stock.php` 기준)

주석 처리(비활성)된 항목은 `[숨김]`으로 표기한다.

```
재고 대시보드                         goods/stock/dashboard_stock.php
Asset 서버 관리(API)
├─ Asset 현황                        goods/asset/asset_list.php
├─ Asset 등록                        goods/asset/asset_register.php
├─ [숨김] Asset ID조회               goods/asset/asset_search.php
├─ Asset 예약현황                    goods/asset/asset_reserve_list.php
├─ Asset 다운로드                    goods/asset/asset_download_list.php
├─ [숨김] 공급처별 Asset현황         goods/asset/asset_publisher.php
├─ Asset Code 현황                   goods/asset/asset_code_list.php
└─ Asset Code 등록                   goods/asset/asset_code_register.php
[숨김] 구매관리 (발주/입고/반품 — 전체 그룹 주석처리)
Vaultn 재고(API)
└─ Vaultn 재고현황                   goods/stock/vaultn_stock.php
재고 관리(DB)
├─ Asset 재고현황                    goods/stock/asset_stock.php
├─ 옵션상품 재고현황                 goods/stock/goods_option_stock.php
├─ 할인 프로모션 재고현황            goods/stock/goods_promotion_stock.php
└─ Asset 랜덤박스 재고현황           goods/stock/asset_stock_random.php
Genba Webhook Log
└─ availability log                  goods/stock/genba_avaliability.php
```

- 사이드바에 노출되지 않지만 공급사 어드민 진입점으로 실제 운용되는 화면군: `goods/genba/*`, `goods/vaultn/*`, `goods/ztorm/*`, `goods/pointnexus/*`, `goods/grac/*`, `steam/*`, `youtube/*`. 이들은 `sidebar_goods.php`(다른 문서 담당) 또는 직접 URL/코드 링크로 진입한다. 예: PointNexus 화면은 `$page_title`만 있고 대부분 `_inc.php` 공통 헬퍼를 사용, Genba/GRAC 화면은 `$topmenu['goods']`+`sidebar_goods.php`를 사용한다.

---

## 공급사별 페이지 정의

각 화면: **유형 / 기능 / 정책·규칙 / 데이터소스(클래스·테이블·외부API) / 파라미터 / 연계 / 참조**.
`item_id`는 배송상품(`tbl_goods_item_delivery.item_id`)를 가리킨다.

### Asset (order_system=1) / `goods/asset/`, `goods/stock/`

Asset은 **자체 API 서버**(`http://175.125.94.163:20080/api`, `src/classes/Asset.php`)로 키풀을 관리한다. 인증은 `get()/post($url, ..., $asset_user, ...)` 에서 asset_user 파라미터를 함께 넘기는 방식(별도 토큰 상수는 코드상 미노출, 서버 IP+user 기반). AdminAsset(`src/classes/AdminAsset.php`)은 다운로드 예약 등 DB 측 보조.

#### Asset 현황 — `goods/asset/asset_list.php`
- **유형**: 목록(+AJAX). 실제 데이터는 `asset_ps.php`(mode=`asset_list`/`asset_search`) AJAX 로 렌더.
- **기능**: Asset 검색(이름/ID/공급처/유형/형식/플랫폼), Asset 수정/삭제, 키 사용현황(`asset_item_list.php`), 키 등록(모달 → mode=`asset_item_register`), 기초정보 등록(mode=`asset_inventory_qty`).
- **정책**: 화면 안내 *"동기화 DB가 아닌 에셋 서버 실시간(API) 데이터"*. AssetID를 이름보다 우선검색(assetid>0 이면 mode=`asset_search`). 검색 제출 시 page=1 리셋. 키 등록 후 모달 유지(재확인 목적, 새로고침 안 함). Asset 삭제는 하위 Item 존재 시 거부될 수 있음(서버 결과 alert).
- **데이터소스**: `Asset::runAssetList/runAssetDetail/runAssetItemRegister/runAssetDelete`, `Admin::getAssetInfo`. 코드 그룹 `PUBL/PLFM/PDTP/ASTP` (`Admin::getAssetCodeList`).
- **파라미터(AJAX)**: mode, page, size(30), name, productTypeCd, assetTypeCd, platformCd, publisherCd, asset_id.
- **연계**: `asset_modify.php`, `asset_item_list.php`. 재고 수량은 [재고 관리(DB) > Asset 재고현황]에서 확인.

#### Asset POST 처리 — `goods/asset/asset_ps.php`
- **유형**: `_ps`(다중 mode 라우터, 25KB). API 서버 호출을 프록시.
- **기능(mode)**: `asset_list`, `asset_search`, `asset_detail`, `asset_item_list`, `asset_register`, `asset_modify`(코드→값 변환 후 DB에도 반영), `asset_item_register`(키 등록, 등록 개수 반환), `assets_delete`, `asset_inventory_qty`(기초정보), Asset Code CRUD(`code_list/register/modify/delete`, JSON), 다운로드 예약(`AdminAsset::setAssetDownloadRegister/setAssetDownloadFinish/getAssetDownloadList`).
- **데이터소스**: `Asset`, `AdminAsset`, `Admin::getAssetInfo/getAssetCodeInfo`.
- **참조**: 키발급/재고차감 계약은 `ORDER-WORKFLOW-AUDIT.md`.

#### Asset 재고현황 — `goods/stock/asset_stock.php`
- **유형**: 목록(+AJAX 재고확인).
- **기능**: 동기화된 Asset 재고(수량) 목록. 행별 [재고확인] 버튼(mode=`stock_chk`), [저재고 동기화](mode=`stock_chk_batch`, thr=30 — 재고 30 미만 품목만 에셋 서버와 동기화).
- **정책**: *"에셋 서버 데이터가 아니고 동기화 된 데이터"*, 정렬 `stock asc, update_dt desc`.
- **데이터소스**: `Admin::getAssetList(page, where, orderby, param)`, POST 처리 `asset_stock_ps.php`. 코드 그룹 `PUBL/PLFM/PDTP/ASTP`.
- **파라미터**: asset_id, asset_name, productTypeCd, assetTypeCd, platformCd, publisherCd, page.
- **연계**: `stock_check_link(1, item_id)` 진입점. `../asset/asset_modify.php`.

#### Asset 재고 POST — `goods/stock/asset_stock_ps.php`
- **유형**: `_ps`. mode=`stock_chk`(단건 서버 재고→DB 갱신), `stock_chk_batch`(thr 미만 일괄). 외부: `Asset::runAssetStock/runAssetSoldOut/runAssetSoldOutBatch`.

#### 옵션상품 재고현황 — `goods/stock/goods_option_stock.php`
- **유형**: 목록. **기능**: 옵션상품(`tbl_goods_item`) 기준 재고 조회(Asset 매핑 포함). 검색키: 옵션상품명/코드/Asset ID/Asset 이름.
- **데이터소스**: `AdminGoods::getGoodsOptionStockList(page, where, orderby, param, 30)`, 정렬 `stock asc, item_name asc`. 다운로드 `goods_option_stock_download.php`.
- **연계**: `asset_link()`의 검색 목적지. 이 화면이 DB 재고 층의 중심.

#### 할인 프로모션 재고현황 — `goods/stock/goods_promotion_stock.php`
- **유형**: 목록. 할인 프로모션 대상 상품의 재고 현황. 데이터소스: AdminGoods(프로모션 재고 쿼리). (카탈로그·프로모션 정의는 프로모션 문서 담당, 여기선 재고 관점만.)

#### Asset 랜덤박스 재고현황 — `goods/stock/asset_stock_random.php`
- **유형**: 목록. 랜덤박스 상품의 구성 Asset 재고 현황.

#### Asset 대시보드 — `goods/stock/dashboard_stock.php`
- **유형**: 대시보드. 3개 카드: ①Asset·판매중&재고0(미품절 강조 `table-danger`), ②Asset 외·판매중&품절(order_system 표시), ③Asset·판매중아님&재고0.
- **데이터소스**: `AdminGoods::getGoodsOptionStockZeroList`(status 0=판매중/그외=중지·대기), `getGoodsOptionSellingSoldoutList`. `Admin::getProductStatus/getOrderSystem`.
- **정책**: 판매종료(status=3) 제외. 재고0 자동 품절 안 함(수동). 판매중&재고0은 미품절(soldout=N) 우선 정렬(최우선 점검 대상).

#### 기타 Asset 화면 (사이드바 노출)
- `asset/asset_register.php` — Asset 등록 폼(→ asset_ps mode=asset_register).
- `asset/asset_modify.php` — Asset 수정 폼(→ mode=asset_modify).
- `asset/asset_item_list.php` — "Asset Item(키) 현황". 특정 asset의 키 목록.
- `asset/asset_reserve_list.php` — "Asset 예약현황". `Asset::runReserveList`. 주문 시 키 예약(reserve) 내역.
- `asset/asset_download_list.php` / `asset/asset_download.php` — "Asset 다운로드(반품출고)". `AdminAsset` 다운로드 예약. mode 다운로드 예약/완료.
- `asset/asset_code_list.php` / `asset_code_register.php` — Asset Code(PUBL/PLFM/PDTP/ASTP) CRUD, JSON.
- `asset/asset_item_list.php`, `asset/asset_log.php`(Asset 로그).
- `asset/asset_search.php`(숨김), `asset/asset_publisher.php`(숨김·공급처별).

#### `goods/stock/` DB 재고·발주 화면 (대부분 사이드바 숨김/비활성 구매관리)
- `asset_stock_info.php`(Asset 통합 재고현황), `asset_stock_basic.php`(기초재고등록), `asset_stock_in.php`(입고현황)·`asset_stock_in_confirm.php`(입고처리)·`asset_stock_in_register.php`(입고등록), `asset_stock_out.php`(출고현황)·`asset_stock_out_register.php`(출고요청등록)·`asset_out_request.php`(출고요청등록), `asset_stock_move.php`(재고이동현황)·`asset_stock_move_register.php`(재고이동등록), `placing_order.php`(발주현황)·`placing_order_register.php`(발주서 등록), `asset_stock_ps.php`(재고 POST). `asset_stock_publisher.php`·`placing_order_asset.php`는 0바이트(빈 파일).

### Ztorm (order_system=2) / `goods/ztorm/`

Ztorm은 **XML API**(`https://api.exertisztorm.net/api/2.0/`, `src/classes/Ztorm.php`). 인증: 요청 XML에 `<Identify><StoreID>{store_id}</StoreID><Password>{api_key}</Password></Identify>` 매 요청 삽입(api_key 하드코딩 `7qd0O2v8BDDx`). `curlPost($method, $params)` 로 XML POST. `stock_check_link`에 재고체크 페이지 **없음**(빈 문자열 반환).

#### Ztorm 카탈로그 현황 — `ztorm_catalogue.php`
- **유형**: 목록. Ztorm 상품 카탈로그 조회. `Ztorm::runGetProducts`.
#### Ztorm 퍼블리셔 현황 — `ztorm_publisher_list.php`
- 목록. `Ztorm::runGetPublishers($page)`.
#### Ztorm 퍼블리셔별 상품동기화 — `ztorm_publisher_goods.php` / `ztorm_publisher_goods_sync.php`
- **유형**: 목록 + `_sync`. `ztorm_publisher_goods_sync.php`가 `Ztorm::runGetProducts($params)` 결과를 받아 DB 반영(퍼블리셔 단위 상품 동기화).
#### Ztorm 프로모션 현황 — `ztorm_promotion.php`
- 목록. `Ztorm::runGetDiscounts` 계열.
#### Ztorm 연결 확인 — `ztorm_ping.php`
- `_ping`. `Ztorm::runPing()`(Identify XML 왕복 검증).
#### `ztorm_api.php`
- API 호출 프록시/테스트 엔드포인트(호출부 브릿지).
- **주문 이행 관련(참조)**: `Ztorm::runZtormOrder/runZtormBundleOrder`(basket 생성→구매), `runGetInstallKeys`(키수령), `runRefundCustomerProduct`(환불). 계약은 `ORDER-WORKFLOW-AUDIT.md`.

### Vaultn (order_system=8) / `goods/vaultn/`, `goods/stock/vaultn_stock.php`

Vaultn은 **인증서(PKCS#12) 기반 JWT** API(`https://api.vaultn.com/api/v1`, `identity.vaultn.com/{vaultnGUID}`, `src/classes/Vaultn.php`). `ReadCertificate()` → `CreateJwt(validFrom, validTo, pkey)` 로 JWT 서명, `$_SESSION['vaultn']['accessToken']` 캐시. 인증서 비밀번호 하드코딩(`certificatePassword`). 재고는 owned/total + connection 공유 개념.

#### Vaultn 재고확인 — `goods/stock/vaultn_stock.php` (사이드바)
- **유형**: 목록(서버측 렌더 + 클라 필터/정렬/페이징).
- **기능**: `Vaultn::runVaultnStockAll(pageSize=1000, maxPages=100)` 로 전체 재고 로드. sku↔판매중 옵션상품 매핑을 1쿼리 선로드(`tbl_goods_item_delivery` order_system='8' inner join `tbl_goods_item`, status<>'3'). 재고 0 & 판매중·미품절 옵션 존재 시 행 강조(위험). connection별 reserved/network/total 세부 테이블.
- **파라미터**: (클라) search, mappedFilter(all/mapped/unmapped), sortOrder(stock_asc 등), pageSize.
- **정책**: totalAvailableUnits = owned + connection 공유. 일부만 조회 시 loadedCount 경고.
- **연계**: 옵션 → `goods_option_sales_register.php`.
- **주의**: 별도 `goods/vaultn/vaultn_stock.php`(4.5KB)도 존재(중복명, 아래 vaultn 디렉토리 화면군의 일부).

#### `goods/vaultn/` 화면군
- `vaultn_catalogue.php` — "Valutn 카탈로그 현황"(`stock_check_link(8)` 진입점, `?search_sku=`). DB `vaultn_catalogue` 조회.
- `vaultn_sync_batch.php` — `_sync` 배치. `Vaultn::runConnectionProduct($connectionGuid, $page)` 결과를 `vaultn_catalogue` 테이블에 INSERT … ON DUPLICATE KEY UPDATE(productGUID/sku/srp/purchasePrice/currency 등, batch_date/update_date 관리).
- `vaultn_connection.php`, `vaultn_connection_product.php`, `valutn_connection_product_view.php`, `vaultn_connection_price.php`, `vaultn_connection_pricelist.php`, `vaultn_connection_promotion.php`, `vaultn_connection_promotion_view.php` — 커넥션/가격/프로모션 조회(각 `runConnection*`).
- `vaultn_product_view.php`(`valutn_product_view.php`), `vaultn_promotion.php` — 상품/프로모션 상세.
- `vaultn_publisher`(agreement) 계열: `runAllAgreementsRetrieve/runAgreementRetrieve`.
- `vaultn_cert.php` — "Vaultn 인증서 관리". PKCS#12 인증서 확인.
- `vaultn_ping.php` — 연결 확인(`runVaultnPingGet/Post`).
- `vaultn_api.php` — API 프록시.
- **주문 이행(참조)**: `runOrderCreate/runOrderComplete/runCancelOrder`. `ORDER-WORKFLOW-AUDIT.md`.

### Genba (order_system=9) / `goods/genba/`, `api/genba/`, `goods/stock/genba_avaliability.php`

Genba는 **인증서 JWT + Microsoft OAuth2 토큰** 이중 인증(`src/classes/Genba.php`; 별도 레거시 `lib/genba.class.php`도 존재). prod baseUrl `https://etailer-api.genbadigital.io`(sandbox `https://sandbox.genbadigital.io`), api_version 기반 ping, `identifierUrl = https://aad-snd.genbadigital.io/{customerAccountNumber}`, `authUrl = https://login.microsoftonline.com/{tenantID}`, `audience = authUrl/oauth2/token`. api_key 하드코딩. 생성자 `new Genba($mode)`(sandbox/prod 분기). 상품 상태 PreLiveState(0 NO_PRE_LIVE / 1 LIVE / 2 PENDING / 3 NO_RELATIONSHIP …).

#### Genba 상품 관리 — `goods/genba/genba_product_sync.php`
- **유형**: 목록(`stock_check_link(9)` 진입점, `?search_sku=`).
- **기능**: `AdminGoods::getGenbaProductList(page, where, orderby, param)` 로 DB의 Genba 상품 목록. 필터: ProductID/Sku/Name(Regexp)/publisher/PreLiveState. 정렬 `DigitalReleaseDate desc, ReleaseDate desc`.
- **주의**: `$topmenu['goods']` + `sidebar_goods.php`(재고 사이드바 아님).
#### 그 외 `goods/genba/`
- `genba_api.php`(20KB) — API 프록시/테스트. directg.net 상품뷰 URL 생성(game/dlc/bundle_view). `runGenbaGetProducts/GetProduct/GetPrices/GetPromotions/GetProductStockStatus/SubmitPreliveApprovalRequest` 등.
- `genba_title.php`("Genba 타이틀 현황"), `genba_publisher.php`("Genba 퍼블리셔 관리"), `genba_price_sync.php`("Genba 가격 관리", `_sync`), `genba_promotion_sync.php`("Genba 프로모션 조회/동기화").
- `genba_catalogue_sync.php`(792B, 카탈로그 동기 트리거), `genba_cert.php`(인증서), `genba_ping.php`(연결 테스트, `runGenbaPingAsync`).
- `genba_ps.php` — `_ps`. 예: mode=`publisher_config`(genba_publisher 테이블 relationship status upsert), `download` 등.

#### Genba availability webhook log — `goods/stock/genba_avaliability.php` (사이드바)
- **유형**: 목록. `genba_webhook_log`(webhook_type='avaliability') ⨝ `tbl_goods_item_delivery`(sku=item_id). `AdminStock::getGenbaAvaliabilityLog` (페이지당 20). AdminStock 클래스는 이 한 메서드만 보유.

#### Genba Webhook 수신 엔드포인트 — `api/genba/*.php`
- **유형**: 외부→내부 webhook 리시버(JSON). 공통 include: `_engine/dbconn.php`, `lib/genba.class.php`(레거시 Genba 클래스), `log4php`. rawBody(`php://input`) JSON 파싱 후 `genba_webhook_log` 에 로그 insert, 응답 JSON echo.
- `webhook_avaliability.php` — availability 수신. `genba_webhook_log` insert + **재고 소진 시 `UPDATE tbl_goods SET flag=4, soldOutFl='y' WHERE product_id=:sku AND flag=0`**(품절 자동 반영). 상품 단위 품절 처리.
- `webhook_backorder.php`/`webhook_backorder_batch.php`, `webhook_preorder.php`/`webhook_preorder_batch.php` — 백오더/예약주문 상태.
- `webhook_srp_change.php`(권장소비자가 변경), `webhook_product_released.php`/`webhook_product_ended.php`(출시/단종), `webhook_metadata_update.php`, `webhook_currency_remove.php`, `webhook_invoice.php`, `webhook_relationship_approve.php`/`webhook_relationship_billing_change.php`/`webhook_relationship_restriction_change.php`.
- **마이그레이션 주의**: 이 엔드포인트들은 외부에서 호출되는 공개 URL이므로 인증 방식·경로가 계약이다. 인증가드가 세션과 다를 수 있음(외부 서버 호출).

### PointNexus (order_system=10) / `goods/pointnexus/`

PointNexus는 **OAuth2 client_credentials** API(`https://api.point.nexus/v1`, 토큰 `https://nexus.auth.encaps.io/oauth2/access_token`, `src/classes/PointNexus.php`). client_id/secret 하드코딩(prod/test 분기, `new PointNexus($mode)`, DEFAULT_MODE='prod'). `getAccessToken()` → `$_SESSION['pointnexus'][$mode]['access_token']` 캐시. 화면 공통 헬퍼는 `goods/pointnexus/_inc.php`(pn_default_mode/pn_normalize_mode/pn_get_lang/pn_fmt_price/pn_relevant_currencies=KRW·JPY·USD/pn_relevant_countries=KR·JP·WW·ROW 등).

#### 카탈로그
- `pointnexus_catalogue.php` — "카탈로그 (DB)" (`stock_check_link(10)` 진입점, `?keyword=`). `pointnexus_catalogue` 테이블 조회.
- `pointnexus_catalogue_sync.php` / `pointnexus_catalogue_sync_batch.php` — `_sync`. `PointNexus::runProduct(offset, limit, filters)` → `pointnexus_catalogue` INSERT … ON DUPLICATE KEY UPDATE(productID 기준). 단종 판정: 같은 회차 배치가 동일 `update_date`를 박아 `update_date < MAX(update_date)` 인 행을 단종으로 인덱싱. 진행률/오프셋 페이지 기반. mode(test=Sandbox / prod=Production) 표시.
- `pointnexus_catalogue_map.php` / `pointnexus_catalogue_map_ps.php` — 카탈로그 ↔ 옵션상품 매핑(`_ps` 저장).
- `pointnexus_product.php`("판매 가능 상품 목록")/`pointnexus_product_view.php`("상품 상세", `runProductRetrieve`)/`pointnexus_product_type.php`("상품 타입", `runProductType`)/`pointnexus_capsule.php`("캡슐 조회", `runCapsule`).

#### 프로모션/파트너/로그
- `pointnexus_promo.php`/`pointnexus_promo_view.php` — 프로모션 캠페인 목록/상세(`runPromo/runPromoFilter/runPromoRetrieve`).
- `pointnexus_partner.php`/`pointnexus_partner_view.php` — 파트너 목록/상세(`runPartner/runPartnerRetrieve`).
- `pointnexus_activity_log.php`/`pointnexus_activity_log_view.php` — 활동 로그(`runActivityLog/Retrieve`).
- `pointnexus_operation.php` — 오퍼레이션 조회(`runOperation/runOperationReveal/runOperationCancel`).
- `pointnexus_ping.php` — 인증 상태 확인(`runTest`).

#### 주문/취소 처리 (재고·이행 직결)
- `pointnexus_book_confirm.php`/`pointnexus_book_confirm_ps.php` — "Book Confirm". 예약(book) 확정(`runBookConfirm`).
- `pointnexus_cancel_verify.php`/`pointnexus_cancel_verify_batch.php` — "취소 검증(cancel_pending)". 비동기 취소 상태 확정. **cron 미사용** — 관리자 수동 실행 페이지 + order_view 자동검증으로 트리거. 로그 append 아닌 UPDATE(status/update_date, raw_response에 accept+verify 병합).
- `pointnexus_vcnt_cancel.php`/`pointnexus_vcnt_cancel_batch.php` — "VCNT 미입금 만료 취소". booked→`runBookCancel`, pending_reveal·sold→`runOperationCancel`. 성공 시 `OrderFulfillment_PointNexus::insertLogRow(...'canceled')` append(어드민 취소 `order_ps.php` case "PointNexus"와 동일 로직). parent_operationID로 원본 링크.
- **참조**: 취소/미입금 만료 정책은 `ORDER-WORKFLOW-AUDIT.md` 및 결제 계약 문서.

### GRAC (게임물관리위원회 심의) / `goods/grac/`

order_system과 무관한 **게임 심의정보** 연동(재고 아님, 카탈로그 부가정보). 외부: `https://www.grac.or.kr/WebService/GameSearchSvc.asmx/game`(SOAP-style GET, entname/startdate/enddate/display/pageno). cURL 직접 호출(User-Agent 랜덤, SSL verify off, SSLVERSION=6).

- `grac_list.php` — "심의정보 현황". `grac_list` 테이블 조회. 필터: rateno/platform/gametitle/entname/orgname/givenrate. 플랫폼 코드 주석(ONES/KAGA/SECL/MSFT/SSCP/SIEK/NTDO/GOOG/OCUL/EPIC/AAPL).
- `grac_register.php` — "심의정보 등록". rateno 조회 후 수동 등록 폼(→ grac_ps).
- `grac_ps.php` — `_ps`. mode=`grac_batch`: GRAC API 호출 → `grac_list` INSERT … ON DUPLICATE KEY UPDATE(rateno 키), `grac_entname` tcount/batch_date 갱신. 수동 등록 mode도 upsert.
- `grac_batch.php` — "심의정보 동기화". entname 목록 각 행 [동기화] 버튼 → grac_ps(mode=grac_batch) AJAX.
- `grac_ps_batch.php`, `grac_ps_batch2.php` — 배치 변형(일괄 entname 순회).
- **연계**: `title_grac_chk.php`/`title_grac_register.php`(타이틀에 심의정보 연결, 카탈로그 문서 담당).

### Epic / `goods/epic/`

- **디렉토리 비어 있음**(php 파일 없음). Epic 연동은 별도 화면이 아니라 Genba API를 경유(`Genba::runGetCheckPurchasability($sku, $epicAccountId)`, GRAC 플랫폼 코드 EPIC)로 처리되는 것으로 **추정**. 독립 어드민 화면은 현재 없음.

### Steam / `steam/`

Steam은 **공개 API·스크래핑** 기반 카탈로그 메타 수집(재고/order_system 아님, 상품 정보 소싱 도구). 인증 없음. 외부: `https://store.steampowered.com/api/appdetails`(appids, l=koreana), `https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/*.jpg`(이미지), 리뷰 API, metacritic. `src/classes/Steam.php` 및 `steam/python/*.py`(BeautifulSoup 스크래핑) 병용.

#### 목록/조회 화면
- `steam_apps_list.php`(31KB, "스팀 Apps 검색") / `steam_apps_list_all.php` — 앱 검색·정보 조회 진입(각종 get_* AJAX 호출 허브).
- `steam_apps_comingsoon.php`("출시예정 App"), `steam_apps_ranking.php`("평가수 순위"), `steam_game_list.php`("Game 현황"), `steam_dlc_list.php`("DLC 현황"), `steam_package_list.php`("Package 현황"), `steam_review_list.php`("평가 현황").
- `steam_app_meta.php`(앱 메타), `steam_app_delete.php`/`steam_package_delete.php`(삭제).

#### 정보 수집 엔드포인트(AJAX/스크립트)
- `get_steam_app_info.php`(19KB) / `get_steam_app_info_batch.php`(17KB) — appdetails 호출 → DB 저장. 이미지 URL(header/capsule/library) 구성.
- `get_steam_game_info.php`, `get_steam_package_info.php`/`get_steam_package_info_all.php`, `get_steam_review.php`, `get_applist.php`/`get_gamelist.php`/`get_dlclist.php`.
- 이미지 다운로드: `steam_image_download.php`/`steam_image_download2.php`, `steam_package_image_download.php`, `steam_screenshot_download.php`.
- `metacritic.php`(+`metacritic.json` 177KB 데이터), `steam_test.php`(테스트).

#### `steam/python/` (CGI 파이썬 스크래퍼)
- `steam_app.py`(store.steampowered.com/app/{appid}?l=koreana 페이지 파싱, birthtime 쿠키로 연령확인 우회, BeautifulSoup), `steam_bundle.py`, `steam_package.py`, `test.py`. Content-Type cp949.
- **마이그레이션 주의**: 파이썬 CGI 스크래퍼는 Next.js로 직접 이관 불가 — 별도 수집 서비스/서버리스로 대체하거나 Steam 공식 API로 대체 검토 필요. 연령확인 쿠키·인코딩(cp949) 재현 필요.

### Youtube / `youtube/`, `api/youtube/`

Youtube Data API 연동(상품 홍보 영상 메타, 재고 아님).
- `youtube/youtube_video_list.php`("Youtube 비디오 현황"), `youtube/youtube_channel_list.php`("Youtube 채널 현황"), `youtube/youtube_api.php`(API 프록시).
- `api/youtube/youtube_api.php`, `api/youtube/youtube_search.php`(검색 엔드포인트).

### 기타 API 루트 — `api/`
- `api/naverpay/test.php`(631B) — 네이버페이 테스트(결제 문서 담당 영역, 재고 무관).
- `api/genba/*`(위 Genba 참조), `api/youtube/*`(위 Youtube 참조).

---

## 외부 연동 요약표

| 공급사 | 대표 어드민 경로 | 외부 API / 엔드포인트 | 인증 | 동기화 방식 | 관련 클래스 |
|---|---|---|---|---|---|
| Asset (1) | goods/asset/asset_list.php, goods/stock/asset_stock.php | `http://175.125.94.163:20080/api` | asset_user(요청 파라미터), 서버 IP 화이트리스트(추정) | 실시간 API + 저재고(thr=30) DB 동기화 | `Asset`, `AdminAsset`, `AdminStock` |
| Ztorm (2) | goods/ztorm/ztorm_catalogue.php | `https://api.exertisztorm.net/api/2.0/` (XML) | Identify(StoreID+Password api_key 하드코딩) | 퍼블리셔별 상품 `_sync` (DB 반영) | `Ztorm` |
| Vaultn (8) | goods/vaultn/vaultn_catalogue.php, goods/stock/vaultn_stock.php | `https://api.vaultn.com/api/v1` | PKCS#12 인증서 → JWT(세션 캐시) | 재고 실시간(runVaultnStockAll) + 카탈로그 `_sync`(vaultn_catalogue upsert) | `Vaultn` |
| Genba (9) | goods/genba/genba_product_sync.php, api/genba/* | `https://etailer-api.genbadigital.io` + MS OAuth2 | 인증서 JWT + `login.microsoftonline.com` 토큰 + api_key | 상품/가격/프로모션 `_sync` + **webhook 수신(genba_webhook_log)** → 품절 자동반영 | `Genba`(+ 레거시 `lib/genba.class.php`) |
| PointNexus (10) | goods/pointnexus/pointnexus_catalogue.php | `https://api.point.nexus/v1` (토큰 `nexus.auth.encaps.io`) | OAuth2 client_credentials(세션 캐시, prod/test) | 카탈로그 배치 `_sync`(offset 페이지, update_date 단종판정) + 취소검증 배치 | `PointNexus`, `OrderFulfillment_PointNexus` |
| GRAC (심의) | goods/grac/grac_list.php | `https://www.grac.or.kr/WebService/GameSearchSvc.asmx/game` | 없음(공개, UA 랜덤·SSL verify off) | entname별 `_batch` 조회 → grac_list upsert | (직접 cURL, `Admin::getGRACEntnameList`) |
| Steam (소싱) | steam/steam_apps_list.php | `store.steampowered.com/api/appdetails`, steamstatic CDN, python 스크래핑 | 없음(공개, 연령쿠키) | get_* 수동/배치 수집 → DB, 이미지 다운로드 | `Steam`, `steam/python/*.py` |
| Youtube (소싱) | youtube/youtube_video_list.php | Youtube Data API | API 키(추정) | 수동 조회/등록 | (youtube_api.php) |

---

## 변형/테스트 파일

- `steam/steam_test.php`, `steam/python/test.py`, `api/naverpay/test.php` — 테스트/실험 파일.
- `steam/get_steam_app_info_batch.php`, `steam/get_steam_package_info_all.php`, `steam/steam_apps_list_all.php`, `steam/steam_image_download2.php` — `_all`/`_batch`/`2` 변형(일괄/재시도 변형).
- `goods/pointnexus/*_batch.php`(catalogue_sync_batch, cancel_verify_batch, vcnt_cancel_batch), `goods/grac/grac_ps_batch.php`·`grac_ps_batch2.php` — 배치 변형.
- 빈 파일(0바이트, 미구현): `goods/stock/asset_stock_publisher.php`, `goods/stock/placing_order_asset.php`.
- 사이드바 숨김(주석): `goods/asset/asset_search.php`, `goods/asset/asset_publisher.php`, "구매관리" 그룹 전체(발주/입고/반품).
- 클래스 변형: `src/classes/Genba2.php`(Genba 대체/실험본, src/classes 병존), `src/classes/AssetJP.php`(일본 Asset 변형). `pc/_Admin_/lib/genba.class.php`(webhook용 레거시 Genba 클래스, src/classes/Genba.php와 별개).

---

## 마이그레이션 유의점

1. **외부 API 키·인증정보 하드코딩** — Asset 서버 IP, Ztorm api_key(`7qd0O2v8BDDx`), Vaultn 인증서 비밀번호, Genba api_key, PointNexus client_id/secret이 클래스 소스에 직접 박혀 있다. Next.js 이관 시 전부 환경변수/시크릿으로 분리하되 **값은 동일하게** 유지(동작 동일성). PKCS#12 인증서 파일 경로·비밀번호, MS OAuth2 tenant/audience도 이관 대상.
2. **인증 모델이 공급사마다 다름** — Asset(user param), Ztorm(XML Identify), Vaultn(cert→JWT 세션캐시), Genba(cert JWT + MS OAuth2 토큰 + api_key), PointNexus(OAuth2 client_credentials 세션캐시). 토큰 세션 캐시(`$_SESSION[...]['accessToken']`)를 서버측 캐시로 재현하되 만료/재발급 타이밍을 그대로 옮긴다.
3. **동기화 방식이 배치/수동 혼재, cron 없음** — 대부분 어드민 버튼 클릭(AJAX)으로 `_sync`/`_batch` 트리거. PointNexus 취소검증은 명시적으로 "cron 미사용, 관리자 수동+order_view 자동검증". 스케줄러 도입은 **개선이므로 범위 밖** — 수동 트리거 UX를 그대로 재현. 배치 진행률/오프셋·단종 판정(update_date < MAX) 로직도 그대로.
4. **공급사별 재고 모델 차이** — Asset(키풀 reserve), Vaultn(owned+connection 공유 total), Genba(상품 PreLiveState + webhook 품절), PointNexus(operation reveal/book), Ztorm(실시간, 재고체크 페이지 없음). DB 재고 층은 API의 스냅샷이며 **재고 0이어도 자동 품절 안 함**(관리자 수동) — 단 Genba webhook은 예외적으로 `tbl_goods SET flag=4, soldOutFl='y'` 자동 반영. 이 자동/수동 경계를 정확히 옮겨야 회귀 없음.
5. **Genba webhook 수신 엔드포인트(`api/genba/*`)는 공개 URL** — 외부 서버가 호출. 경로·요청 JSON 스키마·응답 형식이 계약. 세션 인증이 아니므로 어드민 가드와 분리해서 이관(Next.js Route Handler). 로그 테이블(`genba_webhook_log`)·품절 반영 SQL 동일 재현.
6. **DB 이원화** — 대부분 `directgames`(메인). `genba_webhook_log`도 `directgames`. 공급사 카탈로그 테이블(`vaultn_catalogue`, `pointnexus_catalogue`, `grac_list`/`grac_entname`, `genba_*`, `asset_*`)의 스키마·upsert 키(ON DUPLICATE KEY)·batch_date/update_date 관리 규칙을 그대로 유지.
7. **Steam 파이썬 CGI 스크래퍼** — Next.js로 직접 이관 불가. 별도 수집 서비스로 분리하거나 Steam 공식 API 대체 검토. 연령확인 쿠키(birthtime)·cp949 인코딩·BeautifulSoup 파싱 결과 스키마를 보존해야 기존 DB 데이터와 호환.
8. **SQL 인젝션 패턴 유지 주의** — 목록 화면 다수가 `$_GET` 값을 문자열 결합으로 WHERE에 삽입(예: asset_stock.php, genba_product_sync.php). legacy 동작을 옮기되, 이관 시 파라미터 바인딩으로 바꾸는 것은 "보안 개선"이라 원칙상 범위 밖 — 다만 동작이 바뀌지 않는 선에서 사용자와 협의 권장(추정 판단 지점).
9. **Vaultn 재고현황 중복** — `goods/stock/vaultn_stock.php`(사이드바, 전체로드+클라페이징)와 `goods/vaultn/vaultn_stock.php`(별도)가 동명으로 병존. 이관 시 두 라우트를 구분해 매핑.
