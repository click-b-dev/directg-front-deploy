# 제공컨텐츠 관리 - 제공컨텐츠 다운로드 현황

## 원본

- 파일: `pc/_Admin_/goods/supply_content_download.php` (라이브)
- 형제: `supply_content.php`(#57), `supply_content_member.php`(#58)
- 엔티티: 기존 `supply-content` 확장.

## 화면·플로우

- 진입 URL/파라미터: `/goods/supply_content_download`
  - `page`, `search_key`(=`search_m_id`), `search_value`(회원 아이디)
- 성격: **한글패치/제공컨텐츠 다운로드 이력(로그) 목록.** (member 화면과 달리 기본 진입 시 전체 로그 표시, 페이지네이션 있음)

- 화면 요소 (legacy 기준):
  - page_title `제공컨텐츠 다운로드 현황` / breadcrumb: 홈 > 상품 > 제공컨텐츠 관리 > 제공컨텐츠 다운로드 현황
  - 검색 카드(`회원검색`): search_key select(회원아이디=`search_m_id`; 회원고유번호 주석처리) + search_value text + submit `회원 조회`
  - 목록 카드(`제공컨텐츠 다운로드 이력`), 테이블(`table-centered w-100 nowrap table-sm table-bordered`, colgroup 없음), 7컬럼:
    - 번호 = `total - ((page-1)*50 + num)` (num 0-base, **내림차순**)
    - 회원아이디 = `m_id`
    - 제공컨텐츠명 = `patch_name` (text-start)
    - 다운로드클릭횟수 = `count`
    - ip = `ip`
    - 다운로드일자 = `reg_date`
    - 마지막다운로드일자 = `last_download`
  - 페이지네이션 (50/page)

### 특이/차이

- `supply_content_member.php`(#58)와 검색 UI 동일(회원아이디)하나, **검색어 없어도 전체 로그 표시**(member는 검색 전 빈 목록).
- 정렬 `idx desc`, 50개/page.

## 데이터 (legacy)

- `AdminGoods::getKoreanPatchDownloadLog($page, $add_where, $orderby='idx desc', $param)` — 50/page.
- WHERE: `search_m_id`일 때 `m_id=` 등호.
- 컬럼: `idx, m_id, patch_name, count, ip, reg_date, last_download`.

## API 계약 (백엔드 전달)

### `GET /admin/goods/supply-contents/download-log`

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 50개/page |
| `search_key` | string | `search_m_id`(회원아이디) |
| `search_value` | string | 회원 아이디(등호) |

백엔드 책임: `order by idx desc`, `search_m_id`일 때 `m_id=` 필터.

응답 `200`:
```jsonc
{
  "items": [{
    "idx": 5001,
    "m_id": "tester01",
    "patch_name": "PREY 한글패치",
    "count": 3,
    "ip": "203.0.113.10",
    "reg_date": "2026-07-01 10:22:31",
    "last_download": "2026-07-15 18:03:11"
  }],
  "pagination": { "current_page": 1, "results_per_page": 50, "total_results": 3, "total_pages": 1 }
}
```

## 타겟 매핑

- 라우트: `routes/goods/supply_content_download.tsx` → `/goods/supply_content_download`
- screens: `screens/goods-supply-content-download`
- entities: `supply-content` 확장 — `PatchDownloadSearch`/`PatchDownloadItem`/`PatchDownloadResponse`, `fetchPatchDownloadLog`, `usePatchDownloadLog`
- shared: `shared/ui/ServerPagination`
- mock: `supply-content.ts` — `PATCH_DOWNLOAD_LOG` + `GET /admin/goods/supply-contents/download-log`

## Parity 체크리스트

- [ ] 화면 요소 일치 (page_title/회원검색/7컬럼)
- [ ] 필드/검증 일치 (search_m_id, 번호 역순, 50/page)
- [ ] 분기/플로우 일치 (검색 전 전체 표시, m_id 등호 필터, idx desc)
- [ ] 엣지케이스 일치 (회원 미존재 빈 목록)
