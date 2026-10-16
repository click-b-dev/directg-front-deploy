# 설문조사 결과보기

## 원본
- 파일: `pc/_Admin_/board/survey_result.php` + `AdminBoard::getSurveyInfo/getSurveyCount/getAnswerCount`
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§설문조사 결과보기)

## 화면·플로우
- 진입 URL/파라미터: `/board/survey_result?idx=`(목록 결과보기 버튼, target=_blank)
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈/게시판/설문조사 관리/**설문조사 결과보기**, h4 동일
  - `설문조사 요약` 카드: 설문 제목 / 설문 기간(start~end) / 참여제한(`max_people!=0?"{n} 명":"없음"`) / 참여자현황(`총 {cnt} 명 (총 지급 포인트 {cnt*point})`)
  - `설문 상세결과` 카드(header에 `계정별 결과` 버튼 → survey_result_user?idx, #129 미이관):
    - 문항별: label `{number+1}. {question}`
      - descript(주관식): `답변 보기` 버튼 → survey_result_etc?idx={question.idx}(#128 미이관)
      - 객관식: 보기별 `{item.number}. {item.item} - {answerCount} 명` (줄바꿈), `etc`면 `기타 - {answerCount(100)} 명` + 답변 보기 버튼
- 세션/권한: `$_SESSION['admin']`(공통). read-only.

### 결정
- getSurveyInfo(질문 JSON)+getAnswerCount(문항·보기별 응답수) 조합 → 타겟은 **전용 result 엔드포인트**로 문항 idx·보기별 cnt·기타 cnt를 포함 반환.
- 답변보기/계정별 결과 링크 대상(#128/#129)은 미이관 → target=_blank 404.

## 데이터 (legacy)
- `getSurveyInfo(idx)`: 마스터 + 문항 JSON(문항 idx/number/question/type/etc/item[number,item])
- `getSurveyCount(idx).cnt`: 참여자 수
- `getAnswerCount(question_idx, item_number).cnt`: 보기별 응답수(기타는 item_number=100)

## API 계약 (백엔드 전달)
- `GET /admin/board/surveys/{idx}/result` — 설문 결과(요약 + 문항별 집계)
  - 응답:
    ```jsonc
    {
      "idx": 0, "subject": "", "start_dt": "", "end_dt": "", "max_people": 0, "point": 0, "survey_count": 0,
      "questions": [
        { "idx": 0, "number": 0, "question": "", "type": "radio|checkbox|descript", "etc": 0|1,
          "items": [ { "number": 1, "item": "", "cnt": 0 } ], "etc_cnt": 0 }
      ]
    }
    ```
    - `questions[].idx`=문항 DB id(답변보기 링크용). descript는 items 빈배열. 없는 idx는 404.

## 타겟 매핑
- 라우트: `/board/survey_result` (`routes/board/survey_result.tsx`, validateSearch `{idx}`)
- 스크린: `screens/survey-result`
- entities: `entities/survey` 확장(result + SurveyResult 타입)
- mock: `handlers/survey.ts` 확장(result — fixture 문항 + 합성 응답수)

## Parity 체크리스트
- [ ] 요약(제목/기간/참여제한/참여자현황·지급포인트) 일치
- [ ] 문항별 결과(주관식 답변보기 / 객관식 보기별 응답수 / 기타)
- [ ] 계정별 결과·답변보기 링크(미이관 target=_blank)
