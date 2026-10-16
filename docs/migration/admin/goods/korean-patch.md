# 한글패치 관리 - 한글패치 현황

## 원본

- 파일: `pc/_Admin_/goods/korean_patch.php` (라이브)
- 형제: `korean_patch_auth.php`(인증정보 확인, 후속), `korean_patch_download.php`
- 신규 도메인(한글패치) — `korean-patch` 엔티티 신설.

## 화면·플로우

- 진입 URL/파라미터: `/goods/korean_patch` (파라미터 없음)
- 성격: **읽기 전용 전체 목록(필터·페이지네이션 없음).**

- 화면 요소 (legacy 기준):
  - page_title `한글패치 현황` / breadcrumb: 홈 > 상품 > 한글패치 관리 > 한글패치 현황
  - 목록 카드(`한글패치 리스트`), 테이블(`table-centered w-100 nowrap table-sm table-bordered`, thead `table-light`, tbody `font-13`), 3컬럼:
    - 번호(1부터 오름차순)
    - 한글패치명 = `goods_nm` (text-start)
    - 암호화 key = `prefix_text`
  - 페이지네이션 없음(전체 반환).

## 데이터 (legacy)

- `AdminGoods::getKoreanPatchList()` — 인자 없음(전체 목록). DGKR DB(`$dsn_dgkr`) 연결.
- 컬럼: `goods_nm, prefix_text`.

## API 계약 (백엔드 전달)

### `GET /admin/goods/korean-patches`

- 파라미터 없음.
- 백엔드 책임: 한글패치 전체 목록(정렬은 legacy getKoreanPatchList 순서 유지).

응답 `200`:
```jsonc
{
  "items": [
    { "goods_nm": "PREY 한글패치", "prefix_text": "PREY-H2-PROJECT:" }
  ]
}
```

## 타겟 매핑

- 라우트: `routes/goods/korean_patch.tsx` → `/goods/korean_patch`
- screens: `screens/goods-korean-patch`
- entities: **신규 `korean-patch`** — `KoreanPatchItem`/`KoreanPatchListResponse`, `fetchKoreanPatchList`, `useKoreanPatchList`
- mock: **신규 `shared/mocks/handlers/korean-patch.ts`**(handlers.ts 등록) — `KOREAN_PATCH_LIST` + `GET /admin/goods/korean-patches`

## Parity 체크리스트

- [ ] 화면 요소 일치 (page_title/한글패치 리스트 카드/3컬럼)
- [ ] 필드 일치 (번호/goods_nm/prefix_text)
- [ ] 분기/플로우 일치 (필터·페이지네이션 없음)
- [ ] 엣지케이스 일치 (빈 목록)
