# 대표상품 이미지 관리 - Header 관리

## 원본

- 파일: `pc/_Admin_/goods/title_image_header_chk.php` (라이브 — 변형/테스트 접미 없음)
- 형제 화면: `title_image_library_capsule_chk.php`, `title_image_vertical_capsule_chk.php`
  (동일 그룹이나 `search_is_library` 필터·JOIN(`a.` alias) 추가로 구조 상이 → 별도 단위)
- 참조 문서: `docs/legacy-admin/`, `../legacy-project/docs/`

## 화면·플로우

- 진입 URL/파라미터: `/goods/title_image_header_chk`
  - `page`, `search_key`, `search_value`, `search_is_view`, `search_sales_status`, `search_domain`
- 성격: **읽기 전용 확인 화면.** 대표상품별 Header 이미지(웹서버 vs 디스크엔) 등록 상태를 육안 확인. 등록 버튼 없음(등록은 `title_image_register.php` 별도 화면 = #의 title images 슬롯 화면).

- 화면 요소 (legacy 기준):
  - 페이지 타이틀: `Header 관리` / breadcrumb: 홈 > 상품 > 대표상품 이미지 관리 > Header 관리
  - 검색필터 카드(`대표상품 검색필터`):
    - `search_key` select: 대표상품명(`search_name`) / 대표상품명코드(`search_title_id`) / 퍼블리셔(`search_publisher`) / 개발사(`search_developer`)
    - `search_value` text (placeholder `검색어`)
    - 업로드 도메인 radio: 전체(`all`) / 웹서버(`https://directg.net`) / 디스크엔(`https://image.directg.net`)
    - 게임 페이지 노출 radio: 전체(`all`) / 진열함(`Y`) / 진열안함(`N`)
    - 판매상태 radio: 판매예정(`C`) / 판매중(`S`) / 판매종료(`E`)
    - submit `대표상품 검색`
  - 카운트: `{total_results} 개`
  - 목록 테이블(`table-centered nowrap table-sm table-bordered`, thead `table-light font-13`, tbody `font-12`):
    - 컬럼: 대표상품코드(Steam AppID) 7% / 대표상품 sku 20% / 대표상품명 * / 대표상품 출시일 7% / 페이지 보기 10%
    - 상품별 **2행** 구성:
      - 1행: `title_id`(eng) + `(steam_appid)`(num) + 판매상태 텍스트(S=판매중/C=판매예정/E=판매종료) | `sku` | `title_name`<br><small>`title_name_en`</small> | `release_date`(num) | `페이지 이동` 버튼(`/game/game_view.html?product_id={sku}` target=_blank, btn-sm btn-dark)
      - 2행: colspan=5 내부 테이블(colgroup 5/10/5/15/5/15%) — 도메인 | `{domain}` | 웹서버 | `<img /upload/title/{id}/header/{id}.jpg w-50>` | 디스크엔 | `<img https://image.directg.net/upload/title/{id}/header/{id}.jpg w-50>`
  - 페이지네이션(`links_html`)

- 폼 필드/검증: 검증 없음(전부 optional GET 필터).

- 분기/리다이렉트: 없음(단일 목록 화면).

- 세션/권한 의존: `_Admin_/lib/lib.php` 관리자 세션. 프론트는 legacy 동일하게 UI만(서버측 강제는 백엔드 책임).

### legacy 버그(그대로 이식)

1. **판매종료(E) 필터는 항상 빈 결과.** WHERE에 `sales_status<>'E'`가 **무조건** 추가(line 60)되므로, `search_sales_status='E'` 선택 시 `sales_status='E' AND sales_status<>'E'` → empty.
2. **업로드 도메인/게임 페이지 노출 "전체"(`all`)도 빈 결과.** WHERE가 `domain='all'` / `is_view='all'` 리터럴 등호 비교 → 실제 그런 값이 없어 empty. (전체=필터 해제가 아님)

## 데이터 (legacy)

- 도메인 클래스·메서드: `Admin::getGoodsList($page, $add_where, $orderby='title_id desc', $param)` — title_list.php와 동일 fetcher, 10개/page.
- 기본 WHERE: `title_code<>'12'` (디지털 등, 실물 제외), `sales_status<>'E'` (상시).
- 조건부 WHERE: search_key별 LIKE/등호, `is_view=?`, `sales_status=?`, `domain=?`.
- 사용 컬럼: `title_id, steam_appid, sales_status, sku, title_name, title_name_en, release_date, domain`.

## API 계약 (백엔드 전달)

### `GET /admin/goods/titles/image-chk`

Header/Library/Vertical capsule 확인 목록 공용 엔드포인트. 본 단위는 `image_type=header`만 사용.

요청(query):

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `image_type` | string | `header`(본 단위) · 후속: `library` / `vertical` |
| `page` | number | 1-base, 10개/page |
| `search_key` | string | `search_name` \| `search_title_id` \| `search_publisher` \| `search_developer` |
| `search_value` | string | 검색어 |
| `search_is_view` | string | `all`\|`Y`\|`N` (⚠️ `all`은 리터럴 등호 → empty, legacy 버그 유지) |
| `search_sales_status` | string | `C`\|`S`\|`E` (⚠️ `E`는 항상 empty, legacy 버그 유지) |
| `search_domain` | string | `all`\|`https://directg.net`\|`https://image.directg.net` (⚠️ `all` empty) |

백엔드 책임:
- 기본 WHERE `title_code<>'12' AND sales_status<>'E'`(상시).
- 위 legacy 버그 2건을 **그대로** 재현(등호 비교, `sales_status<>'E'` 무조건 AND).
- `order by title_id desc`.

응답 `200`:

```jsonc
{
  "items": [
    {
      "title_id": 2482,
      "steam_appid": 0,
      "sales_status": "S",           // "C" | "S" | "E" | ""
      "sku": "DG-XXXX-...",
      "title_name": "...",
      "title_name_en": "...",
      "release_date": "2026-01-15",
      "domain": "https://directg.net" // tbl_goods.domain
    }
  ],
  "pagination": { "current_page": 1, "results_per_page": 10, "total_results": 79, "total_pages": 8 }
}
```

- 이미지 자체(웹서버/디스크엔)는 **정적 자산 URL**(`/upload/title/{id}/header/{id}.jpg`, `https://image.directg.net/...`)로 프론트가 `<img>` 조립. 별도 API 없음(미업로드 시 깨진 이미지 = legacy 동일).

## 타겟 매핑

- 라우트: `apps/directg-admin/src/routes/goods/title_image_header_chk.tsx` → `/goods/title_image_header_chk`
- screens: `screens/goods-title-image-header-chk`
- entities: `goods-title` 확장 — `TitleImageChkSearch` / `TitleImageChkListItem` / `TitleImageChkListResponse`, `fetchTitleImageChkList` (image_type=header 고정), `useTitleImageChkList`
- shared: `shared/ui/ServerPagination`
- mock: `shared/mocks/handlers/goods-title.ts` — `IMAGE_CHK_LIST` + `GET /admin/goods/titles/image-chk`

## Parity 체크리스트

- [ ] 화면 요소 일치 (타이틀/필터/카운트/2행 테이블/이미지 프리뷰)
- [ ] 필드/검증 일치 (필터 6종, select 4옵션)
- [ ] 분기/플로우 일치 (페이지 이동 버튼 URL, 페이지네이션 param 유지)
- [ ] 엣지케이스 일치 (E 필터 empty, all 필터 empty)
