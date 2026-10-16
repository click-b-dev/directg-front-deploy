# 대표상품 관련상품 설정 (#30)

> 영역: 상품 > 대표상품 관리 > (단일) 관련상품 설정. sub_sidebar_title "관련상품 설정". 상품 관리 영역 최대 화면(legacy 1407줄).

## 원본
- 파일: `pc/_Admin_/goods/title_option_register.php` (1407줄). 처리: `title_ps.php`(option_*_search/add/delete). 포함: sub_sidebar_title(option active). 공용 모달 `#option-modal`.
- 도메인: `AdminGoods::getTitle{Game,Edition,DLC,Etc,Holomodels,HolomodelsDLC,HolomodelsEdition}List`, getPlatformName/getPublisherName/getGoodsOptionGameType/getGoodsOptionDisplayType.
- 참조: [title-view](title-view.md), [title-tag](title-tag.md).

## 화면·플로우
- 진입: `/_Admin_/goods/title_option_register.php?title_id=` → 타겟 `/goods/title_option_register?title_id=`. 레이아웃 col-2 sub-nav + col-10.
- 로드: tbl_goods + 7개 카테고리 attached 옵션 리스트(getTitle*List).
- breadcrumb: 홈/상품/대표상품 관리/관련상품 설정. 타이틀 `{title_name} <small>({en})</small>`.
- **7개 카테고리 섹션**(각 card "…진열설정"): 기본게임(game) / 에디션(edition) / DLC(dlc) / 실물상품(etc) / 홀로모델(holomodels) / 홀로모델 DLC(holomodelsdlc) / 홀로모델 에디션(holomodelsedition).
  - 각 섹션 table 컬럼: 옵션상품번호(product_code), 옵션상품명(product_name), 플랫폼(getPlatformName), 출시일(release_date 10자), 유형(game_type/display_type), 공급처(getPublisherName), 가격정보(is_free='Y'→무료+무료URL / else 소비자가(취소선)+할인율+판매가), 판매상태(0판매중/1판매중지/2품절/9승인대기/3판매종료), 비고(view→goods_option_view, edit→goods_option_register?mode=modify, 삭제→option_{cat}_delete AJAX·product_viewer 숨김).
  - card-footer: 검색 input(기본값=title_name) + "옵션상품 검색" 버튼 → 해당 카테고리 검색.
- **공용 검색 모달**(`#option-modal`, modal-lg): 검색 버튼 클릭 → title_ps option_{cat}_search가 결과 `<tr>` HTML 반환 → 모달 tbody 주입 → 표시. 모달 컬럼: 옵션상품번호, 옵션상품명(영문), 플랫폼, 퍼블리셔, 게임옵션(번들옵션), 판매상태, 비고("옵션추가" 버튼 → option_{cat}_add). 검색은 이미 attached된 항목 제외.
- 인터랙션(title_ps.php + location.reload):
  - 검색: option_{cat}_search → 후보(attached 제외).
  - 추가: option_{cat}_add → tbl_title_option INSERT(product_type, age_limit 일부) → reload.
  - 삭제: option_{cat}_delete → tbl_title_option DELETE(product_code+title_id) → reload.
- (legacy 잔재: bundle 섹션은 주석처리·미표시이나 JS에 btn_option_find3 남음. product_viewer 삭제 숨김.)

## 데이터 (legacy)
- 로드: AdminGoods::getTitle{Cat}List(tbl_title_option JOIN tbl_goods_item, 카테고리별 product_type/display_type 필터).
- **option_{cat}_add**(title_ps): `insert tbl_title_option set product_code, title_id, [age_limit], product_type='{cat}'`.
- **option_{cat}_delete**: `delete from tbl_title_option where product_code and title_id`.
- **option_{cat}_search**: `select tbl_goods_item where product_name like %..% and {카테고리 필터}` − attached 제외.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/titles/:titleId/options`** — 응답 `{ title_id, title_name, title_name_en, categories: Record<cat, OptionProduct[]> }`. OptionProduct=`{ product_code, product_name, product_name_en, platform, release_date, game_type, display_type, supplier, is_free, is_free_url, consumer_price, discount, price, status }`. cat ∈ game|edition|dlc|etc|holomodels|holomodelsdlc|holomodelsedition. 없으면 404.
- **`GET /admin/goods/option-search`** — query `category, value`. 응답 `OptionCandidate[]`(attached 제외). OptionCandidate=`{ product_code, product_name, product_name_en, platform, publisher, game_type, bundle_type, status }`.
- **`POST /admin/goods/titles/:titleId/options`** — body `{ category, product_code }`. tbl_title_option INSERT. 응답 `{ success }`. reload.
- **`DELETE /admin/goods/titles/:titleId/options/:category/:productCode`** — DELETE. 응답 `{ success }`. reload.

## 타겟 매핑
- 라우트: `routes/goods/title_option_register.tsx`(search title_id) → `screens/title-option`.
- 위젯: `widgets/title-sub-nav`(active="option").
- entities/title-option(신규 슬라이스): 타입 + fetchTitleOptions/searchOptions/addOption/deleteOption + 훅.
- mock: 카테고리별 attached 저장(store) + 후보 샘플. GET options/search, POST add, DELETE.
- 시각: 7개 섹션 데이터 주도(카테고리 config). 공용 모달은 React state + Bootstrap fade 재현(recommand 모달 패턴). 상태/가격/플랫폼/공급처 매핑. view/edit 링크는 대상 경로 anchor(옵션상품 화면 미이관). product_viewer 삭제 숨김 미반영(기존 단위 동일).

## Parity 체크리스트 (셀프 검증 완료 — 개발자 승인 대기)
- [x] 레이아웃(col-2 sub-nav) + 7개 카테고리 섹션/컬럼(데이터 주도)
- [x] 가격정보(무료+무료URL / 소비자가·할인·판매가), 판매상태 5종 매핑, 유형/플랫폼/공급처
- [x] 검색 → 공용 모달(후보, attached 제외, Bootstrap fade 재현) → 옵션추가
- [x] 삭제(카테고리별) → invalidate 목록 갱신
- 보류: product_viewer 삭제/추가 숨김 미반영(기존 단위 동일). view/edit 링크는 옵션상품 화면(미이관) 대상 경로 anchor. 플랫폼/공급처/유형명은 백엔드 해석(mock은 해석된 문자열). bundle 섹션은 legacy 주석처리라 미포함(잔재 btn_option_find3도 제외).
- 신규 슬라이스 `entities/title-option`, MSW `handlers/title-option`(handlers.ts 등록).
- 기계 검증: tsc 0 / lint 0 / build 성공.
