# 옵션상품 판매 설정 (#40, 핵심 분리)

> 영역: 상품 > 옵션상품 관리 > 판매 설정. 옵션 sub-nav "판매 설정"(sales active). **대형 화면(1242줄) — 핵심 분리 이관**: 이번 단위는 판매설정 + 가격 + 공급처 + 배송아이템 목록·삭제까지. **분리(후속 단위)**: 배송아이템 검색 5종(Asset·Ztorm·Genba·Vaultn·PointNexus, 모달·추가) + timedeal(display_type==timedeal) 설정/이력.
> **운영 대조 예정**: 스냅샷 기준 구현 후 게이트에서 운영 대조(스냅샷은 "판매기간" 블록 주석처리 — 운영 활성 여부 확인 필요, [[legacy-snapshot-vs-production-description]] 교훈).

## 원본
- 파일: `pc/_Admin_/goods/goods_option_sales_register.php`(1242줄). 처리: `goods_option_ps.php`(sales_config/price_save/supplier_save/delivery_item_delete + [분리] asset~pointnexus_search/add). 포함: `inc/sub_sidebar_option.php`(sales active).
- 도메인: `Admin::getPublisherAllList`(공급처), `getGoodsItemDeliveryList`(배송아이템), `getOrderSystem`(연동시스템명).
- 참조: [goods-option-view](goods-option-view.md)(배송아이템 삭제 재사용), [goods-option-modify](goods-option-modify.md).

## 화면·플로우 (이번 단위 범위)
- 진입: `?product_code=` → 타겟 `/goods/goods_option_sales_register?product_code=`. 레이아웃 col-2 sub-nav + col-10.
- page-title: `product_name` + 뱃지 3개(`getPlatformName(product_platform)`/`game_type`/`display_type`, `badge bg-dark`). **sku 없음.** breadcrumb 마지막 "옵션상품 판매 설정".
- **col-8 판매설정 폼**(sales_config, 12항목): 진열상태(is_view Y/N) · 판매상태(status 9승인대기/0판매중/1판매중지/3판매종료) · 구매수량 제한여부(purchase_limit_yn Y/N) · 구매수량제한(purchase_limit text) · 출시일(release_date, input-mask) · 수령가능일자(delivery_date, input-mask, required) · 예약판매여부(is_preorder Y/N) · 품절여부(soldout Y/N) · 본인인증 필수(is_auth Y/N) · 구매특전 제공여부(is_bonus Y/N) · 네이버페이 포인트 쿠폰 제공(is_naverpay_coupon Y/N) · 배송유형(delivery_type 1코드발송/2실물배송/3코드+실물). "판매설정 저장". (**판매기간 start/end 블록은 스냅샷 주석처리 → 제외**.)
- **col-4 가격설정 폼**(price_save): 소비자가(consumer_price) · DGKR 판매가(price) · 할인률(discount, maxlength 2). "가격 설정 저장".
- **col-4 공급처설정 폼**(supplier_save): 공급처(supplier_code, publisher 목록 select) · 공급처 SRP(product_srp) · PPR(product_ppr) · RS(product_rs, maxlength 2). "공급처 설정 저장".
- **배송아이템 설정 카드(전폭)**: 목록 테이블(연동시스템명/플랫폼/아이템유형/아이템정보(name+id)/공급처/삭제버튼) + 행별 삭제(delivery_item_delete, confirm). **tfoot 연동시스템 검색 UI + 5 모달은 분리(후속 단위)** — 이번 단위는 목록·삭제만.
- 인터랙션: 각 저장 self 리다이렉트(reload), 삭제 confirm 후 reload.

## 데이터 (legacy)
- 로드: `tbl_goods_item`(sales/price/supplier 필드) + `getPublisherAllList('all')` + `getGoodsItemDeliveryList(product_code)`. 날짜 표시: release_date=`date('Y-m-d H:i',strtotime)`, delivery_date=`date('Y-m-d H:i')`(0/빈값→"").
- **sales_config**: is_view/status/purchase_limit_yn/purchase_limit/release_date/start_date/end_date/soldout/delivery_date/is_bonus/delivery_type/is_preorder/is_naverpay_coupon/is_auth UPDATE. **서버 오버라이드: status==0→is_view='Y', status==3→is_view='N'.** start/end/delivery_date는 strtotime 저장.
- **price_save**: consumer_price/price UPDATE, **discount는 서버 재계산**(`round((consumer-price)/consumer*100)` — 폼의 discount 값 무시).
- **supplier_save**: supplier_code/product_srp/product_ppr/product_rs UPDATE.
- **delivery_item_delete**: tbl_goods_item_delivery 삭제(product_code+item_id+order_system).

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options/:productCode/sales`** — 응답 `{ product{product_name,platform_name,game_type,display_type}, sales{is_view,status,purchase_limit_yn,purchase_limit,release_date,delivery_date,is_preorder,soldout,is_auth,is_bonus,is_naverpay_coupon,delivery_type}, price{consumer_price,price,discount}, supplier{supplier_code,product_srp,product_ppr,product_rs}, publishers[{publisher_code,publisher_name}], deliveries[{order_system,order_system_name,item_platform,item_type,item_name,item_id,item_publisher}] }`. release_date/delivery_date 포맷된 문자열(빈값 ""). 없으면 404.
- **`PUT /admin/goods/options/:productCode/sales`** — sales_config. body=sales 필드. **백엔드: status 0/3 시 is_view 오버라이드.** `{ success }`. reload.
- **`PUT /admin/goods/options/:productCode/price`** — price_save. body `{ consumer_price, price, discount }`. **백엔드: discount 재계산.** `{ success }`. reload.
- **`PUT /admin/goods/options/:productCode/supplier`** — supplier_save. body=supplier 필드. `{ success }`. reload.
- **`DELETE /admin/goods/options/:productCode/deliveries`** — body `{ item_id, order_system }`(기존 #34 엔드포인트 재사용). `{ success }`. reload.
- (분리) asset~pointnexus 검색/추가는 후속 배송검색 단위 계약.

## 타겟 매핑
- 라우트: `routes/goods/goods_option_sales_register.tsx`(search product_code) → `screens/goods-option-sales`.
- 위젯: `widgets/option-sub-nav`(active="sales", gameType=data.product.game_type).
- entities/goods-option 확장: `OptionSalesData`/`OptionSalesSettings`/`OptionPriceSettings`/`OptionSupplierSettings`/`OptionPublisher`/`OptionSalesDelivery` + 요청 타입 + `fetchOptionSales`/`saveOptionSales`/`saveOptionPrice`/`saveOptionSupplier` + 훅(모두 self reload → invalidate). 삭제는 `deleteDeliveryItem` 재사용 + `useDeleteSalesDeliveryItem`(sales key invalidate).
- 헬퍼: `shared/lib/input-mask`(release_date/delivery_date, "0000-00-00 00:00"). 공급처 select2는 plain `<select>`로 대체(select2 미도입, 선택 동작 동일).
- mock: `salesStore`(sales/price/supplier) + `PUBLISHERS_SALES` + `deliveriesStore` 확장(item_publisher). GET/PUT×3.
- 시각: 카드/라디오/클래스 legacy 그대로. product_viewer 시 저장/삭제 버튼 숨김. tfoot 검색·timedeal·5모달 제외(분리).

## Parity 체크리스트
- [ ] page-title 뱃지 3개(sku 없음), breadcrumb "옵션상품 판매 설정"
- [ ] col-8 판매설정 12항목(라디오/텍스트/날짜) + 저장
- [ ] col-4 가격(소비자가/판매가/할인률) + 공급처(select/SRP/PPR/RS) 저장
- [ ] 배송아이템 목록(연동시스템명/플랫폼/유형/정보/공급처) + 삭제(confirm)
- [ ] 각 저장 self reload(invalidate), product_viewer 버튼 숨김
- [ ] 분리 확인: tfoot 검색 5종·모달·추가, timedeal 미포함(후속 단위)
- [ ] 운영 대조: 판매기간 블록 등 스냅샷≠운영 항목 게이트에서 확인
