# 설문조사 목록

## 원본
- 파일: `pc/_Admin_/board/survey_list.php` + `AdminBoard::getSurveyList()` + `getSurveyCount()`
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§설문조사 목록), `BOARD-CONTENT.md`

## 화면·플로우
- 진입 URL/파라미터: `/board/survey_list?page&search_type&search_value`
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈/게시판/설문조사 관리/**설문조사 목록**, h4 동일
  - 검색필터: 검색어(`search_type` select — 옵션 `제목`(ts.subject) 하나) + `search_value` text(LIKE)
  - 총건수 `{n} 개` + `설문조사 등록` 버튼(→ survey_register, #126 미이관)
  - 테이블(10컬럼): 번호(**역순** `total-(num+(page-1)*20)`) / 이미지(`banner_image` 있으면 `https://directg.net{banner_image}` max-w100) / 설문제목(subject) / 등록일(reg_dt) / 진행기간(`start_dt ~ end_dt`, `end_dt<now || start_dt>now`면 text-danger) / 참여대상(`getSurveyCount.cnt` / `max_people==0?무제한:max_people`) / 진행상태(`flag=='Y'?진행:종료`, `<b>`) / 미리보기(PC·MOBILE) / 결과보기(survey_result?idx, #127 미이관) / 수정(survey_register?idx&mode=update, #126 미이관)
  - 페이지네이션 `links_html`(20/page)
- 세션/권한: `$_SESSION['admin']`(공통). 데이터 dgkr.

### 미리보기 링크 (그대로 이식)
- PC: `/event/survey.html?idx=` (**directg-client 스토어 페이지** — admin 아님, 미이관 · target=_blank)
- MOBILE: `{scheme}://m.{host}/event/survey.html?idx=&expires={now+3600}&key=admin-survey` (모바일 도메인 + 만료시각 + 시크릿키)

### legacy quirk / 결정
- 번호는 역순 표시번호(idx 아님).
- 수정 링크의 `param`(base64(검색쿼리)) back_btn은 내부 복귀용 → 타겟은 **검색 파라미터를 직접 전달**(search_type/search_value/page)로 대체(동작 동일, base64 미사용).
- getSurveyCount는 행별 N+1 조회 → API는 목록 응답에 `cnt` 포함(백엔드 서브쿼리).
- 검색어 select 옵션은 제목(ts.subject) 하나뿐.

## 데이터 (legacy)
- `AdminBoard::getSurveyList`: `SELECT ts.* FROM tbl_survey ts WHERE 1 {add_where} ORDER BY ts.idx DESC` (20/page)
- `AdminBoard::getSurveyCount(idx)`: 응답수(cnt) 집계(tbl_survey_answer 등)
- 필터: `{search_type} LIKE '%{search_value}%'`(search_type=ts.subject)

## API 계약 (백엔드 전달)
- `GET /admin/board/surveys` — 설문조사 목록
  - 요청(query): `page`(기본 1), `search_type`(ts.subject), `search_value`(LIKE `%v%`)
  - 응답:
    ```jsonc
    {
      "items": [
        { "idx": 0, "banner_image": "", "subject": "", "reg_dt": "", "start_dt": "", "end_dt": "",
          "max_people": 0, "cnt": 0, "flag": "Y|N" }
      ],
      "pagination": { "current_page": 1, "results_per_page": 20, "total_results": 0, "total_pages": 1 }
    }
    ```
  - 정렬: `ts.idx DESC`. 20/page. `cnt`=응답수(백엔드 집계).

## 타겟 매핑
- 라우트: `/board/survey_list` (`routes/board/survey_list.tsx`, validateSearch)
- 스크린: `screens/survey-list`
- entities: 신규 `entities/survey` (list)
- mock: 신규 `shared/mocks/handlers/survey.ts`, `handlers.ts` 등록

## Parity 체크리스트
- [ ] 10컬럼(번호 역순/이미지/제목/등록일/진행기간 색상/참여대상/진행상태/미리보기/결과보기/수정)
- [ ] 검색어 제목 LIKE 필터, 등록 버튼
- [ ] 미리보기 PC/MOBILE(expires+key) 링크
- [ ] ts.idx DESC, 20/page, max_people 0=무제한
