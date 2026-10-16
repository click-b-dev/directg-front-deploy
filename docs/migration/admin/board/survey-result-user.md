# 설문조사 사용자별 결과

## 원본
- 파일: `pc/_Admin_/board/survey_result_user.php` + `AdminBoard::getSurveyInfo/getSurveyCount/getUserAnswerList/getUserAnswerInfo`
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§설문조사 사용자별 결과)

## 화면·플로우
- 진입 URL/파라미터: `/board/survey_result_user?idx=&page=&search_value=`(survey_result #127의 계정별 결과에서 진입)
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈/게시판/설문조사 관리/**설문조사 '사용자별' 결과보기**, h4 동일
  - `설문조사 요약` 카드: 설문 제목/기간/참여제한/참여자현황(#127과 동일)
  - `설문 응답결과` 카드:
    - 검색 form: 검색어(`search_value`=회원ID, `tsa.m_id = 'val'` 정확일치)
    - **매트릭스 테이블**(가로 스크롤 `table-container`):
      - thead: `번호` / `회원ID` / 문항별 `{itemNum}번 문항`(버튼, tooltip=문항 텍스트) / 문항 `etc`면 추가 `{itemNum}번 문항 '기타'`
      - tbody: 사용자별 `번호`(역순 `total-(num+(page-1)*50)`) / `m_id` / 문항 답변(descript→answer_text / 객관식→answer 값) / etc면 기타 answer_text
    - 페이지네이션(50/page)
  - 페이지 `<style>`(테이블 레이아웃/hover 등) — 시각 상세, 기능 무관(대표 규칙만 이식)
- 세션/권한: `$_SESSION['admin']`(공통). read-only.

### legacy quirk / 결정
- excel 다운로드 JS(`#btn_excel_download`)는 있으나 **버튼 마크업 부재 → dead**(미이식).
- 문항 헤더는 Bootstrap tooltip(`data-bs-toggle=tooltip`)이나 Bootstrap JS 미로드(코드베이스 관례) → **native `title`**로 툴팁 기능 대체(+data-bs-* 마크업 유지).
- 셀 값: 객관식은 raw `answer`(선택 번호/값), 주관식은 `answer_text`, etc는 answer=100의 answer_text.
- 사용자 목록 GROUP BY m_id, idx DESC. 번호 역순.
- 매트릭스 조립(N 사용자 × M 문항, getUserAnswerInfo per cell)은 백엔드가 columns+rows로 반환.

## 데이터 (legacy)
- `getUserAnswerList(idx, page, param, add_where)`: `SELECT tsa.* FROM tbl_survey_answer tsa WHERE survey_idx={idx} {add_where} GROUP BY m_id ORDER BY idx DESC` (50/page)
- `getUserAnswerInfo(q_idx, m_id, add)`: 해당 문항·회원 답변(add `AND tsa.answer=100`으로 기타 조회)

## API 계약 (백엔드 전달)
- `GET /admin/board/surveys/{idx}/user-results?page=&search_value=` — 사용자별 결과 매트릭스
  - 응답:
    ```jsonc
    {
      "subject": "", "start_dt": "", "end_dt": "", "max_people": 0, "point": 0, "survey_count": 0,
      "columns": [ { "id": "q0", "label": "1번 문항", "tooltip": "문항 텍스트" } ],
      "rows": [ { "m_id": "", "values": ["...", "..."] } ],
      "pagination": { "current_page": 1, "results_per_page": 50, "total_results": 0, "total_pages": 1 }
    }
    ```
    - `columns`: 문항 순서대로(etc 문항은 본 컬럼 + `'기타'` 컬럼 2개). `rows[].values`는 columns 순서와 정렬.
    - `search_value`: m_id 정확일치 필터.

## 타겟 매핑
- 라우트: `/board/survey_result_user` (`routes/board/survey_result_user.tsx`, validateSearch `{idx, page, search_value}`)
- 스크린: `screens/survey-result-user`
- entities: `entities/survey` 확장(user-results)
- mock: `handlers/survey.ts` 확장(user-results — 문항 컬럼 + 합성 사용자 답변)

## Parity 체크리스트
- [ ] 요약(#127 동일)
- [ ] 매트릭스 thead(번호/회원ID/문항 tooltip/기타 컬럼)·tbody(번호 역순/m_id/셀 값)
- [ ] 회원ID 검색(정확일치), 50/page
- [ ] excel dead 미이식, tooltip native title 대체
