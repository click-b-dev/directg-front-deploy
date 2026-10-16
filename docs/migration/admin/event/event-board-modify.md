# 이벤트 게시판 수정 + 이벤트 상품 관리 (event_board_modify)

## 원본
- 파일: `pc/_Admin_/event/event_board_modify.php` (라이브, 목록 "이벤트 수정" 링크 대상) + `event_board_ps.php`(modify/goods_option_search/group_search/event_goods_add/event_goods_delete/group_item_add)
- 데이터: `tbl_event`(단건) + `tbl_event_goods`(event_no별) + `AdminGoods::getGroupItemList`, 옵션검색 `tbl_goods_item`(status<>'3')

## 화면·플로우
- 진입 URL: `/event/event_board_modify?idx`
- breadcrumb: 홈 / 게시판 / 이벤트 게시판 관리 / (active) 이벤트 게시판 수정 · h4 `이벤트 게시판 수정`
- **col-8 폼**(mode=modify 고정): event_board_register와 동일 필드 + **show_promotion 프리필**(register.php와 달리 modify.php는 프리필함). 저장 → `event_board_list`.
- **col-4 사이드**:
  - 이벤트 배너: `event_banner` img 미리보기
  - 이벤트 상품: `tbl_event_goods` 목록(product_code / product_name + 삭제 버튼). 하단 검색(옵션상품명/코드 input + `옵션상품 검색`)
  - 그룹상품 가져오기: 그룹코드 input + `그룹 검색`
- **옵션검색 모달**(createPortal fade): 7컬럼(옵션상품번호/옵션상품명(영문명)/플랫폼/퍼블리셔/게임옵션(번들옵션)/판매상태/비고). 각 행 `옵션추가`. 그룹 검색 시 최상단에 `전체추가` 행(colspan 6 + 버튼) 추가.
  - 판매상태 라벨: 0 판매중 / 1 판매중지 / 3 판매종료(행 bg-danger bg-opacity-50) / 9 승인대기. 옵션검색은 status<>'3'이라 3 미포함, 그룹검색은 포함 가능.
- 액션:
  - `옵션추가` → event_goods_add → **모달 닫기 + 상품목록 재조회**(legacy location.reload)
  - `삭제` → confirm → event_goods_delete → **재조회**
  - `전체추가` → group_item_add → **모달 닫기, 재조회 없음**(legacy `location.reload()` 주석처리 quirk 이식)
  - 검색 시 이미 등록된 상품은 서버에서 제외(event_goods 대조)

## API 계약 (백엔드 전달)
- 폼 프리필: `GET /admin/event/board/{idx}` (Unit 2 계약 재사용) — modify는 show_promotion도 사용.
- 저장: `PUT /admin/event/board/{idx}` (Unit 2 계약 재사용).
- `GET /admin/event/board/{idx}/goods` → `{ items: [{ idx, product_code, product_name }] }` (product_name asc)
- `POST /admin/event/board/goods/search` `{ search_value, event_no }` → `{ items: [{ product_code, product_name, product_name_en, platform_name, publisher_name, game_type_name, status }] }` — `tbl_goods_item (product_name like OR product_code=) and status<>'3'`, 이미 등록 상품 제외.
- `POST /admin/event/board/goods/group-search` `{ search_value, event_no }` → `{ group_code, items: [...] }` — getGroupItemList, 이미 등록 제외.
- `POST /admin/event/board/goods` `{ event_no, product_code, product_name }` → `{ success }`
- `DELETE /admin/event/board/goods/{idx}` → `{ success }`
- `POST /admin/event/board/goods/group-add` `{ event_no, group_code }` → `{ success }` (그룹 상품 일괄 insert)

## 타겟 매핑
- 라우트: `routes/event/event_board_modify.tsx` / screens: `event-board-modify` / entities: `event` 확장(goods list/search/add/delete/group) / mock: `handlers/event` 확장 / `shared/ui/MarkdownEditor`

## Parity 체크리스트
- [ ] 폼 프리필(show_promotion 포함) · 저장→목록
- [ ] 이벤트 상품 목록·삭제(confirm) · 옵션검색 모달(7컬럼·상태 라벨/색) · 옵션추가(재조회)
- [ ] 그룹검색(전체추가 행) · 전체추가(재조회 없음 quirk) · 이미 등록 상품 제외
