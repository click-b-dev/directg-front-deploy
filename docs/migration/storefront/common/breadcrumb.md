# 공통 Breadcrumb (게임 도메인)

## 원본

- 파일: `pc/inc/header.html` L274–284 (라이브 header — `yjs_header.html`은 죽은 사본)
- 렌더 위치: `</nav>` 직후, 페이지 본문 `.container` 앞 (header include 내부)
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/PROJECT-OVERVIEW.md`

## 화면·플로우

- **조건부 렌더**: `$aside['product_type']`가 `"game"` | `"group"` | `"accessories"`일 때만 출력.
  - `"holomodels"`(holomodels_list/grid) 등 다른 값은 breadcrumb 미출력. (verbatim)
- 마크업 (L277–281):
  ```html
  <div class="container mt-3 breadcrumb">
    <div class="font-14">
      <a href="/" class="text-decoration-none">다이렉트 게임즈</a> > <?=$sub_title?><?=$page_title?><?=$sub_title2?>
    </div>
  </div>
  ```
- 데이터 모델: 고정 루트 `다이렉트 게임즈`(링크 `/`) + 페이지가 정의한 문자열 3종(`$sub_title` + `$page_title` + `$sub_title2`)의 **원시 HTML 연결**. 각 페이지 PHP 상단에서 변수 지정.
  - 미정의 변수는 빈 문자열(`$sub_title?$sub_title:""`, page_title/sub_title2는 그대로 echo — 미정의 시 PHP notice지만 빈 출력).
- 세그먼트 사이 구분자는 항상 ` > ` (앞뒤 공백 1칸). 링크는 모두 `class='text-decoration-none'`.

### 페이지별 breadcrumb 값 (game/group/accessories, 조사분)

| legacy 페이지 | sub_title | page_title | sub_title2 | 렌더(루트 이후) |
| --- | --- | --- | --- | --- |
| `game_thumb.html` | `""` | `게임` | (미정의) | 게임 |
| `game_search_thumb.html` | `""` | `통합검색 - {q}` | (미정의) | 통합검색 - {q} |
| `group_list.html` | (미정의) | `{group subject}` | (미정의) | {subject} |
| `goods_list.html` (accessories) | `""` | `PS액세서리` | (미정의) | PS액세서리 |
| `goods_category.html` (accessories) | `<a href='/game/goods_list.html'>PS액세서리</a> > 카테고리별 (` | `{tagName}` | `)` | PS액세서리 > 카테고리별 ({tagName}) |
| **`game_category_thumb.html`** ★ | `<a href='/game/game_thumb.html'>게임</a> > 카테고리별 (` | `{tagName}` | `)` | 게임 > 카테고리별 ({tagName}) |
| `publisher_capcom_thumb.html` | `퍼블리셔별 (` | `{publisher}` | `)` | 퍼블리셔별 ({publisher}) |
| `promotion_ing_{thumb,list,grid}.html` | `<a href='/game/game_{page_type}.html'>게임</a> > ` | `할인진행중` | `""` | 게임 > 할인진행중 |
| `promotion_weekend.html` | (미정의) | `주말특가 프로모션`(하드코딩) | (미정의) | 주말특가 프로모션 |

- 공통 골격: **루트(다이렉트 게임즈) + N개 세그먼트를 ` > `로 조인**. 세그먼트는 링크형 `{label, href}` 또는 텍스트형 `{label}`. 마지막은 항상 텍스트.
- `promotion_ing_*`의 "게임" 링크 href는 현재 뷰(`page_type` = thumb/list/grid)에 따라 `/game/game_{page_type}.html`로 달라짐 → promotion-ing 채택 시 viewType 반영(채택 완료).
- `promotion_weekend.html`은 `product_type=game` 이나 `sub_title/sub_title2` 미정의 → 루트 이후 세그먼트는 하드코딩 page_title "주말특가 프로모션" 텍스트 1개. **기간(is_view) 무관 header가 항상 렌더** → 타겟도 접근제한 게이트 밖에서 항상 렌더.

## SSR·SEO (legacy)

- breadcrumb 자체는 head가 아닌 body 내 정적 마크업 → SSR로 그대로 출력. 별도 구조화 데이터(BreadcrumbList JSON-LD) **없음** — legacy 미제공, 추가하지 않음.
- 페이지별 CSS: 없음. `.breadcrumb`는 Bootstrap 5.3.5 기본(`directg.css`에 override 없음), `.font-14`는 `directg.css`.

## 데이터 (legacy)

- 도메인 클래스: 없음(breadcrumb는 순수 프리젠테이션). 라벨 값은 해당 페이지가 이미 조회한 값 재사용(예: game_category는 `Goods::getTagName` = `tagName`).
- AJAX/POST: 없음.

## API 계약 (백엔드 전달)

- **없음** — breadcrumb는 프리젠테이션 전용. 라벨 데이터는 각 화면이 이미 보유(예: game-category `GameCategoryResponse.tagName`).

## 타겟 매핑

- 라우트: 없음(공통 컴포넌트).
- widget: `widgets/breadcrumb` — `Breadcrumb` 서버 컴포넌트 + `BreadcrumbItem` 타입.
- 통합(game-category 단위): `screens/game-category` (game_category_thumb, thumb 고정 → "게임" 링크 `/game/game_thumb.html`).
- 통합(breadcrumb 채택 단위): `screens/promotion-ing`(viewType별 "게임" 링크 `/game/game_{viewType}.html` + "할인진행중"), `screens/promotion-weekend`("주말특가 프로모션" 텍스트, 게이트 밖 항상 렌더).
- mock: 없음.
- 후속 채택 대상(본 단위 범위 밖): `screens/promotion-ing`(viewType별 "게임" 링크), 추후 game_thumb/group/goods/publisher/search 이관 시.

## Parity 체크리스트

- [ ] 마크업 일치 (`container mt-3 breadcrumb` > `font-14` > 루트 링크 + ` > ` 조인)
- [ ] 루트 `다이렉트 게임즈` 링크 `/` + `text-decoration-none`
- [ ] game-category: `다이렉트 게임즈 > 게임 > 카테고리별 ({tagName})`, "게임"만 링크(`/game/game_thumb.html`)
- [ ] product_type 미해당 화면엔 미출력(컴포넌트 미배치로 재현)
- [ ] 구조화 데이터 미추가(legacy 동일)
