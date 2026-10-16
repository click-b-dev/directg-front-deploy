# 옵션상품 등록/수정 (#31)

> 영역: 상품 > 옵션상품 관리 > 등록/수정. 관련상품 설정·옵션상품 목록의 ✏️(수정)·등록 대상. 옵션상품 관리 영역 첫 이관.

## 원본
- 파일: `pc/_Admin_/goods/goods_option_register.php` (356줄). 처리: `goods_option_ps.php` mode=register(92~157)/modify(158~192). sub-sidebar 없음(독립 폼).
- 도메인: `Admin::setGoodsItemCode`(옵션상품번호 채번), `uuidgen4`(goods_sku).
- 참조: [title-option](title-option.md).

## 화면·플로우
- 진입: `/_Admin_/goods/goods_option_register.php[?product_code=&mode=modify]` → 타겟 `/goods/goods_option_register`. product_code 있으면 modify(로드), 없으면 register(채번+uuid). `$page_title="옵션상품 등록"`.
- breadcrumb: 홈/상품/옵션상품 관리/옵션상품 등록. 레이아웃: sub-nav 없음, col-7 + col-5.
- 폼(post goods_option_ps.php, hidden: mode + search_*×6, page):
  - **col-7 옵션상품 기본정보**:
    - product_code(옵션상품번호, text required, 채번값·수정 시 편집가능), goods_sku(readonly uuid).
    - product_name(국문), product_name_en(영문).
    - product_platform(select): Steam(1)/Epic(34)/Ubisoft Connect(30)/Rockstar(35)/Bethesda(33)/Origin(3)/홀로모델(51)/기타(32).
    - option_type(select): digital(디지털상품)/retail(실물상품). ⚠️ **modify 시 로드값 미반영**(legacy가 `$selected['option_type']` 미설정 = 항상 미선택). 그대로 재현.
    - game_type(select 옵션상품 구분): game/dlc/music/bundle/randombox/timedeal/accessories/holomodels. 로드값 selected.
    - display_type(select 진열그룹): basic/edition/multi/dlc/game_bundle/dlc_bundle/etc_bundle/timedeal/holomodels/holomodelsdlc/holomodelsedition. 로드값 selected.
  - **col-5 옵션상품 부가정보**:
    - 음성/인터페이스/자막/독점 한국어(data-switch 토글, 로드 checked).
    - steam_appid, packageid, bundleid(text).
  - submit "옵션상품 저장"(product_viewer 숨김).
- 제출: register→INSERT, modify→UPDATE. (legacy datetimepicker/SimpleMDE script는 대상 필드 없음 = leftover.)

## 데이터 (legacy)
- 로드(modify): `SELECT * FROM tbl_goods_item WHERE product_code`. goods_sku 없으면 uuid 생성.
- **register**(goods_option_ps 92): INSERT tbl_goods_item(product_code, product_name, product_name_en, product_platform, steam_appid, packageid, bundleid, goods_sku, option_type, game_type, display_type, bundle_type(빈값), spoken/interface/exclusive/subtitle_korean). steam_appid>0면 tbl_goods_item_description(product_code, steam_appid)도 INSERT. → goods_option_list(game_type별).
- **modify**(158): UPDATE tbl_goods_item SET 위 필드 + keyword/model_code/model_name/publisher/age_limit/game_rate/update_date. ⚠️ **이 폼엔 keyword/model_*/publisher/age_limit/game_rate 필드 없음 → 빈값 덮임**(legacy quirk). → goods_option_modify.php.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options/new`** — 등록 초기값. 응답 `{ product_code(채번), goods_sku(uuid), data: null }`.
- **`GET /admin/goods/options/:productCode`** — 수정 로드. 응답 `GoodsOption`(폼 필드 전체). 없으면 404.
- **`POST /admin/goods/options`** — register INSERT. body: 폼 필드. 응답 `{ success, product_code }`.
- **`PUT /admin/goods/options/:productCode`** — modify UPDATE. body: 폼 필드. 응답 `{ success }`. (백엔드: 미제공 컬럼 legacy대로 처리.)

## 타겟 매핑
- 라우트: `routes/goods/goods_option_register.tsx`(search product_code, mode). product_code 있으면 modify.
- entities/goods-option(신규 슬라이스): `GoodsOption`/`NewGoodsOption`/요청 타입, fetchNewOption/fetchOption/createOption/updateOption + 훅.
- mock: goodsItem store(옵션상품 master). GET new/:code, POST, PUT.
- 시각: 카드/셀렉트/토글 legacy 클래스 그대로. data-switch 토글. product_viewer 저장 숨김(useProductViewer). option_type modify 미반영(버그 재현).
- 저장 후: legacy 리다이렉트(goods_option_list/modify)는 미이관 → 저장 성공 시 self(modify)로 이동 + invalidate(대체, 문서화).

## Parity 체크리스트 (셀프 검증 완료 — 개발자 승인 대기)
- [x] 레이아웃(col-7 기본정보 + col-5 부가정보), sub-nav 없음
- [x] 셀렉트 4종(플랫폼/유형/구분/진열그룹) 옵션·로드 selected, 한국어 토글 4종
- [x] register 채번/uuid, modify 로드
- [x] option_type modify 미반영(버그 재현), product_viewer 저장 숨김(useProductViewer)
- 보류: 저장 후 legacy 리다이렉트(goods_option_list/goods_option_modify 미이관) → self(modify)로 이동 대체. modify UPDATE의 keyword/model_*/publisher/age_limit/game_rate(이 폼 미제공)는 백엔드 legacy 처리(mock은 폼 필드만 갱신). datetimepicker/SimpleMDE script는 대상 필드 없어 미포함(leftover).
- 신규 슬라이스 `entities/goods-option`, MSW `handlers/goods-option`(handlers.ts 등록, title-option 후보 코드 seed).
- 기계 검증: tsc 0 / lint 0 / build 성공.
