# 문의 하기 (mypage/qna_register)

## 원본
- 파일: `pc/mypage/mypage_qna_register.html` (+ `mypage_qna_proc.php` mode=register)
- 도메인 클래스: `src/classes/Mypage.php::setQna` / `setQnaFile`, `DirectSendMail`
- 참조 문서: `docs/design-system/client.md`, `MEMBER-LIFECYCLE.md`, `NOTIFICATION-EMAIL.md`
- 선례: `screens/member-login`(client 폼+fetch), `entities/mypage-qna`(문의 내역), `widgets/mypage-aside`

## 화면·플로우
- 진입 URL: `/mypage/mypage_qna_register.html`. **login_check(세션 필수)**.
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(240px auto) > aside_mypage + `section#content.content.rounded-0.font-14`
- 폼(`form#frm enctype=multipart/form-data method=post action=mypage_qna_proc.php`, hidden `mode=register`):
  - 문의 구분 `select[name=gubun] required` — `:::선택:::`(빈값) + 9옵션 **순서**: 1 게임 설치,플레이 / 2 주문,결제 / 5 제품 코드(키) 오류 / 7 한글,제공 콘텐츠 / 6 계정,회원,인증 / 4 취소,환불 / 8 할인,가격 / 9 이용방법 / 3 기타
  - 제목 `input[name=subject] required`
  - 내용 `textarea[name=contents] rows=10` (기본값 `$notice_data['contents']` 미정의 → 빈값)
  - 첨부파일 1~3 `input[type=file][name=upload_file[]]` + 안내 "첨부파일은 최대 2MB입니다. (사용가능 파일 형식 - jpg / gif / png )"
  - 버튼: 확인(submit) / 취소(`a[href=./mypage_qna.html]`)
- 제출(legacy jQuery): submit preventDefault → `FormData` → `$.LoadingOverlay("show")` → AJAX POST(multipart, contentType/processData false, dataType json) → success: LoadingOverlay hide + `alert(error_msg)` + `location.reload()`; error: `alert('고객문의 등록 중 오류가 발생했습니다. '+error)`
- 세션/권한: **로그인 필수**

## 데이터 (legacy, mode=register)
- `setQna(m_id, gubun, subject, contents, ip)` → idx (`INSERT INTO tbl_qna SET user_id,gubun,subject,contents,ip,reg_date=NOW()`)
- 첨부파일 검증: size ≤ 2,000,000(2MB), type ∈ {png, jpg, jpeg, gif, webp} — 위반 시 `{error_code:NG, error_msg}`. 통과 시 `move_uploaded_file` + `setQnaFile(idx,m_id,file,type,name,ip)`
- `gubun=="5"`(제품 코드 오류) → `DirectSendMail`로 admin@h2int.com 알림 메일
- 성공: `{error_code:OK, error_msg:"성공적으로 등록되었습니다."}`

## API 계약 (백엔드 전달)
- `POST /api/mypage/qna` (multipart/form-data, 세션 쿠키) — 필드: `gubun`, `subject`, `contents`, `upload_file[]`(0~3, 이미지 ≤2MB)
  - 응답: `{ error_code: "OK" | "NG", error_msg: string }`
  - 백엔드 책임: setQna 저장, 첨부 검증(2MB·png/jpg/jpeg/gif/webp)+저장, gubun=5 시 알림 메일
- 응답 타입: `entities/mypage-qna/model/types.ts` (`QnaRegisterResponse`)

## 타겟 매핑
- 라우트: `app/mypage/mypage_qna_register.html/page.tsx` → `/mypage/mypage_qna_register.html` (`requireMemberSession()` 가드)
- screen: `screens/mypage-qna-register` (server) — aside + `<QnaRegisterForm>`(client)
- 컴포넌트: `screens/mypage-qna-register/ui/qna-register-form.tsx` (`'use client'`) — 폼 + FormData 제출(fetch multipart) + 로딩 상태
- entities: `entities/mypage-qna` (`postMypageQnaRegister(formData)` client, `apiClient.post(url, undefined, {body})`)
- widget: `widgets/mypage-aside`(기존) active=qna_ragister(legacy 오타 키 유지)
- mock: handler `POST */api/mypage/qna` — 성공 `{error_code:OK, error_msg:"성공적으로 등록되었습니다."}`

## 단위 경계 결정 / quirk
1. 파일 업로드는 multipart FormData(`apiClient.post(url, undefined, {body: formData})`). 검증은 백엔드(legacy도 서버 검증만, 클라 사전검증 없음) → mock은 OK 반환.
2. `$.LoadingOverlay`(vendor)는 미로드 → 제출 중 로딩 상태(확인 버튼 disabled)로 재현. UX 동일(제출 중 대기 표시).
3. gubun select 옵션 **순서**(1/2/5/7/6/4/8/9/3) 원문 유지.
4. hidden `mode=register`는 REST 엔드포인트로 대체(payload 불필요) — 생략.
5. 성공 시 `location.reload()` 재현. 취소는 `./mypage_qna.html` 링크.
6. textarea 기본값(미정의 변수) 빈값 유지.

## Parity 체크리스트
- [ ] aside_mypage(문의 하기 active) + 폼(구분 select 9옵션 순서 + 제목 + 내용 + 첨부 3)
- [ ] required(구분/제목), 첨부 안내 문구
- [ ] 제출 → multipart POST → alert(error_msg) + reload / 실패 alert
- [ ] 제출 중 로딩(확인 버튼 disabled)
- [ ] 취소 → mypage_qna.html
- [ ] SEO(title 문의 하기/viewport/description 빈값/author H2interactive)
