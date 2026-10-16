# 대표상품 심의정보 설정 (#23)

> 영역: 상품 > 대표상품 관리 > (단일) 심의정보 설정. sub_sidebar_title "심의정보 설정"(title_code==33만 노출).

## 원본
- 파일: `pc/_Admin_/goods/title_grac_register.php` (269줄). 처리: `title_ps.php` mode=grac_save(1573~1595). 포함: sub_sidebar_title(grac active).
- 참조: [title-modify](title-modify.md), [title-attribute-set](title-attribute-set.md).

## 화면·플로우
- 진입: `/_Admin_/goods/title_grac_register.php?title_id=` → 타겟 `/goods/title_grac_register?title_id=`. `$page_title="대표상품 심의정보 설정"`.
- 로드: tbl_goods(rateno/age_limit/game_rate). 레이아웃 col-2 sub-nav + col-10.
- breadcrumb: 홈/상품/대표상품 관리/심의정보 설정. 타이틀 `{title_name} <small>({en})</small>`.
- 폼(frm, mode=grac_save는 JS로 설정): 카드 "대표상품 심의정보".
  - **rateno(등급분류번호)**: text + "심의정보검색" 버튼(type=button, **핸들러 없음 = no-op**).
  - **age_limit(결정등급)**: radio 10(전체 이용가)/12(12세이용가)/15(15세이용가)/19(청소년이용불가). 로드 checked.
  - **game_rate[](내용정보표시)**: checkbox 7종 — 선정성(64)/폭력성(32)/공포(16)/언어의부적절성(8)/약물(4)/범죄(2)/사행성(1). **game_rate 7자리 2진 문자열의 각 자리(char[i]=='1')로 checked**. char0(MSB)=선정성(64) … char6(LSB)=사행성(1).
  - footer: 저장 "대표상품 심의정보 저장"(아이콘, product_viewer 숨김).
- JS: 폼 submit 시 체크된 game_rate[] 값 합을 `dec.toString(2)`로 `game_rate_text`에 set. `#btn_grac_save` 클릭 → mode=grac_save 후 submit.
- 제출: UPDATE 후 `go("title_grac_register.php?title_id=")` = 자기 페이지 reload.

## 데이터 (legacy)
- 로드: `SELECT * FROM tbl_goods WHERE title_id` — game_rate(2진 문자열), rateno, age_limit.
- **grac_save UPDATE**(title_ps 1573~1595): `tbl_goods SET age_limit, game_rate=str_pad(game_rate_text,7,'0',STR_PAD_LEFT), rateno, orgname WHERE title_id`. + `tbl_title_option SET age_limit WHERE title_id`(관련 옵션 전파). **orgname**: 폼에 입력 없음 → 빈값 저장(덮임).

## API 계약 (백엔드 전달)
- **`GET /admin/goods/titles/:titleId/grac`** — 응답 `{ title_id, title_name, title_name_en, rateno, age_limit, game_rate }`(game_rate 7자리 2진). 없으면 404.
- **`PUT /admin/goods/titles/:titleId/grac`** — grac_save UPDATE. body: `{ rateno, age_limit, game_rate_text, orgname }`. 서버: game_rate = pad7(game_rate_text), tbl_title_option.age_limit 전파. orgname 빈값. 응답 `{ success }`.

## 타겟 매핑
- 라우트: `routes/goods/title_grac_register.tsx`(search title_id) → `screens/title-grac`.
- 위젯: `widgets/title-sub-nav`(active="grac").
- entities/goods-title 확장: `TitleGrac`/`GracRequest` 타입, `fetchGrac`+`useGrac`, `updateGrac`+`useUpdateGrac`(성공 시 invalidate=페이지 유지).
- mock: GoodsTitleRow에 `game_rate: string`(7자리 2진, 기본 "0000000") 추가. GET grac(row 값), PUT grac(rateno/age_limit/game_rate 갱신).
- 시각: 카드/폼 legacy 클래스 그대로. game_rate 비트 디코드/인코드. 심의정보검색 버튼 no-op. product_viewer 숨김 미반영(기존 단위 동일).

## Parity 체크리스트 (셀프 검증 완료 — 개발자 승인 대기)
- [x] 레이아웃(col-2 sub-nav) + 카드/필드
- [x] rateno text + 검색버튼(no-op), age_limit radio 로드 checked
- [x] game_rate 7비트 → 7개 checkbox 디코드(선정성64…사행성1)
- [x] 저장 시 체크합 → 2진 game_rate_text → pad7 저장, 페이지 유지(invalidate)
- 보류: product_viewer 저장버튼 숨김 미반영(기존 단위 동일). tbl_goods.orgname(폼 미노출, 저장 시 ""로 덮임)·tbl_title_option age_limit 전파는 백엔드 책임(mock 미모델). 심의정보검색 버튼 no-op(legacy 동일).
- 기계 검증: tsc 0 / lint 0 / build 성공.
