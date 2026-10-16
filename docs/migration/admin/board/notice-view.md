# 공지사항 상세 (미리보기)

## 원본
- 파일: `pc/_Admin_/board/notice_view.php` (read-only. `yjs_notice_view.php`는 거의 동일 변형 — 라이브는 `notice_view.php`)
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§공지사항 상세), `../legacy-project/docs/BOARD-CONTENT.md`

## 화면·플로우
- 진입 URL/파라미터: `/board/notice_view?idx=` (목록 #113 상세 아이콘에서 진입)
- 화면 요소 (legacy 기준, `col-8`):
  - breadcrumb: 홈 / 게시판 / **공시사항 관리**(오타 원문) / **공지사항 미리보기**(active)
  - h4 `공지사항 미리보기`
  - `<title>` = `공지사항 등록`(legacy `$page_title` — h4와 상이, quirk 유지)
  - 정보 테이블(`table table-bordered table-centered table-sm`, 7행):
    1. 구분 — `$gubun_array[notice_type]` (2=**프로모션/이벤트**, 목록 테이블과 동일 라벨)
    2. 제목 — `subject`
    3. 내용 — `<div class="p-2" id="content">` + **Parsedown 렌더 HTML**(마크다운→HTML, `&#13;&#10;`→`<br/>`)
    4. 고정 여부 — `is_notice` **raw 값(Y/N)** 그대로 출력(예/아니오 아님), th `w-20`/`style=width:10%`
    5. 작성일자 — `reg_date (admin_id)`
    6. 노출여부 — `is_view` **raw 값(Y/N)**
    7. 배포일자 — `deploy_date`
  - 페이지 `<style>`: `dt{font-weight:500} label{font-weight:500} blockquote{margin:0 0 1rem} #content img{width:100%}` — 렌더 콘텐츠 표시용, 그대로 이식.
- 폼필드/검증: 없음(read-only).
- 분기/리다이렉트: 없음(수정/목록 버튼 없음. 목록에서 진입만).
- 세션/권한 의존: `$_SESSION['admin']`(공통).

### legacy dead code (미이식)
- **연관상품 product-modal + JS**: `#product-modal`(hidden modal) + `#btn_goods_find` click → product_search → product_add JS가 있으나, **트리거 버튼 `#btn_goods_find`·검색 input `#search_value`가 DOM에 없어** 절대 실행되지 않음. `$notice_product`(tbl_notice_goods 조인) 조회 결과도 화면에 렌더되지 않음. 전부 dead → 미이식(#114와 동일 판단).

### legacy quirk (그대로 이식)
- breadcrumb "공시사항 관리" 오타, `<title>`=공지사항 등록(h4=미리보기와 상이).
- 고정여부/노출여부는 raw `Y`/`N` 출력(폼의 예/아니오 라벨과 다름).

## 데이터 (legacy)
- `select * from tbl_notice where idx=:idx`
- 내용 렌더: `str_replace("&#13;&#10;","<br/>", Parsedown->text(htmlspecialchars_decode(contents, ENT_NOQUOTES)))`
- (dead) `tbl_goods_item ⋈ tbl_notice_goods` 연관상품 — 미렌더

## API 계약 (백엔드 전달)
- `GET /admin/board/notices/{idx}` — 상세(#114에서 생성, **`contents_html` 필드 추가**)
  - 응답: `{ idx, notice_type, subject, contents, contents_html, is_notice, is_view, deploy_date, reg_date, admin_id }`
    - `contents`: 원문 마크다운(편집용, #114)
    - `contents_html`: **백엔드 Parsedown 렌더 결과 HTML**(뷰용, `&#13;&#10;`→`<br/>` 치환 포함). 프론트는 `dangerouslySetInnerHTML`로 출력(title-view `*_html` 관례).
  - 없는 idx는 404.

## 타겟 매핑
- 라우트: `/board/notice_view` (`routes/board/notice_view.tsx`, validateSearch `{idx}`)
- 스크린: `screens/notice-view`
- entities: `entities/notice` — `NoticeDetail`에 `contents_html` 추가(fetcher/query는 #114 `useNoticeDetail` 재사용)
- mock: `handlers/notice.ts` detail 핸들러에 `contents_html`(mock md→html) 추가

## Parity 체크리스트
- [ ] breadcrumb/h4/title(quirk) 일치
- [ ] 7행 정보 테이블 항목·순서 일치
- [ ] 내용 마크다운 렌더(HTML) 출력
- [ ] 고정/노출 raw Y/N 출력, 작성일자 `reg_date (admin_id)` 일치
- [ ] 연관상품 dead code 미이식 확인
