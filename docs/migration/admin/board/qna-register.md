# 문의하기 답변 작성 (SmartEditor2)

## 원본
- 파일: `pc/_Admin_/board/qna_register.php` + `qna_ps.php`(mode=update)
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§문의하기 답변 작성), `NOTIFICATION-EMAIL.md`

## 화면·플로우
- 진입 URL/파라미터: `/board/qna_register?idx=&<필터 q_string>`(qna_view "답변하기" 또는 목록 수정 아이콘에서 진입)
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈/게시판/문의하기 관리/**문의하기 답변**, h4 `문의하기 답변`, `<title>`=`고객문의`(quirk, #119와 동일)
  - hidden form(`frm`, POST qna_ps): `mode`(기본 update), `idx`, `answer`(SE2가 저장 시 채움)
  - read-only 정보 테이블(5행):
    1. 작성자(user_id) / 작성일(reg_date)
    2. 제목(subject, colspan)
    3. 내용: `Parsedown(htmlspecialchars_decode(nl2br(contents)))` HTML 렌더 (※ qna_view는 Parsedown 없이 nl2br+decode — legacy 미세 불일치)
    4. 첨부파일: 이미지들(`<ul id="uploadBox"><li>`, `<img style="max-width:1280px">`, 2025-08-19 도메인 분기) — **zoom 버튼 없음**(qna_view와 다름)
    5. 답변: `<textarea id="answer">`(초기값 = 저장된 answer raw) → **SmartEditor2**(HuskyEZCreator iframe WYSIWYG)
  - 하단 버튼: `목록가기`(qna_list?q_string) / `답변하기`(btn_answer_save)
- 분기/플로우:
  - 답변하기 → SE2 `UPDATE_CONTENTS_FIELD` + `getIR()` → hidden answer 채움 → form submit → qna_ps mode=update → `UPDATE tbl_qna SET answer, answer_dt=NOW(), admin_id, is_answer='Y'` → `alert("저장되었습니다.")` → `go(HTTP_REFERER)`
- 세션/권한: `$_SESSION['admin']`(공통, admin_id는 세션에서). 데이터 dgkr.

### legacy quirk (그대로 이식)
- `<title>`=고객문의(h4=문의하기 답변과 상이).
- 내용은 Parsedown+nl2br+decode(qna_view는 Parsedown 없음). 평문 데이터라 시각 결과 거의 동일 — 미세 불일치는 각 원문 유지.
- 첨부는 zoom 없이 큰 이미지(max-width 1280).
- 답변 저장은 SE2가 만든 HTML을 `htmlspecialchars`(ENT_QUOTES)로 escape 저장(백엔드), 로드 시 textarea에 raw로 넣으면 브라우저가 디코드 → SE2 초기 HTML.
- 저장 후 `go(HTTP_REFERER)`: 타겟은 referer 대신 **qna_view로 이동**(답변하기 진입점, 갱신된 답변 확인). 동작 목적(저장 후 상세 복귀) 동일.

## 데이터 (legacy)
- 로드: `SELECT * FROM tbl_qna WHERE idx=:idx` + `tbl_file`(첨부)
- 저장(qna_ps update): `UPDATE tbl_qna SET answer=:answer(htmlspecialchars), answer_dt=NOW(), admin_id=:admin_id, is_answer='Y' WHERE idx=:idx`

## API 계약 (백엔드 전달)
- `GET /admin/board/qnas/{idx}` — 상세(#119 재사용, **`answer` raw 필드 추가** — SE2 초기값용)
  - 기존 응답에 `answer`(원문 HTML, 편집용) 추가. `answer_html`(뷰용)은 #119대로 유지.
- `POST /admin/board/qnas/{idx}/answer` — 답변 저장
  - 요청: `{ "answer": "<html>" }`
  - 백엔드: `answer` htmlspecialchars 저장, `answer_dt=NOW()`, `admin_id`(세션), `is_answer='Y'`. 응답 `{ "success": true }`.

## 타겟 매핑
- 라우트: `/board/qna_register` (`routes/board/qna_register.tsx`, validateSearch `{idx + 필터}`)
- 스크린: `screens/qna-register`
- entities: `entities/qna` 확장(QnaDetail.answer 추가 + submitQnaAnswer/useSubmitQnaAnswer)
- mock: `handlers/qna.ts` 확장(detail에 answer 추가, answer POST)
- 공유: `shared/ui/SmartEditor`(SmartEditorHandle.getContent) 재사용

## Parity 체크리스트
- [ ] 정보 테이블(작성자/작성일/제목/내용/첨부/답변) 일치
- [ ] SmartEditor2 초기값(기존 답변) 로드·편집
- [ ] 저장 → is_answer=Y·답변 반영, alert("저장되었습니다."), 상세 복귀
- [ ] title=고객문의 quirk, 첨부 zoom 없음
