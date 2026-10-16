# Vaultn - Connection Price (connection_price)

## 원본
- 파일: `pc/_Admin_/goods/vaultn/vaultn_connection_price.php` (라이브)
- 데이터: `Vaultn::runConnectionPriceListPriceRetrieve($connectionGuid, $priceListGuid, page=1)` (page 고정 "1")

## 화면·플로우
- 진입 URL: `/goods/vaultn/vaultn_connection_price?connectionGuid&priceListGuid` (사이드바 외)
- **live 동작 = 원시 덤프만**: `print_r($result); exit;` 가 레이아웃 include 이전에 실행 → raw dump만. 하단 HTML(page_title `Valutn 프로모션 현황`, h4 `ConnectionPromotion`)은 죽은 코드.
- 이식: `<pre>{JSON}</pre>` 덤프. **알려진 차이**: SPA 루트 레이아웃이 감쌈(connection_pricelist와 동일).

## API 계약 (백엔드 전달)
### `GET /admin/vaultn/connection-price`
- 쿼리: `connectionGuid`, `priceListGuid` (page=1 서버 고정)
- 응답 `200`: runConnectionPriceListPriceRetrieve 원본(임의 구조). 프론트는 JSON 덤프.

## 타겟 매핑
- 라우트: `routes/goods/vaultn/vaultn_connection_price.tsx`
- screens: `vaultn-connection-price` / entities: `vaultn`(connection-price) / mock: `handlers/vaultn`

## Parity 체크리스트
- [ ] 원시 덤프 출력(죽은 HTML 미이식) · SPA 레이아웃 차이 문서화
