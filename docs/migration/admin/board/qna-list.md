# 문의하기 목록 (1:1 QnA)

## 원본
- 파일: `pc/_Admin_/board/qna_list.php` + `qna_ps.php`(mode=delete) + `AdminBoard::getQnaList()`(dgkr)
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§문의하기 목록), `../legacy-project/docs/BOARD-CONTENT.md`, `NOTIFICATION-EMAIL.md`

## 화면·플로우
- 진입 URL/파라미터: `/board/qna_list?page&searchType&searchTitle&searchGubun&is_answer&replyStatus&email_flag`
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈/게시판/문의하기 관리/**문의하기 목록**, h4 동일
  - 검색필터 카드(`검색필터`):
    - **검색어**: `searchType` select(제목 subject / 작성자 user_id / 내용 contents / 제목+내용 subject_contents) + `searchTitle` text(placeholder 제목검색)
    - **구분**: `searchGubun` select(전체 + 9종)
    - **답변상태**: `is_answer` radio(전체 ''/답변대기 N/답변완료 Y)
    - **고객 답변 확인 여부**: `replyStatus` radio(전체 ''/확인 1/미확인 0)
    - **메일발송**: `email_flag` radio(전체 ''/발송 Y/미발송 N)
    - 버튼 `검색`
  - 총건수 `{n} 개`
  - 테이블(10컬럼): 체크박스(select-all + 행별 idx[], **bulk 삭제 배선**) / 번호(**역순 계산** num=total-(page-1)*30, 행마다 --) / 구분(gubun_array) / 제목(qna_view 링크 + `file_cnt>0`면 첨부아이콘 `dripicons-photo`) / 작성자(user_id) / 작성일(reg_date) / 답변상태(`answer!=""?O:X` + `(admin_id)`) / 고객 답변 확인 여부(`replyStatus=="1"?확인:""`) / 메일발송(`email_flag=="Y"?발송:""`) / 답변(수정 아이콘 → qna_register)
  - 하단 행: `선택한 게시글 [삭제]`(all-delete-btn)
  - 페이지네이션 `links_html`(30/page, 필터 q_string 유지)
- 분기/플로우:
  - 제목 링크 → `qna_view.php?<q_string>&idx=`(→ `/board/qna_view`, #119 미이관)
  - 수정 아이콘 → `qna_register.php?<q_string>&idx=`(→ `/board/qna_register`, #120 미이관)
  - **다중삭제**: select-all(customCheck1) → 전체 토글, all-delete-btn → 미선택 시 `alert("선택하신 글이 없습니다.")`, 선택 시 `confirm("선택한 글을 삭제하시겠습니까?\n\r영구 삭제되어 복원 불가능합니다.")` → POST qna_ps mode=delete(idx[]) → `alert("{n} 개 삭제되었습니다.")` → reload
  - **localStorage 읽음표시**(`qna_read_ids`): 제목 클릭 시 idx 저장 + 행 `.qna-read`(회색 #888). 로드 시 저장된 idx 행에 적용. 최대 2000개(초과 시 shift).
- 세션/권한: `$_SESSION['admin']`(공통). 데이터는 dgkr(`directgames.tbl_qna`).

### legacy quirk / 버그 (그대로 이식 · 확인 필요)
- **`subject_contents`(제목+내용) 필터는 broken**: where가 ``subject_contents` like`를 쓰나 tbl_qna에 해당 컬럼 없음 → getQnaList SQL 에러(paginationException→에러 출력). 실제 (제목 OR 내용) OR 검색이 아님. → mock은 **빈 결과**로 근사. **개발자 확인 대상**(broken 유지 vs subject OR contents로 수정).
- `gubun like {searchGubun}`: 숫자·와일드카드 없음 → 사실상 등호. mock 등호로 이식.
- 번호는 idx가 아닌 역순 표시번호(페이지 걸쳐 감소).
- 답변상태는 `answer` 비어있지 않으면 O(별도 is_answer 컬럼과 별개 판정), 뒤에 `(admin_id)` 항상 표기.

## 데이터 (legacy)
- `getQnaList`: `select *, (SELECT COUNT(1) FROM tbl_file WHERE puid=idx AND table_name='tbl_qna') as file_cnt from directgames.tbl_qna where 1=1 <where> order by idx DESC` (30/page)
- where: `gubun like {n}` / `is_answer='v'` / `replyStatus='v'` / email_flag Y→`='Y'`,N→`(=''OR IS NULL)` / `{searchType} like '%v%'`
- 삭제(qna_ps delete): `DELETE FROM tbl_qna WHERE FIND_IN_SET(idx, :csv)` (idx[] 콤마조인)

## API 계약 (백엔드 전달)
- `GET /admin/board/qnas` — 문의하기 목록
  - 요청(query): `page`, `searchType`(subject|user_id|contents|subject_contents), `searchTitle`(LIKE `%v%`), `searchGubun`(gubun 등호 1~9), `is_answer`(Y|N), `replyStatus`(0|1), `email_flag`(Y=발송 / N=미발송[''·null])
  - 응답:
    ```jsonc
    {
      "items": [
        { "idx": 0, "gubun": "1", "subject": "", "user_id": "", "reg_date": "YYYY-MM-DD HH:MM:SS",
          "answer": "", "admin_id": "", "replyStatus": "0|1|", "email_flag": "Y|", "file_cnt": 0 }
      ],
      "pagination": { "current_page": 1, "results_per_page": 30, "total_results": 0, "total_pages": 1 }
    }
    ```
  - 정렬: `idx DESC`. 30/page. `subject_contents`는 legacy broken(백엔드 정책 확정 필요).
- `POST /admin/board/qnas/delete` — 다중 삭제
  - 요청: `{ "idx": [1,2,3] }`
  - 응답: `{ "success": true, "deleted": 3 }` (deleted 수로 alert 문구). 백엔드: `DELETE ... FIND_IN_SET`.

## 타겟 매핑
- 라우트: `/board/qna_list` (`routes/board/qna_list.tsx`, validateSearch)
- 스크린: `screens/qna-list`
- entities: 신규 `entities/qna` (list + bulk delete)
- mock: 신규 `shared/mocks/handlers/qna.ts` (list 필터·페이징 + bulk delete), `handlers.ts` 등록

## Parity 체크리스트
- [ ] 5필터(검색어/구분/답변상태/고객확인/메일발송) 동작·selected 유지
- [ ] 10컬럼·역순 번호·첨부아이콘·답변상태 O/X(admin_id)·확인/발송 표기
- [ ] 다중선택(select-all)·삭제 confirm/alert·삭제 반영
- [ ] localStorage 읽음표시(클릭 회색)
- [ ] idx DESC, 30/page, 필터 유지 페이징/링크
- [ ] subject_contents broken(빈결과) — 개발자 확인 대상
