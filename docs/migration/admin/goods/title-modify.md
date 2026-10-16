# 대표상품 수정 (#20)

> 영역: 상품 > 대표상품 관리 > (단일 대표상품) 기본정보 설정. title_list "설정" 또는 sub_sidebar_title "기본정보 설정" 대상.

## 원본
- 파일: `pc/_Admin_/goods/title_modify.php` (336줄). 처리: `title_ps.php`(mode=modify, 134~163줄). 포함: `inc/sub_sidebar_title.php`(좌측 세로 pills).
- 참조: [title-register](title-register.md), [title-list](title-list.md).

## 화면·플로우
- 진입: `/_Admin_/goods/title_modify.php?title_id=` → 타겟 `/goods/title_modify?title_id=`. sidebar_goods + sub_sidebar_title(modify active). `$page_title="대표상품 기본정보 설정"`.
- 로드: `select * from tbl_goods where title_id=:title_id` → 폼 초기값. (tbl_title_attribute_set도 조회하나 화면 미사용 = leftover.)
- breadcrumb: 홈/상품/대표상품 관리/기본정보 설정. 페이지 타이틀 `<h4>{title_name}</h4> <small>({title_name_en})</small>`.
- 레이아웃: `col-2` = sub_sidebar_title(세로 pills), `col-10` = 폼. (register는 sub-sidebar 없음·col-8.)
- 폼(post title_ps.php mode=modify, multipart, hidden: mode/title_mode/page/search_title_name/search_is_view/search_publisher_code/search_platform/search_age_limit/referer):
  - 카드 "대표상품 기본정보"(헤더 `bg-secondary`):
    - title_id(readonly plaintext), sku(readonly plaintext).
    - title_name(국문), title_name_en(영문). **required 아님**(register와 달리 필수표시 없음).
    - publisher(퍼블리셔), developer(개발사/제조사).
    - **`if title_code=="33"`(로드 시점 값)일 때만**: spoken_korean/interface_korean/subtitle_korean/exclusive_korean — Hyper `data-switch="success"` 토글 체크박스(value="Y", 미체크시 미전송→""). on/off 라벨 Y/N.
    - is_view(페이지 노출): radio Y(**노출함**)/N(**노출안함**). ⚠️ register는 "진열함/진열안함" — legacy 라벨 불일치, 그대로 재현.
    - sales_status(판매상태): radio C(판매예정)/S(판매중)/E(판매종료).
    - coming_soon(출시여부): radio Y(출시예정)/N(출시확정) + coming_soon_date(text "출시일 미정시 입력") + release_date(datepicker yyyy-mm-dd).
    - title_code(제공고시 품목): radio 33/12.
    - **`if title_code=="33"`일 때만**: steam_appid(text).
  - card-footer: submit "대표상품 기본정보 저장"(아이콘), **product_viewer(admin_level=1)면 숨김**.
- JS: submit 시 game_rate[] 계산해 `#game_rate_text`에 set — **이 폼엔 game_rate 체크박스도 #game_rate_text도 없음 → no-op**(leftover).
- 제출: UPDATE 후 `go("title_modify.php?title_id=".$title_id)` = **자기 페이지 리로드**(목록 이동 아님).

## 데이터 (legacy)
- 로드: `SELECT * FROM tbl_goods WHERE title_id=:title_id`.
- UPDATE `tbl_goods SET` (title_ps modify): title_name, title_name_en, is_view(빈값이면 "N"), sales_status, release_date, developer, steam_appid, publisher, interface_korean, spoken_korean, exclusive_korean, subtitle_korean, coming_soon, coming_soon_date, title_code, model_name `WHERE title_id`.
  - **미변경 필드**: sku, age_limit, game_rate, rateno, orgname, domain, reg_date.
  - **model_name**: UPDATE 대상이나 폼에 입력 필드 없음 → 빈값 전송 → 저장 시 ""로 덮임(legacy 동작, 그대로 재현).
  - 미체크 체크박스(korean 4종)는 "" 저장("N" 아님).

## API 계약 (백엔드 전달)
- **`GET /admin/goods/titles/:titleId`** — 수정 폼 초기값. 응답 `GoodsTitleDetail`(title_id, sku, title_name, title_name_en, publisher, developer, spoken_korean, interface_korean, subtitle_korean, exclusive_korean, is_view, sales_status, coming_soon, coming_soon_date, release_date, title_code, steam_appid, model_name). 없으면 404 `NOT_FOUND`.
  - ⚠️ MSW 등록 순서: `GET /new`(register) → `GET /:titleId`(상세) 순. `/new`를 먼저 등록해 titleId 매칭에 안 걸리게.
- **`PUT /admin/goods/titles/:titleId`** — 수정. body: `{ title_name, title_name_en, is_view, sales_status, release_date, developer, steam_appid, publisher, interface_korean, spoken_korean, exclusive_korean, subtitle_korean, coming_soon, coming_soon_date, title_code, model_name }`. 서버: is_view 빈값→"N", 미변경 필드 보존. 응답 `{ success, title_id }`.

## 타겟 매핑
- 라우트: `routes/goods/title_modify.tsx`(search title_id) → `screens/title-modify`.
- 위젯: `widgets/title-sub-nav` — sub_sidebar_title 세로 pills(상세보기/기본정보 설정/제공고시/[심의 33한정]/태그/동영상/스크린샷/이미지/상세설명/상세설명v2/관련상품). props: titleId, titleCode, active. 미이관 링크는 대상 경로로 anchor 렌더(후속 단위에서 라우트 추가). 대표상품 설정 하위 단위 공용.
- entities/goods-title 확장: `GoodsTitleDetail`/`UpdateTitleRequest`, `fetchTitleDetail`+`useTitleDetail`, `updateTitle`+`useUpdateTitle`(성공 시 detail+list invalidate, 페이지 유지=legacy reload).
- mock: GoodsTitleRow에 `coming_soon`/`coming_soon_date`/`model_name` 추가(register create도 저장하도록 보강). GET `/:titleId`(detail), PUT `/:titleId`(update: is_view 빈값→N, 지정 필드만 갱신).
- 시각: title_code==33 토글은 Hyper `data-switch` 마크업 그대로(테마 CSS가 스위치 렌더, JS 불필요). release_date는 `shared/ui/BootstrapDatepicker` 재사용.

## Parity 체크리스트 (셀프 검증 완료 — 개발자 승인 대기)
- [x] 화면 요소 일치(레이아웃 col-2/col-10, sub-sidebar pills, 카드/필드)
- [x] 필드/초기값 일치(로드 데이터 반영, readonly, 체크상태)
- [x] title_code==33 조건부 블록(korean 토글 + steam_appid) 로드값 기준
- [x] is_view 라벨 "노출함/노출안함"(register와 다름)
- [x] 저장 → UPDATE(미변경 필드 보존, is_view 빈값→N, 미체크→"") → 페이지 유지(invalidate)
- 보류: product_viewer(admin_level=1) submit 숨김 미반영(#19와 동일, auth 후속). sub-nav 미이관 링크는 대상 경로 anchor(후속 단위에서 라우트 추가). mock 행 타입이 "Y"|"N"이라 미체크는 ""가 아닌 "N" 저장(이 화면 표시상 동일, DB-레벨 차이만 존재).
- 기계 검증: tsc 0 / lint 0 / build 성공.
