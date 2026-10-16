# Vaultn - 재고확인 (stock)

## 원본
- 파일: `pc/_Admin_/goods/vaultn/vaultn_stock.php` (라이브)
- 데이터: `Vaultn::runVaultnStock($page)`

## 화면·플로우
- 진입 URL: `/goods/vaultn/vaultn_stock?page` (사이드바 외)
- page_title `Valutn 재고확인`(breadcrumb active + h4)
- "총: N"(recordCount) + table(thead table-dark) 6컬럼: sku / isKeyless / title / ownedUnits / totalAvailableUnits(number_format) / connections
- connections 셀: `is_array`면 중첩 테이블(thead table-light 5컬럼: connectionGuid / connectionName / reservedUnits / networkUnits / totalAvailableUnits, 모두 number_format)
- **페이지네이션 UI 없음**: page 파라미터는 받지만 템플릿에 페이징 링크 없음 — 그대로 이식(미표시).

## API 계약 (백엔드 전달)
### `GET /admin/vaultn/stock`
- 쿼리: `page`
- 응답 `200`: `{ recordCount, stockLevelInformation: [{ sku, isKeyless, title, ownedUnits, totalAvailableUnits, connections: [{ connectionGuid, connectionName, reservedUnits, networkUnits, totalAvailableUnits }] }] }`
- 백엔드 책임: runVaultnStock 원본.

## 타겟 매핑
- 라우트: `routes/goods/vaultn/vaultn_stock.tsx`
- screens: `vaultn-stock` / entities: `vaultn`(stock) / mock: `handlers/vaultn`

## Parity 체크리스트
- [ ] 총 recordCount · 6컬럼 · connections 중첩 테이블 · 페이징 미표시
