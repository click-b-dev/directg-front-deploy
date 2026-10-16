# 심의정보 관리 - 심의정보 현황 (심의정보 리스트)

## 원본

- 파일: `pc/_Admin_/goods/grac/grac_list.php` (라이브)
- 신규 도메인(GRAC 심의신청 원장) — `grac` 엔티티 신설. (title_grac(#51)의 GracInfo와 별개 데이터 = `grac_list` 테이블 원장)

## 화면·플로우

- 진입 URL/파라미터: `/goods/grac/grac_list`
  - `page`, `search_rateno`, `search_gametitle`, `search_entname`, `search_platform`, `search_orgname`, `search_givenrate`
- 성격: **읽기 전용 목록.** 게임물관리위원회 등 심의신청 원장.

- 화면 요소 (legacy 기준):
  - h4/breadcrumb active = **`심의정보 리스트`** (page_title 변수는 "심의정보 현황"이나 마크업은 "심의정보 리스트" 하드코딩) / breadcrumb: 홈 > **상품관리** > 심의정보 리스트 (3항목, 그룹 crumb 없음)
  - 검색필터 카드(`심의정보 검색필터`):
    - 등급분류번호 text(`search_rateno`) / 게임물명 text(`search_gametitle`) / 신청자(업체)명 text(`search_entname`)
    - 등급분류기관 radio(`search_orgname`): 게임물관리위원회 / 게임콘텐츠등급분류위원회 / 자체등급분류사업자 (**전체 옵션 없음**)
    - 결정등급 radio(`search_givenrate`): 전체(all)/전체이용가/12세이용가/15세이용가/청소년이용불가/등급거부
    - 플랫폼 radio(`search_platform`): 전체(all)/PC·온라인 게임/비디오 게임/모바일 게임/아케이드 게임
    - submit `심의 검색`
  - 카운트: `{total} 개`
  - 목록 테이블(`table-centered w-100 table-sm table-bordered`, thead `table-light font-14`), 7컬럼: 등급분류번호(150)/게임물명/등급분류기관(160)/심의업체명(230)/결정등급(110)/등급분류일자(100)/비고(80, 빈칸 table-action)
    - 상품별 **2행**:
      - 1행: rateno / gametitle / orgname / entname / givenrate / rateddate / (비고 빈칸)
      - 2행: th `내용정보표시` / td `descriptors` / th `게임플랫폼` / td `platform` / td colspan=3 `reg_date`
  - 페이지네이션(50/page)

### 필터 조건(legacy)

- `rateno LIKE '{val}%'` (앞일치) / `gametitle LIKE '%val%'` / `entname LIKE '%val%'`.
- `platform=` / `orgname=` / `givenrate=` (단, 값이 `all` 또는 빈값이면 미적용).

## 데이터 (legacy)

- `Admin::getGRACList($page, $add_where, $orderby='rateddate desc', $param)` — `select * from grac_list`, 50/page.
- 컬럼: `rateno, gametitle, orgname, entname, givenrate, rateddate, descriptors, platform, reg_date`.

## API 계약 (백엔드 전달)

### `GET /admin/goods/grac`

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 50개/page |
| `search_rateno` | string | rateno 앞일치(LIKE `val%`) |
| `search_gametitle` | string | gametitle LIKE %val% |
| `search_entname` | string | entname LIKE %val% |
| `search_orgname` | string | orgname 등호(`all`/빈값 미적용) |
| `search_givenrate` | string | givenrate 등호(`all`/빈값 미적용) |
| `search_platform` | string | platform 등호(`all`/빈값 미적용) |

백엔드 책임: `order by rateddate desc`.

응답 `200`:
```jsonc
{
  "items": [{
    "rateno": "CC-XR-2026-...", "gametitle": "...", "orgname": "게임물관리위원회",
    "entname": "H2 Interactive", "givenrate": "15세이용가", "rateddate": "2026-01-15",
    "descriptors": "폭력성, 선정성", "platform": "비디오 게임", "reg_date": "2026-01-10 09:00:00"
  }],
  "pagination": { "current_page": 1, "results_per_page": 50, "total_results": 3, "total_pages": 1 }
}
```

## 타겟 매핑

- 라우트: `routes/goods/grac/grac_list.tsx` → `/goods/grac/grac_list`
- screens: `screens/goods-grac-list`
- entities: **신규 `grac`** — `GracListSearch`/`GracListItem`/`GracListResponse`, `fetchGracList`, `useGracList`
- shared: `shared/ui/ServerPagination`
- mock: **신규 `shared/mocks/handlers/grac.ts`**(handlers.ts 등록) — `GRAC_LIST` + `GET /admin/goods/grac`

## Parity 체크리스트

- [ ] 화면 요소 일치 (심의정보 리스트/필터 6종/7컬럼 2행)
- [ ] 필드/검증 일치 (rateno 앞일치, gametitle/entname 부분일치, org/rate/platform 등호+all)
- [ ] 분기/플로우 일치 (2행 내용정보/플랫폼/reg_date, rateddate desc, 50/page)
- [ ] 엣지케이스 일치 (all/빈값 미적용, descriptors 빈값)
