# 모바일 설문조사

## 원본 (legacy mobile)
- 파일: `mobile/event/survey.html`, 제출 처리 `mobile/event/survey_ps.php`
- PC 대응 단위: `docs/migration/storefront/event/survey.md`
- 라이브 버전 판별: 이벤트/외부 링크에서 `idx`로 진입하는 설문 전용 엔트리. 모바일 파일은 PC와 같은 설문 계약을 쓰며 모바일 전용 CSS만 다르다.

## 화면·플로우 (legacy mobile 기준)
- 진입 URL/파라미터: `/event/survey.html?idx=N`, `key=admin-survey&expires=`는 legacy 미리보기용
- 화면 요소:
  - `inc/sub_header.html`, `$page_title="설문조사"`
  - `#appCapsuleSub`
  - `.section.full.mt-2`
  - `form#survey-form` POST `./survey_ps.php`
  - hidden `mode=register`, `idx`, `key`, `expires`
  - `banner_image`가 있으면 하드코딩 배너 `https://directg.diskn.com/i7EuDjvcPb?2`
  - 질문 반복 `.section_item[data-required]`
  - 객관식 radio/checkbox + 기타(number=100) 입력 토글
  - 주관식 textarea
  - 참여이력 있으면 입력 disabled + 제출 클릭 시 `이미 제출하였습니다.`
- 폼 필드/검증:
  - required 질문에서 객관식 미선택 또는 주관식 빈값 → `alert("[필수 입력 누락]\n{질문}")` + `scrollIntoView`
- 분기/리다이렉트:
  - 종료/기간밖 → `종료된 설문입니다.` alert + back
  - 인원마감 → `참여인원이 마감된 설문입니다.` alert + back
  - 잘못된 접근 → 텍스트 `잘못된 접근`
  - 미로그인 → login_check
  - 제출 성공 → `참여 완료되었습니다. 감사합니다.` alert + `/event/survey.html?idx={idx}`
- 세션/권한 의존: 화면은 조건에 따라 로그인 필수. backend가 `accessError`/`preview`를 판단한다.

## 모바일 head / 앱셸
- viewport: `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover`
- theme-color: `#000000`
- title: `설문조사`
- description/keywords 빈값
- 사용 앱셸: `MobileSubHeader(pageTitle="설문조사")`; bottom-nav/sidebar/dialogs는 `app/m/layout.tsx`
- 페이지별 CSS: legacy mobile의 `#survey-form`, `.section_item`, `.option_label`, `.etc_text`, `.submit_btn` 전용 스타일 유지

## 데이터
- 재사용 엔티티:
  - `entities/survey/api/get-survey`
  - `entities/survey` `postSurveyAnswer`
- 모바일 전용 동작(증분/AJAX): 없음. `mobile/event/survey_ps.php`는 PC 설문 계약과 동일한 정규화 payload로 처리 가능하다.

## API 계약 (증분만, 백엔드 전달)
- 증분 없음. PC 설문 계약을 그대로 재사용한다.

## 타겟 매핑
- middleware `MOBILE_ROUTES` 추가 경로: `/event/survey.html`
- 라우트: `app/m/event/survey.html/page.tsx`
- screen: `screens/mobile-survey`
- 재사용 entities: `survey`
- 신규 UI: `MobileSurveyForm`, `MobileSurveyAccessGuard`
- mock: 기존 `GET */api/surveys/:idx`, `POST */api/surveys/:idx/answer` 재사용

## Parity 체크리스트 (모바일 UA)
- [x] 화면 요소 일치
- [x] 필드/검증 일치
- [x] 접근 분기/제출 플로우 일치
- [x] 모바일 head/viewport 일치
- [x] 증분 API 없음 일치
- [x] 참여이력 disabled 복원/이미 제출 alert 일치
- [x] middleware rewrite/데스크톱 폴백 경로 등록
