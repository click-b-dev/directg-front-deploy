# category(태그) 필터 (common/category-filter)

> `game-filter` 인프라의 잔여 항목 "category(태그)필터" 처리. legacy `filter_include.php`의 `category_code` 계열 파라미터를 분석하고, **라이브/죽은 코드를 판별**해 라이브 부분만 이관한다.

## 원본
- 파일:
  - `pc/inc/filter_include.php`(L10~12, L55~60, L317~339, L344~347) — `category_code` / `category_code_1~44` GET 파싱 + FULLTEXT 조건
  - `pc/inc/game_filter.html`(L4) — **라이브** 필터 UI. `category_code`는 **hidden input만** (태그 체크박스 없음)
  - `pc/inc/yjs_game_filter.html`(L119~236) — category 태그 체크박스 6그룹 UI. **비라이브**(아래 판정)
  - `pc/inc/aside_game.html`(L203~265) — "멀티플레이 지원" category 체크박스 블록 **전체 주석 처리**(비라이브)
- 세션: 무관(공개). GET 파라미터 기반.
- 선례: `widgets/game-filter`(적용 대상), `screens/game-category`·`screens/goods-category`(category_code 페이지 컨텍스트 보유), `entities/game-category`
- 참조: `docs/migration/storefront/common/game-filter.md`, `docs/design-system/client.md`

## 라이브/죽은 코드 판정 (parity 핵심)

### 죽은 코드 — category 태그 체크박스 UI (제외)
category_code_1~44 태그 체크박스(플레이어 수/화면·디스플레이/VR·컨트롤러/게임 서비스/접근성/PS 액세서리 6그룹)는 **라이브 사이트에 렌더되지 않는다**:
- `yjs_game_filter.html`(태그 UI 포함)은 `pc/yjs_game/product_{thumb,grid,list}.html`에서만 include됨. `pc/yjs_game/`는 **어디서도 링크·참조되지 않는 개발 샌드박스**(전체 `pc/` grep에서 외부 참조 0건, `yjs_` 프리픽스 = 죽은 파일 관례. cf. `yjs_faq.html`).
- `aside_game.html`의 category 태그 블록은 **주석 처리**됨.
- 라이브 게임/프로모션 화면 **109개**는 전부 `inc/game_filter.html`(태그 UI 없음)을 include. `yjs_game_filter.html` 사용 라이브 화면 **0건**, `$aside['category']="true"` 설정 라이브 **0건**.

→ **behavior-parity 원칙에 따라 태그 체크박스 필터 UI는 이관하지 않는다**(선례: `yjs_faq.html`·`service2.html`·`old_game_category.html` 죽은 파일 제외).

### 라이브 코드 — category_code hidden passthrough (이관 대상)
`game_filter.html` L4:
```php
<input type="hidden" id="category_code" name="category_code" value="<?=$category_code?>">
```
- 라이브 `game_category_*`·`goods_category_*` 화면은 `?category_code=X`로 진입(예: `C0001001` 싱글플레이어 기본, `P0003001` 무선컨트롤러 등). filter_include.php는 `category_code_arr[0]=category_code`를 category FULLTEXT 조건으로 적용 → **category_code는 페이지 컨텍스트 겸 콘텐츠 필터**.
- 필터 UI(`game_filter.html`)의 hidden `category_code`가 검색(btn_filter) 제출 시 GET에 포함되어 **현재 카테고리 컨텍스트를 유지**한다.

## 현재 구현 gap
- 마이그레이션된 `widgets/game-filter/ui/game-filter.tsx`는 hidden `q`/`idx`/`sort`만 렌더하고 **`category_code` hidden이 누락**됨.
- 결과: `screens/game-category`(`?category_code=C0001002`)에서 필터 검색 시 `category_code`가 제출 URL에서 탈락 → route `resolveCategoryCode(raw)=raw||"C0001001"`가 **C0001001로 리셋**. legacy는 hidden으로 실제 카테고리를 유지 → **parity 위반**(C0001001 외 카테고리에서 필터 시 카테고리 유실).

## API 계약 (백엔드 전달)
- 신규 계약 없음. `category_code`는 기존 game_category/goods_category 계약(`GET /api/game/category?category_code=X&...`)에서 이미 처리. 이번 단위는 프론트 필터 폼의 파라미터 보존만 수정.

## 타겟 매핑
- widget: `widgets/game-filter/ui/game-filter.tsx` — hidden 그룹에 `<input type="hidden" name="category_code" defaultValue={searchParams.get("category_code") ?? ""} />` 추가(legacy L4 verbatim). 빈값이면 handleSubmit이 제외 → category_code 없는 화면은 무변화.
- screen/entities/mock: 변경 없음.

## Parity 체크리스트
- [ ] `game_category_thumb.html?category_code=C0001002`에서 필터(예: is_bonus) 검색 → 제출 URL에 `category_code=C0001002` 유지(카테고리 컨텍스트 보존)
- [ ] category_code 없는 화면(promotion_ing, game_list 등)에서 필터 검색 시 URL에 빈 category_code 미포함(무변화)
- [ ] category 태그 체크박스 UI는 미이관(라이브 부재) — 죽은 코드 판정 근거 문서화
- [ ] hidden 순서/마크업 legacy game_filter.html 대비 동일
