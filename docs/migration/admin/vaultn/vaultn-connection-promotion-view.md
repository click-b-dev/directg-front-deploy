# Vaultn - 프로모션 조회 (connection_promotion_view)

## 원본
- 파일: `pc/_Admin_/goods/vaultn/vaultn_connection_promotion_view.php` (라이브)
- 데이터: `Vaultn::runConnectionPromotionRetrieve($connectionGuid, $promotionGuid)`

## 화면·플로우
- 진입 URL: `/goods/vaultn/vaultn_connection_promotion_view?connectionGuid&promotionGuid` (connection_promotion guid 링크 대상)
- page_title `Valutn 프로모션 조회`(breadcrumb active) / h4 `Promotion (Retrieve all promotions)`
- card > table 2컬럼: sku / discountPercentage (`$result->items` 순회)

## API 계약 (백엔드 전달)
### `GET /admin/vaultn/connection-promotion-view`
- 쿼리: `connectionGuid`, `promotionGuid`
- 응답 `200`: `{ items: [{ sku, discountPercentage }] }`
- 백엔드 책임: runConnectionPromotionRetrieve 원본.

## 타겟 매핑
- 라우트: `routes/goods/vaultn/vaultn_connection_promotion_view.tsx`
- screens: `vaultn-connection-promotion-view` / entities: `vaultn`(connection-promotion-view) / mock: `handlers/vaultn`

## Parity 체크리스트
- [ ] sku/discountPercentage 2컬럼 목록
