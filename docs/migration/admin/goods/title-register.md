# 대표상품 등록 (#19)

> 영역: 상품 > 대표상품 관리 > 디지털상품 목록 드롭다운 "기본정보 설정"(등록). title_list "대표상품 등록" 버튼 대상.

## 원본
- 파일: `pc/_Admin_/goods/title_register.php` (282줄). 처리: `title_ps.php`(mode=register). 헬퍼: `Admin::setGoodsTitleId`(다음 title_id), `uuidgen4`(sku), `getSteamDeveloper`/`getSteamPublisher`(prefill).
- 참조: [title-list](title-list.md).

## 화면·플로우
- 진입: `/_Admin_/goods/title_register.php[?product_code=]` → 타겟 `/goods/title_register`. sidebar_goods, `$page_title="대표상품 등록"`.
- breadcrumb: 홈/상품/대표상품 관리/대표상품 등록.
- 로드 시 서버 생성: **title_id(자동)**, **sku(uuid v4)**. product_code 주어지면 tbl_goods_item+steam에서 title_name/en/steam_appid/release_date/developer/publisher **prefill**.
- 폼(`col-8`, post title_ps.php mode=register, multipart, hidden: mode/title_mode/page/search_*×5/game_rate_text):
  - 상단 우측 "대표상품 등록" submit(아이콘), **product_viewer면 숨김**.
  - **카드1 "(필수) 대표상품 기본정보"**(헤더 `bg-secondary`):
    - title_id(readonly plaintext), sku(readonly plaintext).
    - title_name(국문) **required**, title_name_en(영문) **required**.
    - coming_soon(출시여부): radio Y(출시예정, 기본)/N(출시확정) + coming_soon_date(text "출시일 미정시 입력") + release_date(text datepicker).
    - title_code(제공고시 품목): radio 33(디지털 콘텐츠(게임), 기본)/12(소형전자).
    - is_view(페이지 노출): radio Y(진열함)/N(진열안함, 기본).
    - sales_status(판매상태): radio C(판매예정, 기본)/S(판매중)/E(판매종료).
  - **카드2 "대표상품 부가정보"**: publisher(text), developer(개발사/제조사 text), steam_appid(text).
- JS: submit 시 game_rate[] 체크박스로 game_rate_text 계산 — **이 폼엔 game_rate 체크박스 없음 → dec=0 → "0"**. (leftover)
- 제출: INSERT tbl_goods(폼 필드 + 미노출 필드[age_limit/korean 4종/rateno/orgname/domain]는 빈값, game_rate=str_pad(text,7,'0'), reg_date=now) → `title_list.php?search_title_id={title_id}` 이동.

## 데이터 (legacy)
- INSERT `tbl_goods` SET (title_ps register): title_id, title_name, title_name_en, age_limit, is_view, sales_status, release_date, developer, steam_appid, publisher, game_rate, domain, rateno, orgname, sku, interface_korean, spoken_korean, exclusive_korean, subtitle_korean, coming_soon, coming_soon_date, title_code, reg_date=now(). 폼 미제공 필드는 null/빈값.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/titles/new?product_code=`** — 등록 초기값. 응답 `{ title_id, sku, prefill: { title_name, title_name_en, steam_appid, release_date, developer, publisher } | null }`. 백엔드: title_id 채번, uuid sku, product_code 있으면 옵션+steam prefill.
- **`POST /admin/goods/titles`** — 등록. body: `{ title_id, sku, title_name, title_name_en, coming_soon, coming_soon_date, release_date, title_code, is_view, sales_status, publisher, developer, steam_appid, game_rate_text }`. 서버: 미제공 필드 빈값, reg_date. 응답 `{ success, title_id }`.
  - ⚠️ #16 목록 POST(`/admin/goods/titles`)는 존재하지 않음(목록은 GET) — 충돌 없음. 신규 create 엔드포인트.

## 타겟 매핑
- 라우트: `routes/goods/title_register.tsx`(search product_code) → `screens/title-register`.
- entities/goods-title 확장: `NewTitleResponse`/`CreateTitleRequest`, `fetchNewTitle`+`useNewTitle`, `createTitle`+`useCreateTitle`(성공 시 목록 이동).
- 폼: 로드된 title_id/sku·prefill로 초기화(데이터 로드 후 렌더). datepicker는 plain text(CSS-only). 제출 시 game_rate_text="0".
- mock: `titles/new`(max+1 id, uuid sku, product_code prefill 샘플), create(goodsTitle 테이블 insert — enriched 기본값[counts 0, grac null, genres/categories []]).

## Parity 체크리스트 (셀프 검증 완료 — 개발자 승인 대기)
- [x] breadcrumb/제목/submit(아이콘)
- [x] title_id·sku readonly 자동, 국문·영문 required
- [x] coming_soon/title_code/is_view/sales_status 기본 checked(Y/33/N/C)
- [x] 부가정보(publisher/developer/steam_appid)
- [x] product_code prefill(옵션→제목/steam 등)
- [x] 저장 → INSERT → title_list?search_title_id 이동
- mock: coming_soon/coming_soon_date는 GoodsTitleRow 미모델(리스트 미표시) → create 시 미저장(#20 modify에서 폼 로드 필요 시 확장). product_viewer submit 숨김은 미반영(후속).
- release_date: legacy `data-provide="datepicker"`(bootstrap-datepicker, yyyy-mm-dd) → `shared/ui/BootstrapDatepicker`로 재현(테마 app.min.css의 datepicker 스타일 재사용, jQuery/신규 의존성 없음, weekStart=0·영문 라벨·autoclose=false·todayHighlight=false·days/months/years drill-up). 6개 legacy admin 화면 공용.
- 기계 검증: tsc 0 / lint 0 / build 성공(500 kB).
