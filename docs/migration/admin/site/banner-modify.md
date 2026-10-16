# 배너 수정 (M2-10)

## 원본
- 파일: `pc/_Admin_/site/banner_modify.php` (라이브 단일). 처리: `banner_proc.php`(mode=modify, banner_link_search).
- 참조: [banner-register](banner-register.md)(폼 동일), [banner-list](banner-list.md).

## 화면·플로우
- 진입: `/_Admin_/site/banner_modify.php?idx=` → 타겟 `/site/banner_modify?idx=`. sidebar, `$page_title="메인배너 수정"`.
- breadcrumb: 홈/사이트/사이트 관리/메인배너 수정.
- **register와 동일 폼** + 차이:
  1. 진입 시 `select * from tbl_main_banner where idx=:idx` → `$data`로 **전 필드 프리필**.
  2. hidden `mode=modify` + hidden `idx`.
  3. `banner_start/end` = `date('Y-m-d H:i:s', epoch)` (epoch 0도 1970 표기 그대로).
  4. `banner_target` `<option selected>`, flag/bannerPeriodOutputFl/show_prod_info/show_sale_info 라디오 `checked` = 로드값.
  5. `#bannerPeriodDate` 초기 `style=display:block/none` = 로드된 bannerPeriodOutputFl 기준(서버 렌더).
  6. **우측 col-3 미리보기**: "메인배너 PC"/"메인배너 모바일" 카드 + `img[src=banner_pc/banner_mobile]` (로드 데이터 기준 정적, 입력 실시간 반영 아님).
- JS: register와 동일(btn_banner_link_auto, bannerPeriodOutputFl change로 날짜 표시·required 토글).
- 제출: native POST modify → UPDATE → `go("banner_list.php")`.

## 데이터 (legacy)
- 조회: `select * from tbl_main_banner where idx=:idx` → 단건.
- UPDATE(banner_proc.php modify): register와 동일 필드 SET + `banner_start/end=strtotime()`, WHERE idx. (reg_date 미변경.)

## API 계약 (백엔드 전달)
- **`GET /admin/site/main-banners/{idx}`** — 단건 프리필. 응답 `MainBannerDetail`(= 목록 아이템 + `show_prod_info`/`show_sale_info`, `banner_start/end`는 epoch). 미존재 → 404 `NOT_FOUND`.
- **`PUT /admin/site/main-banners/{idx}`** — 수정. body = 등록과 동일(`UpdateMainBannerRequest`). 서버가 날짜 strtotime, WHERE idx UPDATE. 응답 `{ success: true }`.
- (banner-link는 #9와 동일 엔드포인트 재사용.)

## 타겟 매핑
- 라우트: `routes/site/banner_modify.tsx`(search idx) → `screens/banner-modify`.
- entities/main-banner 확장: `MainBannerDetail`/`UpdateMainBannerRequest` 타입, `fetchMainBanner`+`useMainBanner`(단건), `updateMainBanner`+`useUpdateMainBanner`.
- 폼: register 구조 복제(legacy도 register/modify 별도 파일 중복) + 프리필 + col-3 미리보기. `BannerModifyForm`은 로드된 banner로 초기 state 설정(데이터 로드 후 렌더).
- 공유 재사용: `applyMask`(input-mask), `formatDateTime`(shared로 승격 — banner-list와 2번째 사용), entities.
- mock: `MainBannerRow`에 `show_prod_info`/`show_sale_info` 컬럼 추가(#9 예고 확장), create가 이제 저장. detail GET + update PUT 핸들러.

## Parity 체크리스트 (개발자 승인 완료 — ✅ 검증완료)
- [x] breadcrumb/제목/폼 필드·라벨 = register 동일
- [x] 전 필드 프리필(text/select selected/radio checked/날짜 date 포맷)
- [x] 기간 초기 표시(로드값 기준 display) + 토글 동작
- [x] 우측 미리보기(PC/모바일 이미지) col-3
- [x] 링크 자동생성 / 날짜 input-mask
- [x] 저장 → UPDATE 계약(strtotime) → 목록 이동
- 기계 검증: tsc 0 / lint 0 / build 성공(418 modules).

## 보류
- `banner-link` mock은 샘플 코드만 illustrative(실제 goods_item 분기는 백엔드).
- 미리보기는 legacy처럼 로드 데이터 정적 — 입력 중 실시간 갱신 아님(그대로).
