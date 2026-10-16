# 자주묻는질문 목록

## 원본
- 파일: `pc/_Admin_/board/faq_list.php` + `src/classes/AdminBoard.php::getFaqList()`
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§자주묻는질문 목록), `../legacy-project/docs/BOARD-CONTENT.md`(FAQ 분류)

## 화면·플로우
- 진입 URL/파라미터: `/board/faq_list?page&search_item_cd&search_subject`
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈 / 게시판 / 자주묻는질문 관리 / **자주묻는질문 목록**(active), h4 동일
  - 검색필터 카드(`검색필터`):
    - **구분**: `btn-group` radio 토글(`search_item_cd`, `btn-check`+`label.btn.btn-outline-primary`) 17개 — **전체 + 16분류, 특정 순서·비순차 id 그대로**:
      전체(all,item_cd_all) / 계정,회원(M01,item_cd_2) / 포인트(M02,item_cd_16) / 이용방법(S01,item_cd_1) / 게임 등록(S02,item_cd_6) / 게임 설치(S03,item_cd_10) / 게임 실행(S04,item_cd_9) / 상품(G01,item_cd_13) / 구성,DLC(G02,item_cd_7) / 특전(G03,item_cd_8) / 한글(G04,item_cd_11) / 주문,결제(O01,item_cd_3) / 제품 코드(키)(O02,item_cd_5) / 취소,환불(O03,item_cd_4) / 가격(O04,item_cd_12) / 할인(O05,item_cd_14) / 기타(E01,item_cd_15)
    - **질문검색**: text(`search_subject`, placeholder `검색어`)
    - 버튼 `자주묻는질문 검색`
  - 총건수 `{n} 개`
  - 테이블(5컬럼): 체크박스(select-all + 행별, **dead UI**) / 번호(idx) / 구분(`faq_type_label[faq_type]`) / 내용(카드: `[질문] question` header + `[답변] Parsedown(answer)` body) / 비고(수정 아이콘 → `faq_register.php?mode=modify&idx=`)
  - 페이지네이션 `links_html`(30/page) → `ServerPagination`
- 폼필드/검증: 없음(GET 필터).
- 분기/리다이렉트: 수정 아이콘 → `/board/faq_register?mode=modify&idx=`(#117 미이관, plain `<a href>`). **삭제·기타 mutation 없음**(목록에 삭제 버튼 없음).
- 세션/권한: `$_SESSION['admin']`(공통).

### legacy quirk (그대로 이식)
- 구분 라디오 id 비순차(`item_cd_2`,`item_cd_16`,`item_cd_1`...) + 표시 순서(map 순서와 다름) 그대로.
- 기본 로드(search_item_cd 빈값) 시 `전체` 포함 **어떤 라디오도 미체크**(`$checked[''`]가 매칭 없음). `all` 명시 선택 시에만 전체 체크.
- 체크박스 컬럼은 bulk 액션 미배선 dead UI.
- `question`은 legacy가 raw 출력이나 실데이터는 평문 → 타겟은 텍스트로 렌더(React 이스케이프). `answer`만 Parsedown HTML.

### faq_type_label (구분 셀)
`M01`=계정,회원 / `M02`=포인트 / `O01`=주문,결제 / `O02`=제품 코드(키) / `O03`=취소,환불 / `O04`=가격 / `O05`=할인 / `G01`=상품 / `G02`=구성,DLC / `G03`=특전 / `G04`=한글 / `S01`=이용방법 / `S02`=게임 등록 / `S03`=게임 설치 / `S04`=게임 실행 / `E01`=기타

## 데이터 (legacy)
- `AdminBoard::getFaqList($page,$add_where,$orderby,$param)` = `select * from tbl_faq where 1=1 <where> order by idx desc` (30/page)
- `add_where`: `search_item_cd`(≠all,≠"") → ` and faq_type='<v>'`, `search_subject` → ` and question like '%<v>%'`
- answer 렌더: `Parsedown->text(answer)`

## API 계약 (백엔드 전달)
- `GET /admin/board/faqs` — 자주묻는질문 목록
  - 요청(query): `page`(기본 1), `search_item_cd`(faq_type 등호, `all`/빈값 미적용), `search_subject`(question LIKE `%v%`)
  - 응답:
    ```jsonc
    {
      "items": [
        { "idx": 0, "faq_type": "M01", "question": "", "answer_html": "<p>...</p>" }
      ],
      "pagination": { "current_page": 1, "results_per_page": 30, "total_results": 0, "total_pages": 1 }
    }
    ```
    - `answer_html`: 백엔드 Parsedown 렌더 HTML(뷰용, dangerouslySetInnerHTML). `question`은 평문.
  - 정렬: `idx desc`. 30/page.

## 타겟 매핑
- 라우트: `/board/faq_list` (`routes/board/faq_list.tsx`, validateSearch)
- 스크린: `screens/faq-list`
- entities: 신규 `entities/faq` (types/fetcher/queries — list only)
- mock: 신규 `shared/mocks/handlers/faq.ts` (list 필터·페이징 + answer_html mock 렌더), `handlers.ts` 등록

## Parity 체크리스트
- [ ] 구분 btn-group 17개(순서·id·라벨) 일치, 기본 미체크 quirk
- [ ] 질문검색 LIKE, faq_type 등호(all 미적용)
- [ ] 5컬럼·내용 카드([질문]/[답변] Parsedown) 일치
- [ ] idx desc, 30/page, 총건수
- [ ] 수정 링크 URL(미이관), mutation 없음
