# 공지사항 목록 (+삭제)

## 원본
- 파일:
  - `pc/_Admin_/board/notice_list.php` — 공지사항 목록(라이브, 변형 없음)
  - `pc/_Admin_/board/notice_ps.php` (mode=`delete`) — 목록에서 호출하는 삭제 처리기
  - `src/classes/AdminBoard.php::getNoticeList()` — 목록 쿼리(30/page, Pagination)
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§공지사항 목록), `../legacy-project/docs/BOARD-CONTENT.md`

## 화면·플로우
- 진입 URL/파라미터: `/board/notice_list?page&search_title&search_notice_type`
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈 / 게시판 / 공지사항 관리 / **공지사항 목록**(active), h4 `공지사항 목록`
  - 검색필터 카드(`검색필터`, `card-header bg-secondary text-white`):
    - **구분** radio(`search_notice_type`): `1` 제품코드(키) 발송 / `2` **프로모션** / `3` 상품 출시/판매 / `4` 기타
    - **제목** text(`search_title`, placeholder `제목검색`)
    - 제출 버튼 `공지사항 검색`
  - 총건수: `{total_results} 개`
  - 테이블(9컬럼): 체크박스(select-all `customCheck1` + 행별 `idx` — **bulk 액션 미배선, dead UI**) / 고유번호(idx) / 구분(gubun) / 제목(`is_notice=='Y'`면 `공지` badge `badge badge-outline-danger` + subject) / 작성일자(수정일자)(**헤더는 (수정일자) 포함이나 셀은 `reg_date`만 출력**) / 배포일자(deploy_date) / 노출(`is_view=='Y'?'O':'X'`) / 조회수(`number_format(hit)`) / 비고(상세·수정·삭제 아이콘)
  - 페이지네이션: `links_html`(Pagination 클래스, 30/page) → `shared/ui/ServerPagination`
- 폼필드/검증: 없음(단순 GET 필터, required 없음). 빈값 필터 미적용.
- 분기/리다이렉트:
  - 상세 아이콘 → `notice_view.php?idx=` (→ `/board/notice_view?idx=`, #115 미이관 — plain `<a href>`)
  - 수정 아이콘 → `notice_register.php?mode=modify&idx=` (→ `/board/notice_register?mode=modify&idx=`, #114 미이관 — plain `<a href>`)
  - 삭제 아이콘(`btn_delete`) → `confirm("정말로 삭제하시겠습니까?")` → AJAX POST `notice_ps.php{mode:delete,idx}` → `location.reload()`
- 세션/권한 의존: `$_SESSION['admin']` 가드(공통 인프라). 프론트 동작은 legacy 동일(서버측 강제는 백엔드 책임).

### 구분(notice_type) 라벨 — legacy 불일치 (그대로 이식)
- **테이블 셀**(`$gubun_array`): 1=제품코드(키) 발송 / 2=**프로모션/이벤트** / 3=상품 출시/판매 / 4=기타
- **필터 radio**: 1=제품코드(키) 발송 / 2=**프로모션** / 3=상품 출시/판매 / 4=기타
- → 2번 라벨이 테이블(`프로모션/이벤트`)과 필터(`프로모션`)에서 상이. legacy quirk로 각각 원문 유지.

## 데이터 (legacy)
- 도메인 클래스·메서드: `AdminBoard::getNoticeList($page,$add_where,$orderby,$param)`
- SQL 요약:
  - `select * from tbl_notice where 1=1 <add_where> order by deploy_date desc` (30/page)
  - `add_where`: `search_title` → ` and subject like '%<val>%'`, `search_notice_type` → ` and notice_type='<val>'` (빈값 미적용)
  - 삭제(mode=delete): `delete from tbl_notice where idx=:idx` (**하드 삭제** — banner의 소프트 삭제와 다름)
- 사용 컬럼: `idx, notice_type, subject, is_notice, reg_date, deploy_date, is_view, hit` (목록 표시분)

## API 계약 (백엔드 전달)
- `GET /admin/board/notices` — 공지사항 목록
  - 요청(query): `page`(기본 1), `search_title`(subject LIKE `%val%`, 빈값 미적용), `search_notice_type`(`notice_type` 등호 `1|2|3|4`, 빈값 미적용)
  - 응답:
    ```jsonc
    {
      "items": [
        { "idx": 0, "notice_type": "1", "subject": "", "is_notice": "Y|N",
          "reg_date": "YYYY-MM-DD HH:MM:SS", "deploy_date": "YYYY-MM-DD HH:MM:SS",
          "is_view": "Y|N", "hit": 0 }
      ],
      "pagination": { "current_page": 1, "results_per_page": 30, "total_results": 0, "total_pages": 1 }
    }
    ```
  - 정렬: `deploy_date desc`. 30/page.
- `DELETE /admin/board/notices/{idx}` — 공지사항 하드 삭제
  - 응답: `{ "success": true }` (없는 idx는 `{ "success": false }` 404)
  - 백엔드 책임: `tbl_notice` DELETE. (연관 `tbl_notice_goods` 처리는 legacy 미수행 → 그대로. 서버측 admin 권한 강제.)

## 타겟 매핑
- 라우트: `/board/notice_list` (`routes/board/notice_list.tsx`, validateSearch)
- 스크린: `screens/notice-list`
- entities: `entities/notice` (types/fetcher/queries — list + delete)
- mock: `shared/mocks/handlers/notice.ts` (list 필터·페이징 + delete 실제 제거), `handlers.ts` 등록

## Parity 체크리스트
- [ ] 화면 요소 일치(breadcrumb/필터/컬럼/총건수/페이징)
- [ ] 구분 라벨 테이블↔필터 불일치(2=프로모션/이벤트 vs 프로모션) 그대로 이식
- [ ] `is_notice` 공지 badge, `is_view` O/X, `hit` 천단위, 작성일자 셀 reg_date만
- [ ] 검색 필터(제목 LIKE / notice_type 등호, 빈값 미적용) 동작 일치
- [ ] 삭제 confirm 문구·하드삭제·목록 갱신 일치
- [ ] 상세/수정 링크 URL 형식 일치(미이관 대상)
