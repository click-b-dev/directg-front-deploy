# Vaultn - 상품 조회 (product_view)

## 원본
- 파일: `pc/_Admin_/goods/vaultn/valutn_product_view.php` (라이브, 파일명 "valutn" 오타)
- 데이터: `Vaultn::runProductRetrieveAll($productGUID, $page)`

## 화면·플로우
- 진입 URL: `/goods/vaultn/valutn_product_view?productGUID&page` (직접 URL 접근, 사이드바 외)
- page_title `Valutn 상품 조회`(breadcrumb active) / h4 `ConnectionProduct (Retrieve all products by connection)`
- **legacy 디버그 quirk**: `print_r($result)`를 페이지 상단에 그대로 출력(exit 없음) → 원시 덤프 + 그 아래 테이블 둘 다 렌더. 이식 시 `<pre>{JSON}</pre>` 덤프 + 테이블 유지.
- 테이블(colgroup 20%/*): products[] 각각에 대해 productCoreAttributes(scalar echo) / productTypeAttributes(print_r) / skus(print_r) / assets(print_r)를 key→value 행으로 나열.

## API 계약 (백엔드 전달)
### `GET /admin/vaultn/product-view`
- 쿼리: `productGUID`, `page`
- 응답 `200`: `{ products: [{ productCoreAttributes: {k:v}, productTypeAttributes: {k:v}, skus: {k:v}, assets: {k:v} }], ... }` — 최상위/그룹 값 임의 구조(프론트: core는 문자열, 나머지 JSON 덤프).
- 백엔드 책임: runProductRetrieveAll 원본 반환.

## 타겟 매핑
- 라우트: `routes/goods/vaultn/valutn_product_view.tsx`
- screens: `vaultn-product-view` / entities: `vaultn`(product-view) / mock: `handlers/vaultn`

## Parity 체크리스트
- [ ] 상단 print_r 덤프 + attributes 테이블 동시 렌더
- [ ] core=문자열, type/skus/assets=구조 덤프
