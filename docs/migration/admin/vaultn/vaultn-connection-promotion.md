# Vaultn - Connection 프로모션 목록 (connection_promotion)

## 원본
- 파일: `pc/_Admin_/goods/vaultn/vaultn_connection_promotion.php` (라이브)
- 데이터: `Vaultn::runConnectionPromotion($connectionGuid)` (배열)

## 화면·플로우
- 진입 URL: `/goods/vaultn/vaultn_connection_promotion?connectionGuid` (사이드바 외)
- page_title `Valutn 프로모션 현황`(breadcrumb active) / h4 `ConnectionPromotion`
- card > table 5컬럼: guid(→`vaultn_connection_promotion_view?connectionGuid&promotionGuid` 링크) / title / validFrom(+9h) / validTo(+9h) / 동기화 버튼
- 날짜: `date("Y-m-d H:i:s", strtotime('+9 hours', strtotime($v)))` — **+9시간 표시 변환**
- 동기화 버튼: `btn_vaultn_sync` class + `data-connectionGuid`/`data-promotionGuid` — **legacy에 전용 JS 핸들러 미바인딩**(inert). 그대로 이식(동작 없음).
- 주석처리된 `strpos(title,"H2")` 필터는 미적용(전체 표시).

## API 계약 (백엔드 전달)
### `GET /admin/vaultn/connection-promotions`
- 쿼리: `connectionGuid`
- 응답 `200`: `{ items: [{ guid, title, validFrom, validTo }] }` (validFrom/validTo는 파싱 가능한 날짜 문자열)
- 백엔드 책임: runConnectionPromotion 원본. +9h 변환은 프론트.

## 타겟 매핑
- 라우트: `routes/goods/vaultn/vaultn_connection_promotion.tsx`
- screens: `vaultn-connection-promotion` / entities: `vaultn`(connection-promotions) / mock: `handlers/vaultn`

## Parity 체크리스트
- [ ] guid 링크 → promotion_view · +9h 날짜 · 동기화 버튼(inert)
