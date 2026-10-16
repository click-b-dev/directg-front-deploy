# 주말특가 프로모션 목록 (읽기 목록 + 이름검색 + 추천/인기게임 렌더)

> P1 #174. legacy `promotion_weekend.php`. 주말특가 프로모션(`tbl_promotion_weekend`, 폼 입력·unix 기간·`|`-구분 추천/인기게임 코드) 목록. 할인 프로모션(#170~173, tbl_promotion_schedule)과 **별개 테이블·별개 성격**. 수정 링크(#175)·상세 링크(#176)는 후속.

## 원본
- 파일: `pc/_Admin_/promotion/promotion_weekend.php` (라이브, 사이드바 `주말특가 프로모션 관리 > 주말특가 프로모션 목록`)
- 도메인: `AdminPromotion::getPromotionWeekend`(line 218) — `select * from tbl_promotion_weekend where idx>0`, **30/page**. `AdminGoods::getGoodsOptionSearch`(1153) — 코드→{product_code,product_name,game_type,product_platform}.
- 참조: `docs/legacy-admin/50-promotion-event.md` §주말특가 목록

## 화면·플로우
- 진입 URL: `/promotion/promotion_weekend` (파라미터 `page`,`search_key`,`search_value`)
- `$page_title="주말특가 프로모션 목록"`. breadcrumb: 홈/프로모션/주말특가 프로모션 관리/**주말특가 프로모션 목록**(active). h4 동일.
- **검색필터 카드** "주말 프로모션 검색필터": search_key select(옵션 **1개**: `search_name`="주말 프로모션 이름") + search_value(검색어) + 검색 버튼.
  - **is_view 필터는 UI 없음(dead)**: PHP는 `search_confirm`을 읽어 `is_view=val` 필터하나 UI 라디오 미존재(promotion_ready confirm과 동일 dead). → UI는 이름검색만.
- 카운트: `<div class="mb-2">{number_format(total)} 개</div>`.
- 목록 테이블(**7컬럼**, thead `table-light`):

| # | 헤더 | 셀 |
|---|------|----|
| 1 | 번호 | `total_results - ((page-1)*10) - num` (내림차순, **버그: 페이지크기 30인데 ×10 → 2페이지+ 번호 어긋남**, 원본 이식) |
| 2 | 주말특가 프로모션 이름 | `<a href=promotion_weekend_view.php?idx=>{promotion_week_name}</a>` (상세 #176 링크) |
| 3 | 주말특가 프로모션 기간 | `date('Y-m-d H:i:s', promotion_week_start)` ~ `date(..., promotion_week_end)` (**unix→포맷**) |
| 4 | 주말특가 추천게임 | `td.text-center.align-top` > `div.d-flex.flex-column…` > `ol.list-group.list-group-numbered` > 각 `promotion_week_recommand`(`\|` 분해) 코드마다 `<li class=list-group-item text-start>{code} / {name} / {game_type}</li>`(getGoodsOptionSearch) |
| 5 | 주말특가 인기게임 | `td.text-center` > `ol.list-group.list-group-numbered`(**추천게임과 달리 wrapper div·align-top 없음**) > 각 `promotion_week_best` 코드마다 동일 li |
| 6 | 노출여부 | is_view (raw Y/N) |
| 7 | 비고 | `<a href=promotion_weekend_register.php?mode=modify&idx= class="action-icon text-secondary font-14"><i class=mdi mdi-square-edit-outline font-16> 수정</a>` (수정 #175 링크) |

- 빈 목록: `<td colspan=7 class="text-center py-3 font-14">등록된 주말 프로모션이 없습니다.</td>` (total==0).
- 페이지네이션: links_html(ServerPagination), **30/page**, order `promotion_week_start desc,promotion_week_end desc`.

### 데이터 (legacy)
- SQL: `select * from tbl_promotion_weekend where idx>0` + add_where + order. add_where: search_name→`promotion_week_name LIKE %v%`, search_confirm(dead UI)→`is_view=val`.
- 추천/인기게임: `promotion_week_recommand`/`promotion_week_best`는 `\|`-구분 옵션코드 문자열. `explode("\|", str)`는 빈 문자열도 `[""]`(1개) 반환 → 각 코드 getGoodsOptionSearch. 미존재/빈 코드는 `{code}/ / ` 빈 필드 li로 렌더(quirk).
- 기간: promotion_week_start/end는 **unix timestamp(정수)** 저장.

## API 계약 (백엔드 전달)
`entities/promotion` 확장(weekend 하위).

- `GET /admin/promotion/promotion-weekend?page&search_key&search_value` → `{ items: PromotionWeekendListItem[], pagination }`
  - SQL: `tbl_promotion_weekend where idx>0` + search(promotion_week_name LIKE). order `promotion_week_start desc,promotion_week_end desc`, 30/page.
  - item: `{ idx, promotion_week_name, promotion_week_start(unix), promotion_week_end(unix), is_view, recommand_goods: WeekendGoodsItem[], best_goods: WeekendGoodsItem[] }`.
  - `recommand_goods`/`best_goods`: 백엔드가 `\|`-구분 코드를 getGoodsOptionSearch로 resolve해 `{product_code,product_name,game_type}[]` 반환(explode 빈문자열→1개 빈 항목 quirk 포함).
  - `WeekendGoodsItem = { product_code, product_name, game_type }`.
- mutation 없음(목록은 읽기, 수정은 #175).

## 타겟 매핑
- 라우트: `routes/promotion/promotion_weekend.tsx` (validateSearch page/search_key/search_value)
- 스크린: `screens/promotion-weekend/`
- entities: `entities/promotion` 확장(`fetchPromotionWeekendList`/`usePromotionWeekendList` + `PromotionWeekendListSearch`/`PromotionWeekendListItem`/`WeekendGoodsItem`/`PromotionWeekendListResponse`).
- mock: `handlers/promotion.ts` 확장 — GET promotion-weekend. 신규 `PROMOTION_WEEKEND` fixture(unix 기간, 추천/인기게임 resolved 배열, is_view Y·N).
- 기간 포맷: `shared/lib/datetime` `formatDateTime`(unix→'Y-m-d H:i:s') 재사용.
- 링크: 상세 `/promotion/promotion_weekend_view?idx=`(#176)·수정 `/promotion/promotion_weekend_register?mode=modify&idx=`(#175) — 라우트 미생성 시 죽은 링크(후속 이관).

## 파리티 결정 사항 (게이트 확인 대상)
1. **번호 ×10 버그**: 페이지크기 30인데 번호 계산이 `(page-1)*10` → 2페이지+ 번호 불일치. 원본 이식(내림차순).
2. **is_view 검색 UI 없음**(dead, 이름검색만).
3. **추천/인기게임 td 마크업 비대칭**(추천만 wrapper div+align-top).
4. **추천/인기게임 빈 코드 quirk**: explode 결과 빈 항목도 li 렌더(백엔드 resolve 책임, mock은 정상 게임만 fixture).
5. thead `table-light`(font-13 없음).
6. 상세/수정 링크는 후속(#175/#176) — 현재 죽은 링크.

## Parity 체크리스트
- [ ] 이름 검색필터(단일 옵션) 노출·선택 유지
- [ ] 7컬럼(번호 내림차순×10버그/이름링크/기간 unix포맷/추천·인기게임 ol li/노출여부/수정링크)
- [ ] 추천게임 td wrapper div+align-top, 인기게임 td 없음(비대칭)
- [ ] 빈 목록 colspan=7 메시지
- [ ] 30/page·DESC 정렬·thead table-light
