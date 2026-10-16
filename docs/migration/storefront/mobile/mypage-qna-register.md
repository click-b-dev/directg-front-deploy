# 모바일 마이페이지 - 문의 하기 (mypage_qna_register)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/mypage_qna_register.html` (라이브 — `mypage_main.html:159`·`sidebar.html:343`·`main_footer.html:45`에서 링크) + `mypage_qna_proc.php` mode=register
- PC 대응: `docs/migration/storefront/mypage/qna-register.md` (`screens/mypage-qna-register`, `entities/mypage-qna` `postMypageQnaRegister`). **entity 재사용, 증분 없음**
- 데이터: `Mypage::setQna` + `setQnaFile` + `DirectSendMail`(gubun=5) — **백엔드 책임**(PC 계약과 동일)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/mypage_qna_register.html`(GET), title "문의 하기". **세션 필수(login_check)**
- 헤더: `inc/sub_header.html` → `MobileSubHeader("문의 하기")`
- 본문 `#appCapsuleSub` > `section full mt-2 mb-2` > `section-title` "문의하기"(제목 표기 "문의 하기"와 불일치, 보존) > `wide-block pb-1 pt-2` > form
- 폼(`#frm enctype=multipart/form-data method=post action=mypage_qna_proc.php`, hidden `mode=register`):
  - **문의구분** `form-group boxed > input-wrapper`: label "문의구분" + `select[name=gubun][required] .form-control.form-select` — `:::선택:::`(빈값) + 9옵션 **순서 1/2/5/7/6/4/8/9/3**(PC와 동일)
  - **제목** label "제목" + `input[type=text][name=subject][required] .form-control` (**id 없음** — label for=subject는 dead)
  - **문의내용** label "문의내용" + `textarea[name=contents][rows=4][required] .form-control` placeholder="내용" + `i.clear-input > ion-icon[name=close-circle]`(base.js clear, 미로드시 장식)
  - **첨부파일** label "첨부파일" + `input[type=file][name="upload_file[]"] .form-control` — **단일 input**(PC는 1~3), **안내 문구 없음**(PC는 "최대 2MB..." 있음)
  - 버튼: `button[type=submit] .btn.btn-primary.btn-lg.btn-block` "문의하기" — **취소 버튼 없음**(PC는 확인/취소)
- 세션/권한: 로그인 필수

## 인터랙션 (legacy JS)
- submit preventDefault → `new FormData(this)` → AJAX POST(multipart, contentType/processData false, dataType json)
  - success: `alert(data.error_msg)` + `location.reload()`
  - error: `console.log(data)`만 (**alert 주석처리 → 오류 시 사용자 알림 없음**, PC와 다름)
- **`$.LoadingOverlay` 없음**(PC는 있음) → 제출 중 로딩/disabled 재현 안 함(legacy 그대로 무가드)

## 모바일 head / 앱셸
- viewport device-width scale 1 고정 viewport-fit cover, theme #000, apple-web-app capable/black-translucent, title "문의 하기", description/keywords 빈값
- 앱셸: `MobileSubHeader("문의 하기")` + `/m/layout` bottom-nav/sidebar(표시) + bootstrap.bundle.min.js. screen은 폼 제출 → **client**
- 페이지별 mobile-assets CSS: 없음(style/dg_style/styleguide) — **bootstrap.css는 head에 미링크**(legacy 누락, 앱 공통 번들로 커버)

## 데이터 / API 계약
- **재사용(증분 없음)**: `postMypageQnaRegister(formData)`(client, `POST /api/mypage/qna` multipart, `{error_code, error_msg}`) · `requireMemberSession`
- 백엔드 책임(PC 계약 동일): setQna 저장, 첨부 검증(2MB·png/jpg/jpeg/gif/webp)+저장, gubun=5 알림메일
- mock 기존 재사용(`POST */api/mypage/qna` → OK "성공적으로 등록되었습니다.")

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/mypage_qna_register.html`
- 라우트: `app/m/mypage/mypage_qna_register.html/page.tsx`(server, requireMemberSession 가드)
- screen: `screens/mobile-mypage-qna-register`
  - `ui/mobile-mypage-qna-register-screen.tsx`(server) — MobileSubHeader + section-title + wide-block + `<MobileQnaRegisterForm>`
  - `ui/mobile-qna-register-form.tsx`(**client**) — legacy 폼 마크업 + multipart 제출(alert+reload / error console.log)
- 재사용 entities: `entities/mypage-qna`(postMypageQnaRegister) · `member-auth`. mock 기존

## 보존할 legacy quirk
- title "문의 하기"(공백) vs section-title "문의하기"(붙임) 불일치 보존
- 첨부파일 단일 input, 안내 문구 없음(PC와 다름)
- 취소 버튼 없음(PC와 다름)
- LoadingOverlay/제출 disabled 없음(무가드 제출)
- 오류 시 사용자 alert 없음(console.log만, alert 주석처리)
- hidden `mode=register`는 REST 엔드포인트로 대체(생략)
- subject input에 id 없음(label 연결 dead) 보존

## Parity 체크리스트 (모바일 UA)
- [ ] 세션 가드·MobileSubHeader("문의 하기")·section-title "문의하기"
- [ ] 폼: gubun select(:::선택::: + 9옵션 순서)/제목/내용(rows4,placeholder,clear-input)/단일 첨부
- [ ] required(gubun/subject/contents)
- [ ] 제출 → multipart POST → alert(error_msg) + reload / error console.log(alert 없음)
- [ ] 취소 버튼 없음·문의하기 submit만
- [ ] 모바일 head/viewport/theme #000/title "문의 하기" · 하단 네비 표시
- [ ] middleware rewrite + 데스크톱 폴백(PC mypage_qna_register)
