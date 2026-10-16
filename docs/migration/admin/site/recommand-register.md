# 추천/특집 등록 폼 (#12)

## 원본
- 파일: `pc/_Admin_/site/main_recommand_register.php` (register/modify 겸용 — idx>0면 modify). 처리: `main_recommand_ps.php`(mode=register).
- **이 단위는 register 모드만**(목록 "수정"은 `main_recommand_modify.php` → #13).
- 참조: [recommand-list](recommand-list.md), [banner-register](banner-register.md)(유사 폼).

## 화면·플로우
- 진입: `/_Admin_/site/main_recommand_register.php` → 타겟 `/site/main_recommand_register`. sidebar_site, `$page_title="추천 및 특집 등록"`.
- breadcrumb: 홈/사이트/추천 및 특집 관리/추천 및 특집 등록.
- 폼(`col-9 > form#frm method=post action=main_recommand_ps.php`, hidden mode=register, hidden idx=""). 라벨은 `bg-secondary text-white`:
  1. `recommand_name` text **required** — "* 추천 및 특집 제목".
  2. 기간(col-sm-6): `recommand_start` ~ `recommand_end` text, input-mask `0000-00-00 00:00:00`, **둘 다 required**. (배너와 달리 상시노출 토글 없음 — 항상 필수.)
  3. `recommand_banner` text **required** — "* 추천 및 특집 배너", ph "디스크엔 URL".
  4. `recommand_banner_link` text **required** + `recommand_banner_target` select **required**(""=":::타겟선택:::"/_self 현재창/_blank 새창). **자동생성 버튼 없음**(배너와 차이).
  5. `recommand_goods_1~4` — **4개 text input 전부 required**, col-md-3, 라벨 "상품 1~4". (상품코드 입력, 검색 버튼 없음.)
  6. `is_view` radio Y(예)/N(아니오) — **register 기본 체크 없음**(checked는 modify에서만). col-sm-10.border.p-2.
  7. submit "추천 및 특집 저장".
- JS: submit 핸들러는 주석 처리된 빈 코드 → 실질 native POST. 자동생성·토글 없음.
- 제출: native POST register → INSERT → `go("main_recommand.php")`(목록 이동).

## 데이터 (legacy)
- INSERT `tbl_main_recommand` SET (main_recommand_ps.php register): recommand_name, `recommand_start=strtotime`, `recommand_end=strtotime`, recommand_banner, recommand_banner_link, recommand_banner_target, recommand_goods_1~4, is_view, `reg_date=now()`. **recommand_sort·is_del 미지정** → DB 기본값(sort 0, is_del 'N' 가정).

## API 계약 (백엔드 전달)
- **`POST /admin/site/main-recommands`** — 등록. body(문자열, 날짜는 "YYYY-MM-DD HH:MM:SS"):
  `{ recommand_name, recommand_start, recommand_end, recommand_banner, recommand_banner_link, recommand_banner_target, recommand_goods_1, recommand_goods_2, recommand_goods_3, recommand_goods_4, is_view }`.
  - 서버: 날짜 strtotime, `recommand_sort` 기본값(0), `is_del='N'`, `reg_date=now()`. 응답 `{ success: true }`.

## 타겟 매핑
- 라우트: `routes/site/main_recommand_register.tsx` → `screens/recommand-register`.
- entities/main-recommand 확장: `CreateMainRecommandRequest` 타입, `createMainRecommand` fetcher + `useCreateMainRecommand`(성공 시 목록 invalidate).
- 폼: uncontrolled + HTML5 required. 날짜만 controlled(`applyMask`/DATETIME_MASK 재사용). 제출 시 FormData → create → `/site/main_recommand` 이동.
- mock: create handler(insert, 새 idx=max+1, recommand_sort=0, is_del='N').

## Parity 체크리스트 (개발자 승인 완료 — ✅ 검증완료)
- [x] breadcrumb/제목/라벨(bg-secondary)·필드·required 일치
- [x] 기간 항상 required(토글 없음) + input-mask
- [x] 상품 1~4 input 전부 required
- [x] target select 옵션 / is_view 라디오(기본 체크 없음)
- [x] 자동생성 버튼 없음(배너와 차이)
- [x] 저장 → INSERT 계약(strtotime) → 목록 이동
- 기계 검증: tsc 0 / lint 0 / build 성공(431 modules).
