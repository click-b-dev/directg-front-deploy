# 설문조사 등록/수정 (대형 동적 폼)

## 원본
- 파일: `pc/_Admin_/board/survey_register.php`(폼+JS 429L) + `survey_ps.php`(저장) + `survey_template.php`(문항 템플릿) + `AdminBoard::getSurveyInfo/getSurveyCount`
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§설문조사 등록), `BOARD-CONTENT.md`

## 화면·플로우
- 진입 URL/파라미터: `/board/survey_register?mode&idx&param`(목록 등록 버튼=register / 수정 링크=update&idx)
- `<title>`/h4 = `설문조사 등록`(register) / `설문조사 수정`(update)
- **기본설정 카드**:
  - 설문 배너 이미지: file(accept image) + 기존 이미지 있으면 프리뷰 + `기존 이미지 삭제` 체크박스(+hidden url)
  - `* 설문 제목`(subject, required)
  - `* 설문 기간`(start_dt ~ end_dt, `datetime-local`, required) + 초기화 버튼(둘 다 비움)
  - `* 참여 인원 제한`(max_people radio: 무제한(0) / 최대("")+max_people_val number) — **참여자>0이면 disabled**
  - `* 참여완료 시 결과보기`(view_result radio Y/N) — **d-none 숨김**, update 시 disabled
  - 참여 포인트(point number) — update 시 disabled
  - 진행상태(flag select: Y 진행 / N 종료)
- **내용 설정 카드**(참여자>0이면 전체 disable):
  - `객관식 추가` / `주관식 추가` 버튼
  - 동적 문항 컨테이너:
    - 객관식(obj): 필수응답 체크·응답방식 radio(1개 선택=radio / 여러 개=checkbox)·내용(title)·보기 목록(옵션 input들)·`추가`·`기타의견 추가`(1개만)·위/아래/문항삭제(confirm)/문항복사
    - 주관식(sub): 필수응답·응답방식(주관식=descript 고정)·내용(title)
    - itemNum = 순번(1-based), 삭제/이동/복사 시 재정렬
- 하단: `목록`(back_btn) / `등록|수정` submit
- **isLocked**(update & survey_count>0): 내용 설정 card-body 전체 disable + `alert("참여 대상이 존재하여 기본 설정 이외의 항목은 수정할 수 없습니다.")`
- 검증: subject/기간 required, max_people/view_result required(HTML). datetime-local 브라우저 기본.

## 저장 로직 (survey_ps.php)
- register: `INSERT tbl_survey`(subject/start/end/max_people((max_people!=0)?val:0)/view_result/point/flag/reg_dt=NOW, banner NULL) → lastInsertId → 문항/보기 INSERT
- update: `UPDATE tbl_survey`(subject/start/end/**flag만**) → 참여자==0이면 tbl_survey_question(_item) DELETE 후 재INSERT / 참여자>0이면 마스터만 수정하고 문항 skip
- 배너: 새 파일 업로드(`banner_{idx}_{md5}.ext`) or 기존삭제(unlink) → `banner_image` UPDATE
- 문항 INSERT: tbl_survey_question(number/question/type/required/etc/flag=Y) + tbl_survey_question_item(number/item/flag=Y)
- 저장 후 `alert("{등록|수정} 되었습니다.")` → survey_list

### legacy quirk / 결정
- register 배너는 항상 NULL로 INSERT 후 별도 UPDATE(2단계) — 백엔드 세부, 계약은 단일 저장.
- update는 subject/start/end/flag만 마스터 수정(max_people/view_result/point는 update 시 disabled → 미변경).
- modify 로드 시 문항 복원은 type/question/required/item만(등록된 **기타의견(etc)은 복원 안 함** — legacy 한계). 그대로 이식.
- view_result 행은 d-none(숨김) — 렌더하되 미노출.
- 문항/보기 제출은 legacy 배열 인덱스(surveyQuestion*[idx][]) → 타겟은 **구조화된 questions 배열**로 대체(동작 동일, idiomatic).
- 배너 업로드는 코드베이스 관례(파일명 문자열)로 처리(백엔드 실제 multipart).

## API 계약 (백엔드 전달)
- `GET /admin/board/surveys/{idx}` — 상세(수정 로드)
  - 응답: `{ idx, subject, start_dt, end_dt, max_people, view_result, point, flag, banner_image, reg_dt, survey_count, questions: [ { number, question, type: "radio|checkbox|descript", required: "Y|N", etc: 0|1, items: string[] } ] }`
  - `survey_count`=응답수(>0이면 잠금). 없는 idx는 404.
- `POST /admin/board/surveys` — 등록
  - 요청: `{ subject, start_dt, end_dt, max_people, max_people_val, view_result, point, flag, banner_image, questions }`
  - 응답 `{ success: true }`(백엔드 max_people 계산·배너 업로드)
- `PUT /admin/board/surveys/{idx}` — 수정
  - 요청: 위와 동일(+`delete_current_image`). 참여자>0이면 백엔드가 문항 무시하고 마스터(subject/start/end/flag)만 수정.

## 타겟 매핑
- 라우트: `/board/survey_register` (validateSearch `{mode, idx, ...list filters}`)
- 스크린: `screens/survey-register` (동적 문항 빌더 React state)
- entities: `entities/survey` 확장(detail/create/update + SurveyDetail/SurveyQuestion/SurveySaveRequest)
- mock: `handlers/survey.ts` 확장(detail/create/update)
- 공유: `shared/lib`(datetime-local 네이티브)

## Parity 체크리스트
- [ ] 기본설정 필드·required·update disabled(포인트/결과보기/참여인원)
- [ ] 객관식/주관식 추가·응답방식·필수·보기 추가/삭제·기타의견(1개)·위·아래·삭제(confirm)·복사
- [ ] modify 프리필(문항 type/제목/필수/보기), 참여자>0 잠금 alert
- [ ] register INSERT / update 저장 → 목록 이동
- [ ] 배너 업로드/삭제(파일명 관례), max_people 무제한/최대
