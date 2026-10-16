# 대규모 프로모션 등록/수정 (대형 등록/수정 겸용 폼)

> P1 #178. legacy `promotion_season_register.php` + `promotion_season_ps.php`. 대규모 프로모션(`tbl_promotion_season`) 등록/수정 겸용 폼. #175(주말특가 등록) 확대판 — 6 카테고리 코드 + 3 배너링크 + 공지 필드. idx>0 modify 프리필. 저장 → 목록(#177).

## 원본
- 파일: `pc/_Admin_/promotion/promotion_season_register.php` (라이브)
- 처리기: `pc/_Admin_/promotion/promotion_season_ps.php` (register/modify; delete dead)
- 참조: #175/#177 문서

## 화면·플로우
- 진입 URL: `/promotion/promotion_season_register` (register) · `?mode=modify&idx=N` (#177 링크)
- page_title: register="대규모 프로모션 등록", modify="대규모 프로모션 수정"(idx>0). h4 동일. breadcrumb: 홈/프로모션/대규모 프로모션 관리/{title}.
- **mode 판정**: idx>0 → modify, else register (GET mode 무시).
- 폼(col-12, `#frm` POST, hidden mode/idx):

| 필드 | 컨트롤 | required |
|------|--------|:---:|
| * 대규모 프로모션 이름 | `promotion_season_name` text | ✓ |
| * 대규모 프로모션 기간 | `promotion_season_start`·`_end` input-mask `0000-00-00 00:00:00`, `~` | ✓ |
| * PC 배너 URL (1296*500) | `promotion_season_banner_pc` text | ✓ |
| * 모바일 배너 URL (720*720) | `promotion_season_banner_mobile` text | ✓ |
| * 배너 링크 URL | `promotion_season_banner_link` text | ✓ |
| * 추천 및 특집 배너 URL (640*573) | `promotion_season_recommand_banner` text | ✓ |
| * 추천게임 | `promotion_season_recommand_1~4` (col-md-3) | ✓ 각 |
| * 인기게임 | `promotion_season_best_1~10` (col-md-2, 5+5) | ✓ 각 |
| * 역대 최대할인 설정 | `promotion_max_discount_1~3` (col-md-2) | ✓ 각 |
| * 역대 최대할인 배너 링크 URL | `promotion_max_discount_link` text | ✓ |
| * 추가 포인트 적립 | `promotion_add_repay_1~3` (col-md-2) | ✓ 각 |
| * 추가 포인트 적립 배너 링크 URL | `promotion_add_repay_link` text | ✓ |
| * 5천원 미만 게임 | `promotion_price_5000_1~5` (col-md-2) | ✓ 각 |
| * 1만원 미만 게임 | `promotion_price_10000_1~5` (col-md-2) | ✓ 각 |
| * 대규모 프로모션 URL | 정적 `<span class=form-control-plaintext>/promotion/promotion_season.html</span>` | — |
| 프로모션 공지 제목 | `notice_title` text (id="notice") | ✗ |
| 프로모션 공지 버튼명 | `notice_btn_title` text | ✗ |
| 프로모션 공지 버튼 URL | `notice_btn_url` text | ✗ |
| 프로모션 공지 영역 노출여부 | `notice_view` radio Y/N | ✗ |
| * 대규모 프로모션 노출여부 | `is_view` radio Y/N | ✓ |
| 저장 | `<button>대규모 프로모션 저장</button>` | — |

- modify 프리필: 이름/기간(unix→문자열)/배너4/6 카테고리(explode)/링크2/is_view·notice_view checked/공지 텍스트.
- `<script>` 전체 주석(dead).
- **quirk**: 추천게임·인기게임 label `for="promotion_season_banner_mobile"`(복붙), URL row label `for="event_link"`, 공지제목 input `id="notice"`(name은 notice_title). 원문 유지.

### 저장 (promotion_season_ps.php)
- 6 카테고리는 각 입력을 `\|` 조인: recommand(4)/best(10)/max_discount(3)/add_repay(3)/price_5000(5)/price_10000(5).
- 날짜 `strtotime`→unix. reg_date=now()(register).
- register/modify 모두 위 전체 필드 저장 → `go("promotion_season.php")`.

### legacy 버그 (register SQL 문법 오류)
- register INSERT에 `is_view=:is_view,,notice_title=...` — **이중 콤마(`,,`)** → SQL 문법 오류 → **등록 항상 실패**(PDO 에러 catch→echo+die). modify는 정상. → #177 검색 버그 선례처럼 **개발자 승인 하 오타 수정**(register 동작화). 게이트 확인 대상.

## API 계약 (백엔드 전달)
`entities/promotion` 확장.

- `GET /admin/promotion/promotion-season/:idx` → `PromotionSeasonDetail`
  - idx/name/start(문자열)/end(문자열)/banner_pc/banner_mobile/banner_link/recommand_banner/recommand[]/best[]/max_discount[]/add_repay[]/price_5000[]/price_10000[]/max_discount_link/add_repay_link/is_view/notice_title/notice_btn_title/notice_btn_url/notice_view. (날짜 unix→문자열, 6 카테고리 explode 코드)
- `POST /admin/promotion/promotion-season` (`PromotionSeasonSaveRequest`) → `{ success }` (register, **`,,` 버그 수정**)
- `PUT /admin/promotion/promotion-season/:idx` (`PromotionSeasonSaveRequest`) → `{ success }` (modify)
  - SaveRequest: 위 폼 필드(카테고리는 string[] — 백엔드 `\|` 조인, 날짜 strtotime→unix).
- 저장 성공 → 목록(#177) invalidate + 이동.

## 타겟 매핑
- 라우트: `routes/promotion/promotion_season_register.tsx` (validateSearch mode/idx)
- 스크린: `screens/promotion-season-register/` (등록/수정 겸용, 카테고리 입력 배열 생성)
- entities: `entities/promotion` 확장(detail/create/update + `PromotionSeasonRegisterSearch`/`PromotionSeasonDetail`/`PromotionSeasonSaveRequest`).
- mock: `handlers/promotion.ts` 확장 — GET/:idx·POST·PUT/:idx. `PROMOTION_SEASON` fixture에 `promotion_season_banner_link`/`promotion_max_discount_link`/`promotion_add_repay_link` 추가.
- 마스크: `shared/lib/input-mask`. **#177 수정 링크 활성화**.

## 파리티 결정 사항 (게이트 확인 대상)
1. **register `,,` SQL 버그 수정**(개발자 승인 하 등록 동작화, #177/#11 선례).
2. **label for quirk**(banner_mobile 중복·event_link·notice id="notice") 원문 유지.
3. **공지 4필드 non-required**·나머지 * required.
4. 정적 URL 표시·저장 후 목록 이동.

## Parity 체크리스트
- [ ] register 빈 폼 / modify 프리필(전체 필드) 일치
- [ ] 6 카테고리 입력 개수/배치·기간 input-mask
- [ ] 공지 4필드 non-required·is_view 등 required
- [ ] 저장 → register(버그수정)/modify → 목록 이동
- [ ] label for quirk·정적 URL
