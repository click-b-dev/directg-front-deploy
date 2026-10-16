# 주말특가 프로모션 등록/수정 (등록/수정 겸용 폼)

> P1 #175. legacy `promotion_weekend_register.php` + `promotion_weekend_ps.php`. 주말특가 프로모션(`tbl_promotion_weekend`) 등록/수정 겸용 폼. idx>0면 modify 프리필, 아니면 register. 저장 → 목록(#174) 리다이렉트.

## 원본
- 파일: `pc/_Admin_/promotion/promotion_weekend_register.php` (라이브, 사이드바 `주말특가 프로모션 관리 > 주말특가 프로모션 등록`)
- 처리기: `pc/_Admin_/promotion/promotion_weekend_ps.php` (mode register/modify; delete는 빈 케이스 dead)
- 참조: `docs/legacy-admin/50-promotion-event.md` §주말특가 등록/수정, #174 문서

## 화면·플로우
- 진입 URL: `/promotion/promotion_weekend_register` (register) · `?mode=modify&idx=N` (수정, #174 목록 링크)
- `$page_title="주말특가 프로모션 등록"`(modify도 동일). breadcrumb: 홈/프로모션/주말특가 프로모션 관리/**주말특가 프로모션 등록**(active). h4 동일.
- **mode 판정**: `if($idx>0){ $mode="modify"; }else{ $mode="register"; }` (GET mode 무시, idx로만 판정 — notice-register 선례 동일).
- 폼(col-9, `#frm` POST → promotion_weekend_ps.php, hidden mode/idx):

| 필드 | 컨트롤 | 비고 |
|------|--------|------|
| * 주말 프로모션 이름 | `promotion_week_name` text required | label bg-secondary text-white |
| * 주말 프로모션 기간 | `promotion_week_start`·`promotion_week_end` text `input-mask 0000-00-00 00:00:00` required, `~` 구분 | modify: unix→'Y-m-d H:i:s' 프리필 |
| * 배너 링크 URL | `promotion_week_banner_link` text required | |
| * 추천게임 | `promotion_week_recommand_1~4` text **각 required**, col-md-3 4칸 | modify: recommand explode[0..3] 프리필 |
| * 인기게임 | `promotion_week_best_1~10` text **각 required**, col-md-2 (5+5 2줄) | modify: best explode[0..9] 프리필 |
| * 주말 프로모션 URL | 정적 `<span class="form-control-plaintext">/promotion/promotion_weekend.html</span>` | 입력 아님(표시만) |
| * 주말 프로모션 노출여부 | `is_view` radio Y(예)/N(아니오) | modify: 저장값 checked. register: 미선택 |
| 저장 | `<button type=submit>주말 프로모션 저장</button>` (text-end) | |

- `<script>` 전체 주석(dead). 폼은 일반 POST.
- **label for quirk**: 추천게임·인기게임 label `for="promotion_week_banner_mobile"`(복붙 오류), URL row label `for="event_link"`. 원문 유지.

### 저장 (promotion_weekend_ps.php)
- `promotion_week_recommand` = 추천게임 1~4를 `\|`로 조인. `promotion_week_best` = 인기게임 1~10을 `\|`로 조인.
- register: `insert into tbl_promotion_weekend set ... promotion_week_start=strtotime(start), promotion_week_end=strtotime(end), ... reg_date=now()` → `go("promotion_weekend.php")`.
- modify: `update tbl_promotion_weekend set ... where idx` → `go("promotion_weekend.php")`.
- **dead 읽기**: `promotion_week_banner_pc`·`promotion_week_banner_mobile`을 POST에서 읽으나 폼에 필드 없음·저장 안 함(무시).
- 검증: 필드 required(브라우저), 서버측 추가 검증 없음.

## 데이터 (legacy)
- modify 로드 SQL: `select * from tbl_promotion_weekend where idx=:idx`. 날짜 unix→`date('Y-m-d H:i:s')`, recommand/best `explode("\|")`, is_view checked.
- 저장: 위 insert/update. 날짜 `strtotime`(문자열→unix).

## API 계약 (백엔드 전달)
`entities/promotion` 확장.

- `GET /admin/promotion/promotion-weekend/:idx` → `PromotionWeekendDetail`
  - `{ idx, promotion_week_name, promotion_week_start(문자열 'Y-m-d H:i:s'), promotion_week_end(문자열), promotion_week_banner_link, recommand: string[](코드), best: string[](코드), is_view }`.
  - 백엔드: unix→문자열 포맷, recommand/best explode.
- `POST /admin/promotion/promotion-weekend` (`PromotionWeekendSaveRequest`) → `{ success }` (register)
- `PUT /admin/promotion/promotion-weekend/:idx` (`PromotionWeekendSaveRequest`) → `{ success }` (modify)
  - `PromotionWeekendSaveRequest = { promotion_week_name, promotion_week_start('Y-m-d H:i:s'), promotion_week_end, promotion_week_banner_link, recommand: string[4], best: string[10], is_view }`.
  - 백엔드: 날짜 strtotime→unix, recommand/best `\|` 조인, insert/update.
- 저장 성공 → 목록(#174) invalidate + 이동(legacy go(promotion_weekend.php)).

## 타겟 매핑
- 라우트: `routes/promotion/promotion_weekend_register.tsx` (validateSearch mode/idx)
- 스크린: `screens/promotion-weekend-register/` (등록/수정 겸용)
- entities: `entities/promotion` 확장(detail/create/update + `PromotionWeekendDetail`/`PromotionWeekendSaveRequest`/`PromotionWeekendRegisterSearch`).
- mock: `handlers/promotion.ts` 확장 — GET/:idx(detail)·POST(create)·PUT/:idx(update). fixture(`PROMOTION_WEEKEND`)에 `promotion_week_banner_link` 추가. 날짜 unix↔문자열 변환 헬퍼.
- 마스크: `shared/lib/input-mask` DATETIME_MASK/applyMask 재사용. 상태 관리(FormData 별도).

## 파리티 결정 사항 (게이트 확인 대상)
1. **mode idx 판정**(GET mode 무시, idx>0=modify) — notice-register 선례.
2. **label for quirk**(promotion_week_banner_mobile 중복·event_link) 원문 유지.
3. **dead 배너 pc/mobile POST 읽기** 미이식(폼 필드 없음).
4. **추천4·인기10 각 required**·저장 시 `\|` 조인(백엔드).
5. 정적 URL 표시 `/promotion/promotion_weekend.html`(입력 아님).
6. 저장 후 목록 이동(#174).

## Parity 체크리스트
- [ ] register 빈 폼 / modify 프리필(이름/기간/배너링크/추천4/인기10/노출) 일치
- [ ] 기간 input-mask 동작·프리필 unix→문자열
- [ ] 추천4·인기10 칸 배치(col-md-3 4 / col-md-2 5+5) 및 required
- [ ] 정적 URL 표시·label for quirk
- [ ] 저장 → register insert/modify update → 목록 이동
