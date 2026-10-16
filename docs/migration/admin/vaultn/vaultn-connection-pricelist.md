# Vaultn - Connection Pricelist (connection_pricelist)

## 원본
- 파일: `pc/_Admin_/goods/vaultn/vaultn_connection_pricelist.php` (라이브)
- 데이터: `Vaultn::runConnectionPriceList($connectionGuid)`

## 화면·플로우
- 진입 URL: `/goods/vaultn/vaultn_connection_pricelist?connectionGuid` (사이드바 외)
- **live 동작 = 원시 덤프만**: `print_r($result); exit;` 가 `admin_head.php` include **이전**에 실행 → 레이아웃/breadcrumb 없이 raw dump만 출력. 파일 하단 HTML 테이블(page_title `Valutn 프로모션 현황`, h4 `ConnectionPromotion`)은 **죽은 코드**(도달 불가).
- 이식: 덤프 내용을 `<pre>{JSON}</pre>`로 재현.
  - **알려진 차이**: legacy는 exit로 레이아웃 없이 렌더하나, SPA는 루트 레이아웃(sidebar/topbar)이 모든 라우트를 감싸므로 덤프가 admin 크롬 안에 표시됨. 의미 있는 출력(덤프 데이터)은 동일.

## API 계약 (백엔드 전달)
### `GET /admin/vaultn/connection-pricelist`
- 쿼리: `connectionGuid`
- 응답 `200`: runConnectionPriceList 원본(임의 구조). 프론트는 JSON 덤프.

## 타겟 매핑
- 라우트: `routes/goods/vaultn/vaultn_connection_pricelist.tsx`
- screens: `vaultn-connection-pricelist` / entities: `vaultn`(connection-pricelist) / mock: `handlers/vaultn`

## Parity 체크리스트
- [ ] 원시 덤프 출력(죽은 HTML 미이식) · SPA 레이아웃 차이 문서화
