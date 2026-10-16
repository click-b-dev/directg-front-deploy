# 설문조사 '기타' 결과 (+CSV)

## 원본
- 파일: `pc/_Admin_/board/survey_result_etc.php` + `survey_result_etc_excel.php`(CSV) + `AdminBoard::getEtcAnswerList/getAnswerCount`
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§설문조사 '기타' 결과)

## 화면·플로우
- 진입 URL/파라미터: `/board/survey_result_etc?idx=&page=`(idx=**문항 idx**, survey_result #127의 답변보기에서 진입)
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈/게시판/설문조사 관리/**설문조사 '기타' 결과보기**, h4 동일
  - `설문조사 요약` 카드: 설문 제목(=`result[0].question` 문항 텍스트) / 내용 有 / 총 인원(`{total_results} / {answer_all_count} 명`, answer_all_count=getAnswerCount(idx,100), 0이면 total_results로 대체)
  - `설문 응답결과` 카드:
    - **CSV 다운로드 버튼**: `result[0].answer === NULL`(주관식)일 때만 노출. 클릭 시 total_results>0면 CSV 다운로드, 아니면 `alert("검색결과가 있는 경우만 가능합니다.")`
    - 테이블(3컬럼): 번호(역순 `total-(num+(page-1)*50)`) / 답변내용(answer_text) / 답변회원ID(m_id)
    - 페이지네이션(50/page)
- CSV: `getEtcAnswerList(idx,1,"",true)`(전체) → `text/csv` + BOM(`\xEF\xBB\xBF`) + `fputcsv([answer_text, m_id])`, filename `설문조사결과_{Ymd}.csv`
- 세션/권한: `$_SESSION['admin']`(공통). read-only.

### legacy quirk (그대로 이식)
- CSV 버튼은 첫 행 `answer === NULL`(주관식 답변)일 때만 표시(기타 answer=100은 미표시).
- answer_all_count 0이면 total_results로 표시(fallback).
- 번호 역순.

## 데이터 (legacy)
- `getEtcAnswerList(qidx, page, param, excel)`: `SELECT tsq.question, tsa.m_id, tsa.answer_text, tsa.answer FROM tbl_survey_question tsq INNER JOIN tbl_survey_answer tsa ON tsq.idx=tsa.question_idx AND (tsa.answer=100 OR tsa.answer IS NULL) AND tsa.answer_text!='' WHERE tsq.idx={qidx} ORDER BY tsa.reg_dt DESC` (50/page, excel=true면 전체)
- `getAnswerCount(qidx, 100).cnt`: 기타 총 인원

## API 계약 (백엔드 전달)
- `GET /admin/board/survey-etc-answers/{qidx}?page=&all=` — 문항별 기타/주관식 답변
  - 응답:
    ```jsonc
    {
      "question": "", "total_results": 0, "answer_all_count": 0,
      "items": [ { "answer_text": "", "m_id": "", "answer": 100 } ],
      "pagination": { "current_page": 1, "results_per_page": 50, "total_results": 0, "total_pages": 1 }
    }
    ```
    - `answer`: `100`(기타) 또는 `null`(주관식). `all=1`이면 페이징 없이 전체 items(CSV용).
    - `answer_all_count`: getAnswerCount(qidx,100). 백엔드 기준.

## 타겟 매핑
- 라우트: `/board/survey_result_etc` (`routes/board/survey_result_etc.tsx`, validateSearch `{idx, page}`)
- 스크린: `screens/survey-result-etc`
- entities: `entities/survey` 확장(etc-answer list + all)
- mock: `handlers/survey.ts` 확장(etc-answers — qidx로 survey/question 역산, 합성 답변)
- CSV: 클라이언트 생성(BOM + fputcsv 근사 `[answer_text, m_id]`), filename `설문조사결과_{yyyymmdd}.csv`

## Parity 체크리스트
- [ ] 요약(제목=문항 텍스트/내용有·총인원 fallback)
- [ ] 3컬럼(번호 역순/답변내용/회원ID), 50/page
- [ ] CSV 버튼(answer===NULL 시)·빈 결과 alert·BOM CSV 다운로드
