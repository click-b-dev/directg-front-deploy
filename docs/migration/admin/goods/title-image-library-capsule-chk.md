# 대표상품 이미지 관리 - Library capsule 관리

## 원본

- 파일: `pc/_Admin_/goods/title_image_library_capsule_chk.php` (라이브)
- 형제: `title_image_header_chk.php`(#52 완료), `title_image_vertical_capsule_chk.php`(후속)
- 참조: `docs/migration/admin/goods/title-image-header-chk.md`(#52 — 공용 엔드포인트 계약)

## 화면·플로우

- 진입 URL/파라미터: `/goods/title_image_library_capsule_chk`
  - `page`, `search_key`, `search_value`, `search_is_view`, `search_sales_status`, `search_domain`, **`search_is_library`**
- 성격: **읽기 전용 확인 화면.** 대표상품별 Library capsule 이미지(600x900) 등록 상태 육안 확인.

### #52(Header)와의 차이

| 항목 | Header (#52) | Library capsule (본 단위) |
|---|---|---|
| breadcrumb 3번째 | 대표상품 이미지 관리 | **대표상품 관리** (legacy 불일치, 그대로) |
| 페이지 타이틀 | Header 관리 | Library capsule 관리 |
| 판매상태 필터 | C / S / E | **C / S** (E 없음) |
| 추가 필터 | — | **Library capsule 이미지**: 있음(`200`) / 없음(`404`) |
| 이미지 경로 | `/upload/title/{id}/header/{id}.jpg` | `/upload/title/{id}/library/library_600x900.jpg` |
| 목록 버튼 | 페이지 이동 → `/game/game_view.html?product_id={sku}` | **이미지 설정** → `/goods/title_image_register.php?title_id={id}` |
| 데이터 소스 | `Admin::getGoodsList` | **`AdminGoods::getGoodsImageChkList`** (JOIN `b.is_library`) |

- 나머지 화면 요소(검색필터 카드, 카운트, 2행 테이블 구조, 컬럼 폭)는 Header와 동일.

### legacy 버그(그대로 이식)

1. **판매종료 상시 제외**: `sales_status<>'E'` 무조건 AND (line 66). (Library엔 E 필터 옵션 자체가 없음)
2. **도메인/노출 "전체"(`all`) empty**: `a.domain='all'` / `a.is_view='all'` 등호 → empty.

## 데이터 (legacy)

- 도메인 클래스: `AdminGoods::getGoodsImageChkList($page, $add_where, $orderby='a.title_id desc', $param)`.
- JOIN: `a`=goods, `b`=이미지 상태 캐시(`b.is_library` = HTTP 상태코드 `200`/`404`).
- 기본 WHERE: `a.title_code<>'12'`, `sales_status<>'E'`(상시).
- 조건부: search_key별 LIKE/등호, `a.is_view=?`, `a.sales_status=?`, `a.domain=?`, `b.is_library=?`.
- 사용 컬럼: `title_id, steam_appid, sales_status, sku, title_name, title_name_en, release_date, domain` (is_library는 필터 전용, 미표시).

## API 계약 (백엔드 전달)

### `GET /admin/goods/titles/image-chk` (#52 공용 엔드포인트 확장)

본 단위는 `image_type=library`. #52 요청 파라미터에 아래 추가:

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `image_type` | string | `library`(본 단위) |
| `search_is_library` | string | `200`(있음) \| `404`(없음) — `b.is_library` 등호 필터 |

백엔드 책임:
- `image_type=library`일 때 이미지 상태 테이블 JOIN, `b.is_library` 필터 지원.
- 응답 스키마·기본 WHERE·legacy 버그(E 상시 제외, all empty)는 #52와 동일.
- 응답 항목 스키마는 #52 `TitleImageChkListItem`와 **동일**(is_library 미포함 — 필터 전용).

## 타겟 매핑

- 라우트: `routes/goods/title_image_library_capsule_chk.tsx` → `/goods/title_image_library_capsule_chk`
- screens: `screens/goods-title-image-library-capsule-chk`
- entities: `goods-title` 확장 — `TitleImageLibraryChkSearch`(= `TitleImageChkSearch` + `search_is_library`), `fetchTitleImageLibraryChkList`(image_type=library), `useTitleImageLibraryChkList`
- shared: `shared/ui/ServerPagination`
- mock: `shared/mocks/handlers/goods-title.ts` — `IMAGE_CHK_LIST`에 `is_library` 추가, `image-chk` 핸들러에 `search_is_library` 필터 추가

## Parity 체크리스트

- [ ] 화면 요소 일치 (타이틀/breadcrumb 대표상품 관리/필터 7종/2행 테이블/library 이미지 프리뷰)
- [ ] 필드/검증 일치 (판매상태 C·S만, is_library 200/404)
- [ ] 분기/플로우 일치 (이미지 설정 버튼 → title_image_register, 페이지네이션 param 유지)
- [ ] 엣지케이스 일치 (all 필터 empty, is_library 200/404 필터)
