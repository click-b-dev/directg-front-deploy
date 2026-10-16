# 심의정보 등록 (grac_register)

## 원본
- 파일: `pc/_Admin_/goods/grac/grac_register.php` (변형/테스트 파일 없음 — 단일 라이브 버전)
- 연동 처리기: `pc/_Admin_/goods/grac/grac_ps.php` (`mode=register`)
- 참조 문서: `docs/legacy-admin/20-goods-catalog.md` (심의/GRAC)
- 선행 단위: #62 grac_list · #110 grac_batch — 기존 `entities/grac`·`handlers/grac.ts` 확장

## 화면·플로우
- 진입 URL/파라미터: `/goods/grac/grac_register.php?rateno=` (옵션)
- **legacy quirk (dead code, 반드시 이식)**:
  - `?rateno=` 있으면 `$mode="modify"` + `select * from grac_list where rateno` → `$data` 조회. **그러나 `$data`를 폼에 전혀 반영하지 않는다**(모든 input `value=""`/하드코딩). `$checked`/`$idx`도 미설정 → 라디오·체크박스 미선택, idx 빈값.
  - 즉 **폼은 register/modify 무관 항상 blank**(하드코딩 기본값만). 유일한 차이는 hidden `mode` 값.
  - `grac_ps.php`에 **`modify` case 없음** → mode=modify 제출은 no-op(insert 없음, `go()` 없음 → grac_ps.php 빈 페이지). 의미 있는 경로는 **register뿐**.
- 화면 요소 (legacy 기준, col-8 카드 1개):
  - breadcrumb: 홈 / 상품 / 심의정보 관리 / 심의정보 등록, page-title `심의정보 등록`
  - hidden: `mode`(register|modify), `idx`(빈값)
  - 등급분류번호(rateno) text col-4 / 게임물명(gametitle) text col-10 / 등급분류일자(rateddate) text col-4 (**datepicker 아님, 순수 text**)
  - 등급분류기관(orgname) 라디오 3: 게임물관리위원회 / 게임콘텐츠등급분류위원회 / **자체등급분류사업자(checked)**
  - 심의업체명(entname) 라디오 6 (id `entname3,4,7,8,9,10` 비연속·미선택): value=소니인터렉티브엔터테인먼트코리아(label ㈜소니인터랙티브엔터테인먼트코리아) / 한국마이크로소프트(label 한국마이크로소프트 유한회사) / 오큘러스(label 오큘러스브이알코리아 유한회사) / 에픽게임즈코리아(label 에픽게임즈코리아 유한회사) / 한국닌텐도(label 한국닌텐도주식회사) / 스마일게이트홀딩스
  - 게임플랫폼(platform) 라디오 1: **PC/온라인 게임(checked)**
  - 결정등급(givenrate) 라디오 6 (미선택): 전체이용가/12세이용가/15세이용가/청소년이용불가/등급거부/등급취소
  - 내용정보표시(descriptors[]) 체크박스 7 (미선택): 선정성/폭력성/공포/언어의부적절성/약물/범죄/사행성
  - card-footer float-end **저장** 버튼(submit)
- 검증: 클라이언트 검증 없음(required 미부여). 빈 값도 그대로 전송.
- 분기/리다이렉트: register 성공 → `go("grac_list.php")` → **/goods/grac/grac_list 리다이렉트**.
- 세션/권한 의존: `lib.php` 관리자 세션 가드. `sidebar_goods.php`, `topmenu['goods']=active`.
- **사이드바 미노출(숨김 메뉴)**: 심의정보 관리 그룹에서 "심의정보 등록" `<!-- -->` 주석처리. → nav.ts 미등록(이식).

## 데이터 (legacy)
- 처리기 `grac_ps.php` mode=register:
  - `descriptors[]` 배열을 콤마 조인(`선정성,폭력성,...`)
  - `insert into grac_list set gametitle,orgname,entname,givenrate,rateno,rateddate,descriptors,platform,reg_date=now() ON DUPLICATE KEY UPDATE ...`(rateno가 unique key → 존재 시 갱신)
  - 성공 후 `go("grac_list.php")`
- mode=modify: 매칭 case 없음 → 아무 동작 안 함(dead).

## API 계약 (백엔드 전달)

### `POST /admin/goods/grac` — 심의정보 등록(register)
- 요청:
  ```json
  { "mode": "register", "rateno": "", "gametitle": "", "rateddate": "",
    "orgname": "자체등급분류사업자", "entname": "", "platform": "PC/온라인 게임",
    "givenrate": "", "descriptors": ["선정성","폭력성"] }
  ```
- 응답: `{ "success": true }` → 프론트 `/goods/grac/grac_list` 이동(legacy go)
- 백엔드 책임:
  - mode=register → `grac_list` upsert(rateno unique key, `descriptors` 배열은 **콤마 조인 문자열**로 저장, reg_date=now).
  - mode=modify → **legacy no-op**(처리기 case 부재) 이식: 저장하지 않는다.

## 타겟 매핑
- 라우트: `/goods/grac/grac_register` (`routes/goods/grac/grac_register.tsx`, search `rateno`로 mode 판별)
- entities: `entities/grac` 확장(GracRegisterRequest + createGrac mutation)
- screens: `screens/goods-grac-register` (uncontrolled form + FormData, `descriptors` getAll)
- mock: `handlers/grac.ts` 확장(POST `/admin/goods/grac`)
- sidebar: **추가 안 함**(주석처리 미노출 이식)

## 타겟 단순화(파리티 주석)
- modify는 legacy에서 폼 미반영 + 처리기 no-op인 **도달 무의미 dead path**. SPA는 register 폼으로 구현하고, hidden `mode`만 `?rateno=` 유무로 register/modify를 반영(충실도). modify 제출 시 legacy의 "grac_ps.php 빈 페이지" 랜딩은 SPA에서 재현 불가 → onSuccess 리다이렉트는 register 기준으로만 배선. (동작 변경 아님 — dead path 미구현 명시.)

## Parity 체크리스트
- [ ] 화면 요소 일치 (col-8/필드 순서/라디오·체크박스 옵션·label 정확)
- [ ] 기본값 일치 (orgname 자체등급분류사업자·platform PC/온라인 게임 checked, 나머지 미선택)
- [ ] 폼 항상 blank (rateno 유무 무관, $data 미반영 dead 이식)
- [ ] 분기/플로우 일치 (register 저장→grac_list 리다이렉트·descriptors 콤마조인·required 없음)
- [ ] 사이드바 미노출·entname id 비연속 유지
