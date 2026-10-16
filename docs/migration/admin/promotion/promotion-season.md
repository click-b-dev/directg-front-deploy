# 대규모 프로모션 목록 (프로모션당 대형 카드)

> P1 #177. legacy `promotion_season.php`. 대규모 프로모션(`tbl_promotion_season`, 폼 입력·unix 기간·6개 카테고리 `|`-코드) 목록. 주말특가(#174)와 달리 **테이블이 아닌 프로모션당 대형 카드**(배너 PC/모바일 + 추천·특집 + 최대할인/추가적립/인기게임/5천·1만원 미만 + 공지). 수정(#178)·상세(#179) 링크는 후속.

## 원본
- 파일: `pc/_Admin_/promotion/promotion_season.php` (라이브, 사이드바 `대규모 프로모션 관리 > 대규모 프로모션 목록`)
- 도메인: `AdminPromotion::getPromotionSeason`(`select * from tbl_promotion_season where idx>0`, 30/page). `AdminGoods::getGoodsOptionSearch`(코드→{product_code,product_name,...}).
- 참조: `docs/legacy-admin/50-promotion-event.md` §대규모 목록, #174 문서

## 화면·플로우
- 진입 URL: `/promotion/promotion_season` (파라미터 `page`,`search_key`,`search_value`)
- `$page_title="대규모 프로모션 목록"`. breadcrumb: 홈/프로모션/대규모 프로모션 관리/**대규모 프로모션 목록**(active).
- **검색필터 카드** "대규모 프로모션 검색필터": search_key select(옵션 1개 `search_name`="대규모 프로모션 이름") + search_value + 검색.
  - is_view 필터는 UI 없음(dead, promotion_ready/weekend 동일).
- 카운트: `<div class="mb-2">{number_format(total)} 개</div>`.
- **프로모션당 카드**(`card mb-4`), 각 카드:
  - **card-header**(p-2): float-start(이름 `<a href=promotion_season_view.php?idx=>` #179 + "프로모션 기간": start~end unix포맷 + is_view 뱃지 "노출함"/"노출안함") · float-end(수정 링크 `promotion_season_register.php?mode=modify&idx=` #178 "프로모션 수정").
  - **공지 card-header**(notice_view=='Y'일 때만): "프로모션 공지 >> {notice_title}" + 버튼(`a href=notice_btn_url target=_blank btn-sm btn-primary` = notice_btn_title).
  - **card-body**(p-0) > card.rounded-0 > row.g-0:
    - **col-md-3**: PC버전 배너(img promotion_season_banner_pc) + 모바일버전 배너(img promotion_season_banner_mobile). 각 card+헤더.
    - **col-md-3**: 추천 및 특집(img promotion_season_recommand_banner) + recommand goods 목록.
    - **col-md-6** > row.g-1:
      - col-md-4: "대규모 역대 최대할인"(max_discount goods) + "추가 포인트 적립"(add_repay goods)
      - col-md-4: "대규모 인기게임"(best goods)
      - col-md-4: "대규모 5천원 미만"(price_5000 goods) + "대규모 1만원 미만"(price_10000 goods)
  - 각 goods 항목: `<div class="p-1 border-start border-bottom border-end font-12">{product_code} <br/> {product_name} </div>` (getGoodsOptionSearch, code+name만).
- 페이지네이션: links_html(ServerPagination), 30/page, order `promotion_season_start desc,promotion_season_end desc`.
- **빈 목록 메시지 없음**(카드 반복만).

### 데이터 (legacy)
- SQL: `select * from tbl_promotion_season where idx>0` + add_where + order.
- 6개 카테고리(`promotion_season_recommand`/`_best`/`promotion_max_discount`/`promotion_price_5000`/`promotion_price_10000`/`promotion_add_repay`)는 `\|`-구분 코드 → explode → getGoodsOptionSearch.
- 배너 3종(`promotion_season_banner_pc`/`_mobile`/`_recommand_banner`)은 이미지 URL.
- 공지: notice_view/notice_title/notice_btn_url/notice_btn_title.
- 기간: promotion_season_start/end unix.

### legacy 버그 (검색)
- 검색 add_where가 `promotion_week_name like`(주말특가 컬럼 복붙) — **tbl_promotion_season에 없는 컬럼** → 실제 이름 검색 시 SQL 에러/무효. #11(recommand-list) 선례처럼 **개발자 승인 하 의도된 컬럼(`promotion_season_name`)으로 수정**해 검색 동작. 게이트 확인 대상.

## API 계약 (백엔드 전달)
`entities/promotion` 확장.

- `GET /admin/promotion/promotion-season?page&search_key&search_value` → `{ items: PromotionSeasonListItem[], pagination }`
  - SQL: `tbl_promotion_season where idx>0` + search(promotion_season_name LIKE — legacy 버그 수정). order `promotion_season_start desc,promotion_season_end desc`, 30/page.
  - item: `{ idx, promotion_season_name, promotion_season_start(unix), promotion_season_end(unix), is_view, notice_view, notice_title, notice_btn_url, notice_btn_title, promotion_season_banner_pc, promotion_season_banner_mobile, promotion_season_recommand_banner, recommand_goods, best_goods, max_discount_goods, add_repay_goods, price_5000_goods, price_10000_goods }`.
  - 6개 goods 배열: 백엔드가 `\|`-코드를 getGoodsOptionSearch로 resolve. `SeasonGoods = { product_code, product_name }`.

## 타겟 매핑
- 라우트: `routes/promotion/promotion_season.tsx` (validateSearch page/search_key/search_value)
- 스크린: `screens/promotion-season/`
- entities: `entities/promotion` 확장(`fetchPromotionSeasonList`/`usePromotionSeasonList` + `PromotionSeasonListSearch`/`PromotionSeasonListItem`/`SeasonGoods`/`PromotionSeasonListResponse`).
- mock: `handlers/promotion.ts` 확장 — 신규 `PROMOTION_SEASON` fixture + GET promotion-season. 기간 포맷 `shared/lib/datetime` formatDateTime.
- badge: is_view "노출함/노출안함"은 통일 `shared/ui/Badge`(variant secondary) 사용(프로모션 badge 통일 결정).
- 링크: 상세 `/promotion/promotion_season_view?idx=`(#179)·수정 `/promotion/promotion_season_register?mode=modify&idx=`(#178) — 라우트 미생성 시 죽은 링크.

## 파리티 결정 사항 (게이트 확인 대상)
1. **검색 컬럼 버그 수정**(promotion_week_name→promotion_season_name, 개발자 승인 하 동작화, #11 선례).
2. **is_view 검색 UI 없음**(dead).
3. **is_view 뱃지 통일 Badge**(variant secondary, 프로모션 badge 통일 결정 계승 — legacy `bg-secondary font-14`와 형태 상이).
4. **배너/추천 이미지 외부 URL**: dev 미로드.
5. 6개 카테고리 goods `\|`분해 resolve(백엔드).

## Parity 체크리스트
- [ ] 검색필터(이름 단일) 노출·선택 유지·동작(수정된 컬럼)
- [ ] 프로모션당 카드(헤더 이름·기간·노출뱃지·수정링크 / 공지 조건부 / 배너 PC·모바일 / 추천특집 / 6카테고리 goods)
- [ ] goods 항목 `{code} <br/> {name}` 마크업
- [ ] 30/page·DESC 정렬
- [ ] #178/#179 링크(죽은 상태)
