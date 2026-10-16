# 제공컨텐츠 관리 - 제공컨텐츠 현황

## 원본

- 파일: `pc/_Admin_/goods/supply_content.php` (라이브)
- 형제: `supply_content_member.php`(회원별 조회), `supply_content_download.php`(다운로드 현황), `supply_content_register.php`(등록, 후속)
- 신규 도메인(제공컨텐츠) — 기존 엔티티 없음, `supply-content` 엔티티 신설.

## 화면·플로우

- 진입 URL/파라미터: `/goods/supply_content`
  - `page`, `search_value`, `search_supply_content_type`, `search_is_encode`
- 성격: **읽기 전용 목록.** 제공컨텐츠(한글패치/컨텐츠)별 URL·암호화·제공상품 현황.

- 화면 요소 (legacy 기준):
  - page_title `제공컨텐츠 현황` / breadcrumb: 홈 > 상품 > 제공컨텐츠 관리 > 제공컨텐츠 현황
  - 검색필터 카드(`제공컨텐츠 조회`):
    - 제공 컨텐츠명 text(`search_value`)
    - 제공 컨텐츠 유형 radio: 한글패치(`P`) / 컨텐츠(`C`)  (전체 옵션 없음)
    - 암호화 여부 radio: 암호화 있음(`Y`) / 암호화 없음(`N`)  (전체 옵션 없음)
    - submit `제공컨텐츠 조회`
  - 카운트: `{total} 개`
  - 목록 카드(`제공 컨텐츠 현황`), 테이블(`table-centered w-100 nowrap table-sm table-bordered`, colgroup 3/5/18/*/6/34, thead `table-light font-13`, tbody `font-12`), 6컬럼:
    - 번호 = `num + (page-1)*30` (오름차순)
    - 유형 = `supply_content_type=='P' ? 한글패치 : 컨텐츠`
    - 제공 컨텐츠명 = `supply_content` (text-start)
    - 제공 컨텐츠 URL = `supply_content_url` (text-start)
    - 암호화 정보 = `is_encode=='Y' ? 암호화 있음 : 암호화 없음`, Y면 `<br>({encode_type})`
    - 제공 상품정보 = 하위 goods 목록. 각 행 `{goods_code} / {goods_nm} / {asset_id}`, `is_free=='Y'`면 뒤에 ` / [무료제공]`(label label-info) 뱃지. 각 항목 개행.
  - 페이지네이션

### 특이사항

- 유형/암호화 radio에 "전체" 옵션 없음 → 한 번 선택 시 UI로 해제 불가(재진입 필요). legacy 그대로.
- 정렬 `title_id desc`(제공컨텐츠를 연결 타이틀 기준 정렬).

## 데이터 (legacy)

- `AdminGoods::getSupplyContentList($page, $add_where, $orderby='title_id desc', $param, 30)` — 30/page.
- 항목별 `AdminGoods::getSupplyContentGoodsList($idx)` — 해당 컨텐츠를 제공하는 상품 목록(goods_code/goods_nm/asset_id/is_free).
- WHERE: `supply_content LIKE`, `supply_content_type=`, `is_encode=`.
- 컬럼: `idx, supply_content_type, supply_content, supply_content_url, is_encode, encode_type`.

## API 계약 (백엔드 전달)

### `GET /admin/goods/supply-contents`

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 30개/page |
| `search_value` | string | supply_content LIKE |
| `search_supply_content_type` | string | `P`(한글패치) \| `C`(컨텐츠) |
| `search_is_encode` | string | `Y` \| `N` |

백엔드 책임: `order by title_id desc`, 항목별 제공상품 서브목록 포함.

응답 `200`:
```jsonc
{
  "items": [{
    "idx": 101,
    "supply_content_type": "P",           // P | C
    "supply_content": "한글패치 v1.2",
    "supply_content_url": "https://.../patch.zip",
    "is_encode": "Y",                       // Y | N
    "encode_type": "AES-256",               // is_encode=Y일 때만 표시
    "goods": [
      { "goods_code": "DG-...", "goods_nm": "...", "asset_id": "...", "is_free": "N" }
    ]
  }],
  "pagination": { "current_page": 1, "results_per_page": 30, "total_results": 12, "total_pages": 1 }
}
```

## 타겟 매핑

- 라우트: `routes/goods/supply_content.tsx` → `/goods/supply_content`
- screens: `screens/goods-supply-content`
- entities: **신규 `supply-content`** — `SupplyContentSearch`/`SupplyContentGoods`/`SupplyContentItem`/`SupplyContentListResponse`, `fetchSupplyContentList`, `useSupplyContentList`
- shared: `shared/ui/ServerPagination`
- mock: **신규 `shared/mocks/handlers/supply-content.ts`**(handlers.ts 등록) — `SUPPLY_CONTENT_LIST` + `GET /admin/goods/supply-contents`

## Parity 체크리스트

- [ ] 화면 요소 일치 (page_title/필터 3종/6컬럼 colgroup)
- [ ] 필드/검증 일치 (유형 P/C, 암호화 Y/N, encode_type 조건표시)
- [ ] 분기/플로우 일치 (제공상품 목록 무료제공 뱃지, 번호 오름차순, title_id desc)
- [ ] 엣지케이스 일치 (암호화 없음 시 encode_type 미표시, 제공상품 없음)
