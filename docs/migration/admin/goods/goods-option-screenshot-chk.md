# 옵션상품 이미지 관리 - DLC 스크린샷 관리 (DLC 스크린샷 체크)

## 원본

- 파일: `pc/_Admin_/goods/goods_option_screenshot_chk.php` (라이브)
- 형제: `goods_option_image_chk.php`(#55, 옵션 Header 관리)
- 참조: `goods_option_screenshot_register.php`(옵션 스크린샷 설정 — 다운로드 계약 재사용), `getGoodsOptionList`

## 화면·플로우

- 진입 URL/파라미터: `/goods/goods_option_screenshot_chk`
  - `page`, `search_product_code`, `search_product_name`, `search_appid` (폼 노출)
  - (PHP는 title_id/title_name_en/is_view/domain/supplier/platform/genre/age_limit도 캡처하나 폼 미노출·본 화면 무관 → 이식 생략)
- 성격: **DLC 옵션 목록 + Steam 스크린샷 다운로드 상태 확인/다운로드.**

- 화면 요소 (legacy 기준):
  - page_title: **`DLC 스크린샷 체크`** (⚠️ 사이드바 라벨 "DLC 스크린샷 관리"와 다름 — 그대로) / breadcrumb: 홈 > 상품 > 옵션상품 이미지 관리 > DLC 스크린샷 체크
  - 검색필터 카드(`검색필터`): 옵션상품코드(`search_product_code`) / 옵션상품명(국문)(`search_product_name`) / Steam APP ID(`search_appid`) 텍스트 3개 + submit `옵션상품 검색`
  - 카운트: `{total} 개`
  - 목록 테이블(`table-centered nowrap table-sm table-bordered`, thead `table-light font-13`, tbody `font-12`), 6컬럼: 번호 / 옵션상품코드(Steam AppID) 7% / 옵션상품 sku 20% / 옵션상품명 * / 옵션상품 출시일 7% / 페이지 보기 10%
    - 상품별 **2행**(번호 td `rowspan=2`):
      - 1행: 번호(=`total-((page-1)*10+num)` 역순) | product_code<br>(steam_appid)<br>판매상태 텍스트(sales_status S=판매중/C=판매예정/E=판매종료) | goods_sku | product_name<br>product_name_en | release_date(0,10) | 페이지 이동(`/game/dlc_view.html?sku={goods_sku}` target=_blank)
      - 2행: th `Steam 스크린샷` + td colspan=4 — flex-wrap 스크린샷 슬롯(최대 10):
        - 로컬 파일 존재 → `스크린샷 {num} 완료`
        - 미존재 → `스크린샷 {num} 다운로드` 버튼(btn_screenshot_download) + 숨김 result div
        - 스팀 JSON 없음 → `스팀 JSON정보 없음`(text-danger)
  - 페이지네이션

### 스크린샷 다운로드 (btn_screenshot_download)

- 동작: `POST ../steam/steam_screenshot_download.php {product_code, image_type:'screenshot', image_url, thumbnail_url, num}` → 성공 시 `location.reload()`, 에러 시 alert.
- 재사용: 기존 `downloadOptionScreenshot`(옵션 스크린샷 설정 계약, `POST /admin/goods/options/{code}/screenshots/download`). 요청 필드 `{id, path_full, path_thumbnail, num}`로 매핑.

### legacy 버그/특이사항(그대로 이식)

1. **옵션상품코드 필터(search_product_code) 무동작**: 폼 입력은 있으나 WHERE 미처리(dead). 실동작 필터는 product_name(LIKE)·appid(=)뿐.
2. page_title "DLC 스크린샷 체크"(사이드바 "DLC 스크린샷 관리"와 상이).
3. Steam JSON은 `apps_{appid}.json` 우선, 없으면 `apps_{appid}_coming.json`, 둘 다 없으면 "스팀 JSON정보 없음". → 백엔드가 `has_json`+`screenshots`로 통합 제공.

## 데이터 (legacy)

- `Admin::getGoodsOptionList($page, $add_where, $orderby='release_date desc', $param, 10)` — 10/page.
- 기본 WHERE: `game_type='dlc' AND status<>'3' AND status<>'1' AND display_type<>'dlc_bundle'`.
- 조건부: `product_name LIKE`, `steam_appid=`(그 외 캡처 필터는 폼 미노출).
- 스크린샷: 서버 로컬 JSON(`upload/apps/apps_{appid}.json`)의 `data.screenshots`(첫 10개) + 로컬 파일 존재(`upload/screenshot/{code}/{filename}`) 여부.
- sales_status: 조인된 타이틀 판매상태(S/C/E).

## API 계약 (백엔드 전달)

### `GET /admin/goods/options/screenshot-chk`

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 10개/page |
| `search_product_code` | string | ⚠️ dead 필터(WHERE 미처리 — 전달하되 무시) |
| `search_product_name` | string | product_name LIKE |
| `search_appid` | string | steam_appid 등호 |

백엔드 책임:
- 기본 WHERE `game_type='dlc' AND status NOT IN ('1','3') AND display_type<>'dlc_bundle'`, `order by release_date desc`.
- 각 항목에 Steam JSON 기반 스크린샷 후보(최대 10) + 로컬 존재(`downloaded`) + `has_json` 제공.
- `search_product_code`는 무시(legacy 버그 유지).

응답 `200`:
```jsonc
{
  "items": [{
    "product_code": "DG-D-3001", "steam_appid": "1086941", "goods_sku": "...",
    "product_name": "...", "product_name_en": "...", "release_date": "2026-01-15",
    "sales_status": "S",            // S | C | E | ""
    "has_json": true,
    "screenshots": [ { "id": 0, "path_full": "https://...", "path_thumbnail": "https://...", "downloaded": false } ]
  }],
  "pagination": { "current_page": 1, "results_per_page": 10, "total_results": 3, "total_pages": 1 }
}
```

### `POST /admin/goods/options/{product_code}/screenshots/download` (기존 계약 재사용)

- 요청: `{ "id": 0, "path_full": "...", "path_thumbnail": "...", "num": 1 }`
- 응답 `200`: `{ "success": true }`
- 프론트: onSuccess 목록 invalidate(=legacy location.reload).

## 타겟 매핑

- 라우트: `routes/goods/goods_option_screenshot_chk.tsx` → `/goods/goods_option_screenshot_chk`
- screens: `screens/goods-option-screenshot-chk`
- entities: `goods-option` 확장 — `OptionScreenshotChkSearch`/`OptionScreenshotChkItem`/`OptionScreenshotChkResponse`(`OptionSteamScreenshotCandidate` 재사용), `fetchOptionScreenshotChkList`, `useOptionScreenshotChkList`, `useDownloadScreenshotChk`(다운로드+목록 invalidate)
- shared: `shared/ui/ServerPagination`
- mock: `SCREENSHOT_CHK_LIST`(DLC 옵션+스크린샷 후보) + `GET /admin/goods/options/screenshot-chk` (download는 기존 `:productCode/screenshots/download` 핸들러 재사용)

## Parity 체크리스트

- [ ] 화면 요소 일치 (page_title 체크/필터 3종/6컬럼 2행/스크린샷 슬롯)
- [ ] 필드/검증 일치 (product_code dead, product_name LIKE, appid 등호)
- [ ] 분기/플로우 일치 (완료 vs 다운로드 버튼, JSON 없음 문구, 번호 역순, 다운로드→reload)
- [ ] 엣지케이스 일치 (has_json=false 문구, downloaded 슬롯 완료 표시)
