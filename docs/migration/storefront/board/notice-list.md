# 공지사항 목록 (board/notice)

## 원본
- 파일: `pc/board/notice.html` (라이브 — 모든 헤더 첫 링크 `/board/notice.html`)
- 도메인 클래스: `src/classes/Board.php::getNoticeList` (extends `Pagination`)
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/BOARD-CONTENT.md`
- 선례: `entities/mypage-point`(fetcher/types) + `shared/ui/server-pagination`(ServerPagination) + `screens/mypage-point`(목록+페이징 렌더) + MSW handler/fixture

## 화면·플로우
- 진입 URL/파라미터: `/board/notice.html`, GET `?page=N&searchValue=S`
- 화면 요소 (legacy 기준):
  - `div.container.my-3.pb-5` > `main` > `h2.page-title.mb-4` "공지사항" (※ aside 없음)
  - `div.row.g-0` > `col-12` > `table.table.table-bordered.table-centered.mb-0.text-center.align-middle.text-nowrap`
    - thead `table-light font-14`: (구분 th 주석처리) 제목/작성일자/조회수 — `th.text-center.table-light`
    - tbody `font-14 table-dark`:
      - 빈 목록(total_results=="0"): `<tr><td colspan="3" class="text-center">등록된 게시물이 없습니다.</td></tr>`
      - 행: (구분 td 주석) 제목 `td.text-start.py-2 > a[href="/board/notice_view.html?idx=IDX"].text-white.link-underline.link-underline-opacity-0` / 작성일자 `td.text-center.py-2`(deploy_date **substr 0,10**) / 조회수 `td.text-center.py-2`(**number_format(hit)**)
  - `div.row.g-0 > div.my-3 > div#pagination.mt-4` → 서버 페이지네이션(`links_html`)
  - `div.row.g-0 > div.offset-4.col-4 > form[method=GET][action=""] > div.row.g-3 > div.input-group`: (구분 select 주석) `input.form-control.form-control-lg[name=searchValue][placeholder=제목][value=searchValue]` + `button.btn.btn-dark.btn-lg.shadow-none[type=submit]` "검색"
- 폼: 제목 검색(GET searchValue). 검증 없음.
- 분기/리다이렉트: 없음(제목 클릭 → notice_view.html, 별도 단위)
- 세션/권한 의존: **없음**(비로그인 접근)

## 데이터 (legacy)
- `Board::getNoticeList($page,$add_where,$orderby,$param)`:
  - SQL: `select idx,notice_type,subject,deploy_date,hit from tbl_notice where is_view='Y' [add_where] order by [orderby]`
  - `add_where`: searchValue 있으면 ` and subject like '%<searchValue>%'`
  - `orderby`: ` is_notice desc,deploy_date desc` (고정 공지 상단)
  - 페이지네이션: `results_per_page=20`, url `PHP_SELF?page=*VAR*` + `$param`
- **legacy quirk**: `$param`이 notice.html에서 미정의 → 페이지네이션 링크에 searchValue **미포함**(`?page=N`만). 즉 검색 후 페이지 이동 시 검색어 유실. → 타겟도 동일 재현(ServerPagination에 searchValue 미전달).

## API 계약 (백엔드 전달)
- `GET /api/board/notices?page=N&searchValue=S`
  - 요청: `page`(1-base, 기본 1), `searchValue`(선택, 제목 LIKE)
  - 응답: `{ list: NoticeListRow[]; page: number; totalPages: number }`
    - `NoticeListRow { idx: number; notice_type: string; subject: string; deploy_date: string; hit: number }`
  - 백엔드 책임: `is_view='Y'` 필터, `subject LIKE '%S%'`, `order by is_notice desc, deploy_date desc`, 20건/page, totalPages 계산
- 응답 타입: `entities/board-notice/model/types.ts`

## 타겟 매핑
- 라우트: `app/board/notice.html/page.tsx` → `/board/notice.html` (searchParams page/searchValue)
- screen: `screens/board-notice-list`
- entities: `entities/board-notice` (`getBoardNotices(page, searchValue)`)
- 공용: `shared/ui/server-pagination`(ServerPagination, baseUrl `/board/notice.html`, params 없음=검색어 미포함 quirk)
- mock: `shared/mocks/fixtures/board-notices.ts` + handler `GET */api/board/notices`

## 단위 경계 결정 / quirk
1. aside 없음 — full container.
2. 페이지네이션 검색어 유실(quirk) 재현.
3. notice_type/구분 컬럼 주석처리 → 미렌더(타입엔 포함, 렌더 안 함 = legacy select 동일).
4. deploy_date substr(0,10)=날짜만, hit number_format(천단위 콤마).
5. 제목 클릭 → notice_view.html(별도 단위, 링크 href만 유지).

## Parity 체크리스트
- [ ] 화면 요소 일치 (제목 h2 + 표 3열 + 페이지네이션 + 검색폼)
- [ ] 빈 목록 "등록된 게시물이 없습니다." (colspan=3)
- [ ] deploy_date 날짜만(0,10) / hit 천단위 콤마
- [ ] 검색 GET searchValue 동작 / 페이지네이션은 검색어 미포함(quirk)
- [ ] SEO(title 공지사항/viewport/description/author H2interactive) 일치, canonical/OG 없음
