# 문의하기 상세 (+메일발송)

## 원본
- 파일: `pc/_Admin_/board/qna_view.php` + `qna_ps.php`(mode=mail) + `AdminV1::getMemberNo/getMemberInfo`(dgkr)
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§문의하기 상세), `NOTIFICATION-EMAIL.md`

## 화면·플로우
- 진입 URL/파라미터: `/board/qna_view?idx=&<필터 q_string>`(목록 #118 제목 링크에서 진입, 필터 유지)
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈/게시판/문의하기 관리/**문의하기 상세**, h4 `문의하기 상세`, `<title>`=`고객문의`(quirk)
  - 상세 테이블(`table table-bordered`):
    - 작성자: `user_id` + 회원 email 있으면 `(email)`(없으면 표시 없음). 우측 버튼 4종(target=_blank): 회원정보보기(`member_view?m_no=`), 주문내역보기(`order_all`), (과거)주문내역보기(`order_old_list&search_year=2017`), 취소요청내역보기(`order_cancel_request`) — **모두 미이관 대상**
    - 작성일: reg_date / 고객 답변 확인 여부: `replyStatus=="1"?확인:미확인` / 메일발송여부: `email_flag=="Y"?발송:미발송`
    - 제목: subject
    - 내용: `htmlspecialchars_decode(nl2br(contents))` → HTML 렌더(dangerouslySetInnerHTML)
    - 첨부파일(files 있으면): 각 이미지 `<img src="[reg_date>'2025-08-19 00:00:00'?https://directg.net:'']/upload/qna/{filename}">` + `크게 보기`/`축소하기` 토글(full-size 클래스)
    - 답변: `htmlspecialchars_decode(nl2br(answer))` → HTML 렌더
  - 동일 user_id 문의 이력 테이블(`#list-table`, 6컬럼): 번호(count desc)/구분(**view 전용 gubun_array**)/제목(qna_view 링크)/작성자/작성일/답변상태(`is_answer` + `(admin_id)`)
  - 하단 버튼: `목록가기`(qna_list?q_string) / `답변하기`(qna_register?q_string&idx, #120 미이관) / `메일발송`(**is_answer=="Y"일 때만**)
  - 페이지 `<style>`(dt/label/blockquote/#list-table hover/image-group/target-img/zoom-btn) 그대로 이식
- 분기/플로우:
  - 메일발송 버튼 → `answer_mail_send(email, idx)` → `confirm("{email} 회원 에게 문의답변 메일을 발송하시겠습니까?")` → AJAX POST qna_ps mode=mail → 성공 `alert(message)`+reload / 실패 `alert(message)`
  - 첨부 이미지: 클릭 or 버튼 → full-size 토글
- 세션/권한: `$_SESSION['admin']`(공통). 데이터 dgkr.

### legacy quirk (그대로 이식)
- `<title>`=고객문의(h4=문의하기 상세와 상이).
- **view 전용 gubun_array**(이력 테이블용, 목록·상세 상단과 순서·일부 라벨 다름): 6=계정,회원,인증 / 7=한글,제공 콘텐츠 / 1=게임 설치,플레이 / 2=주문,결제 / **4=주문취소 및 환불**(목록은 "취소, 환불") / 3=기타 / 5=제품 코드(키) 오류 / 8=할인,가격 / 9=이용방법.
- 회원 email 없으면 메일발송용 email에 user_id를 사용(폴백).
- 첨부 이미지 도메인 분기(2025-08-19 기준).
- product-modal + JS = dead(트리거 없음, notice_view와 동일) → 미이식.
- 내용/답변은 Parsedown 아님 — `nl2br + htmlspecialchars_decode`만(답변은 smarteditor2 HTML이 escape 저장된 것을 디코드).

## 데이터 (legacy)
- 상세: `SELECT tq.* FROM tbl_qna tq WHERE idx=:idx`(dgkr)
- 회원: `AdminV1::getMemberNo(user_id)->m_no`, `getMemberInfo(m_no)->email`
- 첨부: `SELECT * FROM tbl_file WHERE table_name='tbl_qna' AND puid=:idx`
- 이력: `SELECT * FROM tbl_qna WHERE user_id=:user_id ORDER BY idx DESC`
- 메일(qna_ps mail): email_qna 템플릿 + `DirectSendMail::sendMail` → 성공 시 `email_flag='Y', email` 저장, `{success, message}` JSON

## API 계약 (백엔드 전달)
- `GET /admin/board/qnas/{idx}` — 문의 상세(회원·첨부·이력 포함)
  - 응답:
    ```jsonc
    {
      "idx": 0, "user_id": "", "subject": "", "reg_date": "", "gubun": "1",
      "contents_html": "<...>", "answer_html": "<...>",
      "replyStatus": "0|1", "email_flag": "Y|", "is_answer": "Y|N", "admin_id": "",
      "member": { "m_no": 0, "email": "" },
      "files": [ { "filename": "", "reg_date": "YYYY-MM-DD HH:MM:SS" } ],
      "history": [ { "idx": 0, "gubun": "1", "subject": "", "user_id": "", "reg_date": "", "is_answer": "Y|N", "admin_id": "" } ]
    }
    ```
    - `contents_html`/`answer_html`: 백엔드가 `nl2br + htmlspecialchars_decode` 적용본. 없는 idx는 404.
- `POST /admin/board/qnas/{idx}/mail` — 문의답변 메일 발송
  - 요청: `{ "email": "" }`
  - 응답: `{ "success": true|false, "message": "메일발송 성공|메일발송 실패" }`. 성공 시 백엔드 `email_flag='Y', email` 저장(DirectSend).

## 타겟 매핑
- 라우트: `/board/qna_view` (`routes/board/qna_view.tsx`, validateSearch `{idx + 필터}`)
- 스크린: `screens/qna-view`
- entities: `entities/qna` 확장(detail/mail + QnaDetail/QnaMail 타입)
- mock: `handlers/qna.ts` 확장(detail GET, mail POST)

## Parity 체크리스트
- [ ] 상세 테이블(작성자+버튼/작성일/제목/고객확인/메일발송여부/내용/첨부/답변) 일치
- [ ] 첨부 이미지 URL 분기·zoom 토글
- [ ] 이력 테이블(view 전용 gubun_array, 번호 desc) 일치
- [ ] 메일발송(is_answer=Y 조건·confirm·alert·reload) 일치
- [ ] title=고객문의 quirk, product-modal 미이식
