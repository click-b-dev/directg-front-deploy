# 설문조사 (event/survey)

## 원본
- 파일: `pc/event/survey.html` (설문 응답 폼) + `pc/event/survey_ps.php` (제출 처리)
- **DB**: 별도 DGKR DB(`$dsn_dgkr`) + `Board` 클래스(`getSurveyInfo`, `getUserAnswerInfo`), 포인트 지급은 `Licence::setEmoney`
- 세션: 회원(`$_SESSION['member']`) + admin(`$_SESSION['admin']` = 미리보기). **비-미리보기 시 로그인 필수**.
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/PROMOTION-EVENT-OPS.md`
- 선례: `screens/event-fm26`(세션+응모), `entities/mypage-qna-register`(client 제출 폼), `entities/member-auth`(`getMemberSession`)

## ⚠️ 개발자 승인 사항 (verbatim parity)
- 🔴 **banner_image src 하드코딩 버그**: legacy는 `if(banner_image != '')`로 노출 여부만 판단하고 실제 `src`는 하드코딩 `https://directg.diskn.com/i7EuDjvcPb?2`(banner_image 값 무시). **legacy 그대로 이식**(조건은 banner_image, src는 하드코딩).
- 🔴 **주관식 answer_text 단일 스코프**: legacy `$answer['answer_text']`가 질문 idx 없이 단일 변수 → 주관식 여러 개면 마지막 값이 덮어씀(참여이력 복원 시). verbatim.
- 🟠 admin 미리보기(`$_SESSION['admin']`): client 스토어프론트엔 admin 세션 없음 → **백엔드가 preview 플래그 판단**(세션 기반)해 응답에 포함. 프론트는 플래그만 사용.

## 화면·플로우
- 진입 URL: `/event/survey.html?idx=N` (idx 필수). 이벤트 배너/외부 링크로 진입(라이브 GNB 없음).
- 조건 체크(비-미리보기):
  - `flag != "Y"` 또는 `start_dt > now` 또는 `end_dt < now` → `alert("종료된 설문입니다.")` + `history.go(-1)`
  - `!survey_info` → `"잘못된 접근"` (텍스트 출력)
  - `max_people <= answer_cnt` → `alert("참여인원이 마감된 설문입니다.")` + `history.go(-1)`
  - 미로그인 → `login_check`(로그인 페이지 리다이렉트)
  - 미리보기(admin): 위 전부 스킵
- 레이아웃: `div.wrap`(layout) > header > `container my-3 pb-5` > main > `form#survey-form`(inline style: bg #111923, Noto Sans KR, max-width 900px).
  - hidden: `mode=register`, `idx`
  - banner(있으면): 하드코딩 img
  - 질문 반복(`section_item`, `data-required`):
    - `{itemNum}. {question}` + `<hr>`
    - **객관식**(type=radio/checkbox): item 반복(radio/checkbox `name=answer[qidx]`/`answer[qidx][]`, value=item.number) + `etc`면 기타(number=100) 추가 → 100 선택 시 텍스트 input(`answer_etc[qidx]`) 노출
    - **주관식**(type=descript): hidden `answer[qidx]=answer_text` + `textarea answer_text[qidx]`
    - **참여이력 있으면**: 모든 입력 `disabled` + 기존 답변 checked/value 복원
  - 제출 버튼: 참여이력 있으면 `onclick=alert('이미 제출하였습니다.')`, 없으면 `type=submit`
- 인터랙션(JS):
  - `toggleInput`: 기타(100) 체크 시 기타 input 노출+required, 해제 시 숨김+value 비움
  - submit 검증: `data-required="true"` section마다 (radio/checkbox 최소 1개 선택) AND (textarea 전부 비어있지 않음). 누락 시 `alert("[필수 입력 누락]\n{질문}")` + preventDefault + scrollIntoView.

### 제출 처리 (survey_ps.php)
- 로그인 필수(`m_id` 없으면 "잘못된 접근입니다." / admin 미리보기여도 "관리자 미리보기 시에도 회원로그인이 필요합니다." + back)
- 조건 재체크(admin은 통과), 참여이력 있으면 `"이미 참여한 설문조사입니다."`
- mode=register: `answer[]` 반복 → `tbl_survey_answer` insert
  - checkbox(array): 각 value2 → answer insert. value2==100이면 answer_text=`answer_etc[key]`
  - radio: value → answer insert
  - value=="answer_text"(주관식): answer_text=`answer_text[key]` insert
- `point > 0`면 `Licence::setEmoney(m_no, "+", point, "설문조사참여", "survey{idx}{m_no}", "settle_no")`
- 완료 → `alert("참여 완료되었습니다. 감사합니다.")` + `location.href=survey.html?idx={idx}`

## SSR·SEO (legacy)
- head: `<title>설문조사</title>`, `description=""`, `author=H2interactive`. `header_common.html`(CDN CSS). canonical/OG 없음.
- viewport: `width=device-width, initial-scale=1.0`. `data-bs-theme="dark"`.
- **page-specific inline `<style>`**: `.section_item`/`.option_wrapper`/`.option_label`/`.etc_text`/`.submit_btn` 등 → screen `<style>`로 재현(다크 커스텀 폼 스타일).
- 폼 전체 client 인터랙션(동적 렌더는 SSR 데이터 기반, 상태/검증/제출은 client).

## 데이터 (legacy)
- **DGKR DB** `Board::getSurveyInfo(idx)`: `tbl_survey ts` ⨝ `tbl_survey_question tsq` ⨝ `tbl_survey_question_item tsqi`
  - `ts.*`(idx, flag, start_dt, end_dt, max_people, point, banner_image 등) + `question`(json) + `answer_cnt`(DISTINCT m_id count)
  - `question` json: `[{ idx, survey_idx, number, question, type, required, etc, nothing, flag, item: [{ item_idx, item, number, flag, nothing }] }]` (number ASC)
- `Board::getUserAnswerInfo(m_id, idx)`: `tbl_survey_answer` (question_idx ASC) — `{ question_idx, answer, answer_text }`
- `Licence::setEmoney` — 포인트 지급(mutation)

## API 계약 (백엔드 전달)
- `GET /api/surveys/:idx` (optional 세션 쿠키) → `{ survey: SurveyInfo | null; userAnswer: UserAnswer[]; preview: boolean; accessError: "closed" | "full" | "invalid" | "login" | null }`
  - `SurveyInfo { idx, flag, start_dt, end_dt, max_people, answer_cnt, point, banner_image, question: SurveyQuestion[] }`
  - `SurveyQuestion { idx, survey_idx, number, question, type: "radio"|"checkbox"|"descript", required: "Y"|"N", etc: 0|1, nothing, flag, item: SurveyItem[] }`
  - `SurveyItem { item_idx, item, number, flag, nothing }`
  - `UserAnswer { question_idx, answer, answer_text }`
  - 백엔드: getSurveyInfo + 조건 판정(closed/full/invalid) + admin 세션→preview + 로그인 필요(login) + 로그인 시 userAnswer. **미리보기면 조건 스킵**.
- `POST /api/surveys/:idx/answer` (세션 필수) body `{ mode: "register"; answers: SurveyAnswerInput[] }` → `{ result: "success" | "fail"; message: string }`
  - `SurveyAnswerInput { question_idx: number; answer?: number[]; answer_etc?: string; answer_text?: string }`
  - 백엔드: 로그인/조건/중복 확인, tbl_survey_answer insert(100=기타→answer_etc, 주관식→answer_text), point>0 지급. **legacy 메시지 verbatim**("참여 완료되었습니다. 감사합니다." / "이미 참여한 설문조사입니다." / "종료된 설문입니다." 등).
- 응답 타입: `entities/survey/model/types.ts`

## 타겟 매핑
- 라우트: `app/event/survey.html/page.tsx` (server) — searchParams idx, `getMemberSession`+`getSurvey(idx)` SSR. metadata(title 설문조사). SurveyScreen에 전달.
- screen: `screens/survey/ui/survey-screen.tsx` (server 셸) — accessError 처리(client alert+back)·page `<style>`·폼 래퍼. 폼 본체는 client.
  - `screens/survey/ui/survey-form.tsx` (`'use client'`) — 동적 질문 렌더 + 상태(controlled) + 기타 토글 + required 검증 + 제출(`postSurveyAnswer`). 참여이력 disabled 복원.
  - `screens/survey/ui/survey-access-guard.tsx` (`'use client'`) — accessError면 alert + `history.back()`.
- entities: `entities/survey` — `getSurvey`(server, 세션 쿠키) + `postSurveyAnswer`(client) + `types.ts`
- mock: `shared/mocks/fixtures/survey.ts`(SurveyInfo 객관식+주관식+기타 커버) + handlers `GET */api/surveys/:idx`, `POST */api/surveys/:idx/answer`

## Parity 체크리스트
- [ ] 조건분기(종료/마감 alert+back / 잘못된 접근 / 로그인) + admin 미리보기(백엔드 preview)
- [ ] 동적 질문(객관식 radio/checkbox + 기타100 토글 / 주관식 textarea) + required 검증 alert
- [ ] 참여이력 disabled+복원 + 제출버튼 분기("이미 제출") + banner 하드코딩 URL verbatim
- [ ] 제출 mutation(answer 구조 매핑) + 포인트 지급(백엔드) + 완료 alert+reload
- [ ] page `<style>`(section_item 등) + SEO(title 설문조사/viewport)
