# 옵션상품 이미지 관리 - Header 관리 (옵션상품 Header 관리)

## 원본

- 파일: `pc/_Admin_/goods/goods_option_image_chk.php` (라이브)
- 형제: `goods_option_screenshot_chk.php`(DLC 스크린샷 관리, 후속)
- 참조: `goods_option_list.php`(#37, 동일 `getGoodsOptionList` fetcher), `title_image_*_chk`(#52~54, 이미지 프리뷰 패턴)

## 화면·플로우

- 진입 URL/파라미터: `/goods/goods_option_image_chk`
  - `page`, `search_key`, `search_value`, `search_status`, `search_domain`, `search_is_view`
- 성격: **옵션상품 목록 + header 이미지 프리뷰 + 디스크엔 등록 액션.** 옵션 목록(#37) 축소 필터판에 이미지 확인 행 추가.

- 화면 요소 (legacy 기준):
  - 타이틀: `옵션상품 Header 관리` / breadcrumb: 홈 > 상품 > 옵션상품 이미지 관리 > 옵션상품 Header 관리
  - 검색필터 카드(`옵션상품 검색필터`):
    - `search_key` select: 옵션상품명(`search_product_name`) / 옵션상품코드(`search_product_code`)
    - `search_value` text
    - 업로드 도메인 radio: 전체(`all`) / 웹서버(`https://directg.net`) / 디스크엔(`https://image.directg.net`) / **이미지 없음(`Null`)**
    - 옵션상품 진열 radio: 전체(`all`) / 진열함(`Y`) / 진열안함(`N`)
    - 판매상태 radio: 승인대기(`1`) / 판매중(`0`) / 판매종료(`3`)
    - submit `옵션상품 검색`
  - 카운트: `{total} 개`
  - 목록 테이블(`table-centered w-100 nowrap table-sm table-bordered border-light table-striped`, thead `table-light`):
    - 9컬럼: 옵션상품코드(100)/SKU(260)/옵션상품명/플랫폼(150)/출시일(90)/판매상태(80)/할인율(80)/가격(100)/비고(100)
    - 상품별 **2행**:
      - 1행(`table-active`): product_code<br>(steam_appid) | goods_sku | product_name + game_type/display_type 뱃지 + (en) | platform_name | release_date(0,10) | ProductStatusBadge(status) | 할인율(is_free=N일때 `{discount}%`) | 가격(is_free=Y→무료 / else 소비자가 취소선 + price) | **비고 드롭다운**
      - 2행: colspan=8 내부 테이블(colgroup 5/10/5/15/5/15) — 도메인 `{domain}` + **디스크엔 등록 버튼**(조건부) | 웹서버 `<img /upload/product/{code}/header/header.jpg>` | 디스크엔 `<img https://image.directg.net/...>`
  - 비고 드롭다운(dripicons-dots-3, 8항목): 상세보기 / 기본정보 설정 / 이미지 설정 / 태그 설정 / 판매 설정 / 특전제공 설정 / 타임딜 설정 / 적립금 설정
  - 페이지네이션

### 디스크엔 등록 버튼 (btn_image_diskn)

- 노출 조건: `file_exists(웹서버 /upload/product/{code}/header/header.jpg)` **AND** (`domain==""` OR `domain=="https://directg.net"`).
- 동작: `POST goods_option_ps.php {mode:diskn_upload_chk, product_code}` → 성공 시 `location.reload()`(alert 없음), 에러 시 alert.

### legacy 버그/특이사항(그대로 이식)

1. **진열 필터(search_is_view) 무동작**: 캡처·checked 표시는 되나 WHERE에 미추가 → 선택해도 결과 불변(dead 필터).
2. **도메인 "전체"(`all`) empty**: `domain='all'` 등호 → empty. `Null` 선택은 `domain is null`(이미지 없음).
3. **status<>3 기본제외 없음**: 기본 목록에 판매종료(3) 포함. 기본 WHERE는 `product_platform<>'3'`(플랫폼 3=Origin 제외)뿐.
4. 미사용 캡처 파라미터: `search_product_platform`, `search_game_type`, `search_sales_status`(WHERE 미반영) — 이식 생략(폼에도 없음).
6. **판매상태 필터 라벨 ↔ 뱃지 불일치(legacy 자체 버그)**: 필터 라디오는 `value="1"`을 "승인대기"로 라벨링하나, `Admin::getProductStatus`는 status `1`=판매중지 / `9`=승인대기. 즉 "승인대기" 필터를 선택하면 실제로는 status=1(판매중지) 상품이 조회·렌더됨. 필터 폼을 legacy 그대로 이식(라벨 승인대기=1)하여 이 불일치까지 재현. (뱃지는 `ProductStatusBadge`=getProductStatus 매핑 유지)
5. 페이지 내 bundle/package 모달·DataTables JS는 이 화면 목록과 무관(비고 드롭다운에 해당 트리거 없음) → 이식 생략.

## 데이터 (legacy)

- 도메인 클래스: `Admin::getGoodsOptionList($page, $add_where, $orderby='product_code desc', $param, 20)`.
- 기본 WHERE: `product_platform<>'3'`. 조건부: search_key(product_name/en LIKE, product_code 등호), `status=?`, `domain=?`(Null→is null).
- 디스크엔 버튼: 웹서버 header.jpg `file_exists`.
- 액션: `goods_option_ps.php mode=diskn_upload_chk`(product_code) — 디스크엔 업로드 완료 처리.

## API 계약 (백엔드 전달)

### `GET /admin/goods/options/image-chk`

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 20개/page |
| `search_key` | string | `search_product_name` \| `search_product_code` |
| `search_value` | string | 검색어 |
| `search_status` | string | `1`(승인대기) \| `0`(판매중) \| `3`(판매종료) |
| `search_domain` | string | `all` \| `https://directg.net` \| `https://image.directg.net` \| `Null`(이미지없음) |
| `search_is_view` | string | `all`\|`Y`\|`N` (⚠️ WHERE 미적용 dead 필터 — 전달하되 무시) |

백엔드 책임:
- 기본 WHERE `product_platform<>'3'`, `order by product_code desc`.
- `search_domain='all'` empty, `='Null'` → `domain is null` (legacy 그대로).
- `search_is_view`는 무시(legacy 버그 유지).
- 응답 항목은 옵션 목록(#37) `OptionListItem` + `domain` + **`header_web_exists`**(웹서버 header.jpg 존재 → 디스크엔 버튼 노출용).

응답 `200`: `{ items: OptionListItem[](+domain,+header_web_exists), pagination }`.

### `POST /admin/goods/options/diskn-upload-chk`

legacy `goods_option_ps.php mode=diskn_upload_chk`.
- 요청: `{ "product_code": "DG-..." }`
- 응답 `200`: `{ "success": true }`
- 프론트: onSuccess 목록 invalidate(=legacy location.reload), 별도 alert 없음.

## 타겟 매핑

- 라우트: `routes/goods/goods_option_image_chk.tsx` → `/goods/goods_option_image_chk`
- screens: `screens/goods-option-image-chk`
- entities: `goods-option` 확장 — `OptionImageChkSearch`, `OptionListItem.header_web_exists?`, `fetchOptionImageChkList`, `disknUploadChk`, `useOptionImageChkList`, `useDisknUploadChk`
- shared: `shared/ui/ServerPagination`, `ProductStatusBadge`
- mock: `goods-option.ts` — `OPTION_IMAGE_STATE`(domain/header side-map) + `GET /admin/goods/options/image-chk` + `POST /admin/goods/options/diskn-upload-chk`

## Parity 체크리스트

- [ ] 화면 요소 일치 (타이틀/필터 5종/9컬럼 2행/드롭다운 8항목/이미지 프리뷰)
- [ ] 필드/검증 일치 (search_key 2옵션, 도메인 4옵션(Null 포함), status 3옵션)
- [ ] 분기/플로우 일치 (디스크엔 버튼 조건, diskn_upload_chk→reload, product_code desc)
- [ ] 엣지케이스 일치 (all empty, Null=이미지없음, is_view 무동작, status 3 포함)
