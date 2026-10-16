# 대표상품 이미지 관리 - Vertical capsule 관리

## 원본

- 파일: `pc/_Admin_/goods/title_image_vertical_capsule_chk.php` (라이브)
- 형제: `title_image_header_chk.php`(#52), `title_image_library_capsule_chk.php`(#53)
- 참조: #52/#53 분석 문서(공용 엔드포인트 계약)

## 화면·플로우

- 진입 URL/파라미터: `/goods/title_image_vertical_capsule_chk`
  - `page`, `search_key`, `search_value`, `search_is_view`, `search_sales_status`, `search_domain`, **`search_is_hero`**
- 성격: **읽기 전용 확인 + 단일 액션(완료 체크).** hero_capsule(세로형) 이미지 등록 상태 확인 및 스팀 CDN 반영 체크.

### #53(Library)과의 차이

| 항목 | Library (#53) | Vertical capsule (본 단위) |
|---|---|---|
| breadcrumb 3번째 | 대표상품 관리(quirk) | **대표상품 이미지 관리** (정상) |
| 페이지 타이틀 | Library capsule 관리 | Vertical capsule 관리 |
| 추가 필터 | Library capsule 이미지(is_library) | **Vertical capsule 이미지(is_hero)**: 있음(200)/없음(404) |
| 404 필터 조건 | `b.is_library='404'` | **`(b.is_hero='404' or b.is_hero is null)`** (null 포함) |
| 정렬 | `a.title_id desc` | **`a.release_date desc`** |
| 이미지 경로 | `/upload/title/{id}/library/library_600x900.jpg` | `/upload/title/{id}/hero/hero_capsule.jpg` |
| 중첩 테이블 컬럼 | 6 (colgroup 5/10/5/15/5/15) | **7** (…/5 추가) — 7번째 td에 `완료` 버튼 |
| 완료 버튼 | — | 웹서버 hero 파일 존재 **&& `!product_viewer`** 시 노출. 클릭 → AJAX |

- 판매상태 필터 C/S만(E 없음), 목록 버튼 `이미지 설정` → `title_image_register.php?title_id={id}`, 나머지 구조는 #53과 동일.

### 완료 버튼 (btn_hero_chk)

- 노출 조건: `file_exists(웹서버 /upload/title/{id}/hero/hero_capsule.jpg)` **AND** `!$product_viewer`.
  - `$product_viewer`: admin_level=="1"(열람전용) → `useProductViewer()` 재사용.
- 동작: `POST title_ps.php {mode:hero_capsule_chk, appid:steam_appid}` → `alert(응답본문)` → `location.reload()`.
- 계산되나 미표시(dead)인 `$hero_capsule_url`(cloudflare steam CDN)은 이식 생략(동작 무관).

### legacy 버그(그대로 이식)

1. 판매종료 상시 제외(E 필터 옵션 없음).
2. 도메인/노출 "전체"(`all`) → 등호 비교 empty.

## 데이터 (legacy)

- 도메인 클래스: `AdminGoods::getGoodsImageChkList($page, $add_where, $orderby='a.release_date desc', $param)`.
- JOIN `b.is_hero`(HTTP 상태 `200`/`404`/null).
- 기본 WHERE: `a.title_code<>'12'`. (※ 본 파일은 `sales_status<>'E'` 라인이 **없음** — Library/Header와 달리 E 상시제외 없음. 단 판매상태 필터는 C/S만 제공.)
- 완료 버튼: 웹서버 로컬 파일 존재 여부(`file_exists`).
- 액션: `title_ps.php mode=hero_capsule_chk` (appid로 스팀 hero_capsule 체크/반영).

## API 계약 (백엔드 전달)

### `GET /admin/goods/titles/image-chk` (공용, `image_type=vertical`)

#52/#53 파라미터에 추가:

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `image_type` | string | `vertical` |
| `search_is_hero` | string | `200`(있음) \| `404`(없음, **null 포함**) — `b.is_hero` |

백엔드 책임:
- `image_type=vertical`: `b.is_hero` JOIN 필터(404는 null 포함), 정렬 `release_date desc`.
- 응답 항목에 `hero_web_exists`(웹서버 hero_capsule 로컬 존재) 추가 — 완료 버튼 노출용. (header/library 응답엔 미포함)

응답 항목(= TitleImageChkListItem + `hero_web_exists?`):
```jsonc
{ "title_id": 2352, "steam_appid": 0, "sales_status": "S", "sku": "...",
  "title_name": "...", "title_name_en": "...", "release_date": "2026-02-06",
  "domain": "https://image.directg.net", "hero_web_exists": true }
```

### `POST /admin/goods/titles/hero-capsule-chk`

legacy `title_ps.php mode=hero_capsule_chk`. 완료 버튼.

- 요청: `{ "steam_appid": 0 }`
- 응답 `200`: `{ "success": true, "message": "..." }` (legacy는 응답본문을 그대로 `alert`)
- 백엔드 책임: appid로 스팀 hero_capsule 체크/반영, 결과 메시지 반환.
- 프론트: onSuccess `alert(message)` 후 목록 invalidate(=legacy location.reload).

## 타겟 매핑

- 라우트: `routes/goods/title_image_vertical_capsule_chk.tsx` → `/goods/title_image_vertical_capsule_chk`
- screens: `screens/goods-title-image-vertical-capsule-chk`
- entities: `goods-title` 확장 — `TitleImageVerticalChkSearch`(+search_is_hero), `TitleImageChkListItem.hero_web_exists?`, `HeroCapsuleChkResponse`, `fetchTitleImageVerticalChkList`(image_type=vertical), `heroCapsuleChk`, `useTitleImageVerticalChkList`, `useHeroCapsuleChk`
- shared: `shared/ui/ServerPagination`, `shared/lib/useProductViewer`
- mock: `IMAGE_CHK_LIST`에 `is_hero`/`hero_web_exists` 추가, `image-chk` 핸들러에 vertical 정렬+search_is_hero 필터, `POST /admin/goods/titles/hero-capsule-chk`

## Parity 체크리스트

- [ ] 화면 요소 일치 (타이틀/breadcrumb 이미지관리/필터 7종/2행+7컬럼 중첩/hero 프리뷰)
- [ ] 필드/검증 일치 (판매상태 C·S, is_hero 200/404(null포함))
- [ ] 분기/플로우 일치 (완료 버튼 노출조건, AJAX→alert→reload, 정렬 release_date desc)
- [ ] 엣지케이스 일치 (all empty, 404 null 포함, product_viewer 시 완료 숨김)
