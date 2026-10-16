# 주말특가 프로모션 상세보기 (스토어프론트 카드 미리보기)

> P1 #176. legacy `promotion_weekend_view.php`. 주말특가 프로모션(`tbl_promotion_weekend`)을 스토어프론트에 노출되는 형태로 미리보기하는 **읽기전용 카드 뷰**. 배너 + DG 추천게임(4) + 프로모션 인기게임(대형 4 + 소형 6). #174 목록의 이름 링크 대상.

## 원본
- 파일: `pc/_Admin_/promotion/promotion_weekend_view.php` (라이브, 링크 진입 전용, 사이드바 미노출)
- 도메인: `AdminGoods::getGoodsOptionTitleInfo`(1160, 대표상품)·`getGoodsItemDetail`(1178, 옵션+promotion)·`getPromotionGoodsPrice`(1228, tbl_promotion_schedule confirm='Y' 진행중)
- 참조: #174/#175 문서, `docs/design-system/admin.md`

## 화면·플로우
- 진입 URL: `/promotion/promotion_weekend_view?idx=N` (#174 목록 이름 링크)
- `$page_title="주말특가 프로모션 상세보기"`, **h4 = promotion_week_name**. breadcrumb: 홈/프로모션/주말특가 프로모션 관리/주말특가 프로모션 상세보기.
- **배너**: `<a href={promotion_week_banner_link} target=_blank><img src="https://image.directg.net/U84s2DngyK" class="w-100" alt="다이렉트 게임즈 주말 프로모션"></a>` — **이미지 URL 하드코딩(정적 placeholder)**. `b-example-divider`.
- **DG 추천게임** 섹션(`h3.fw-bold`, `row-cols-md-4`): recommand 코드 전체(최대 4) 카드:
  - card-header(bg-secondary) = title_name
  - 이미지: `{title_domain}/upload/title/{title_id}/hero/hero_capsule.jpg`, onerror→`/assets/images/logo/H2_DG_BI_VERTICAL.svg`, 링크 `/game/game_view.html?product_id={title_sku}`
  - footer: discount>0이면 `-{discount}%` 뱃지(promotion_label)+consumer_price 취소선, price(number_format). promotion_label = **sale_price>0 → bg-danger, else bg-primary**. discount/price = promo면 promotion.discount_rate/sale_price, else option.discount/option.price.
- **프로모션 인기게임** 섹션(`h3.fw-bold`):
  - **대형(row-cols-md-4, col-3)**: best 코드 index<4 (첫 4개). 카드(bg-dark): header(view_url 링크, product_name 텍스트) + 이미지 `{option_domain}/upload/product/{product_code}/header/header.jpg?t=20251027`(onerror fallback) + 순위 뱃지(ranking++) + option_gubun(bottom-start) + 코드발송/프로모션(is_promotion=Y)/예약구매(is_preorder=Y)/특전(is_bonus=Y) 뱃지 + footer(discount/price 동일 규칙).
  - **소형(row-cols-md-6, col-2)**: best 코드 index>=4 (나머지 6개). 유사 카드(bg-card, header.jpg **?t 없음**), 순위 연속. footer는 **discount 조건 없이 항상 consumer_price 취소선+price** 표시(대형과 미세 차이).
  - **option_gubun**(display_type): basic→`기본게임`(bg-info), edition→`에디션`(bg-primary), (bundle은 game_type switch에서 `번들`(bg-success)로 덮어씀).
  - **view_url**(game_type): game→`/game/game_view.html?product_id={title_sku}`, dlc→`/game/dlc_view.html?sku={goods_sku}`, bundle→`/game/bundle_view.html?sku={goods_sku}`.
  - **순위(ranking)**: 대형 1~4 → 소형 5~10 연속.

## 데이터 (legacy)
- 로드 SQL: `select * from tbl_promotion_weekend where idx=:idx`. recommand/best `explode("\|")`.
- 각 코드: `getGoodsOptionTitleInfo(code)` → {title_id,title_name,sku,domain,...}, `getGoodsItemDetail(code)` → {product_code,product_name,consumer_price,price,discount,display_type,game_type,goods_sku,is_preorder,is_bonus,domain,promotion:{sale_price,discount_rate}(getPromotionGoodsPrice, confirm='Y' 진행중 or false)}.
- 빈/미존재 코드 → false → 카드 빈 필드(이미지 fallback) 렌더(quirk).

## API 계약 (백엔드 전달)
`entities/promotion` 확장.

- `GET /admin/promotion/promotion-weekend/:idx/view` → `PromotionWeekendView`
  - `{ idx, promotion_week_name, promotion_week_banner_link, recommand: WeekendViewGoods[], best: WeekendViewGoods[] }`.
  - 백엔드가 recommand/best 코드를 getGoodsOptionTitleInfo+getGoodsItemDetail로 resolve. 프론트가 화면 파생(promotion_label/price/discount 선택, option_gubun, view_url, ranking) 수행(legacy 뷰 로직 이식).
  - `WeekendViewGoods = { title_name, title_id, title_sku, title_domain, product_code, product_name, option_domain, goods_sku, consumer_price, option_price, option_discount, display_type, game_type, is_preorder, is_bonus, promotion_sale_price, promotion_discount_rate }`.

## 타겟 매핑
- 라우트: `routes/promotion/promotion_weekend_view.tsx` (validateSearch idx)
- 스크린: `screens/promotion-weekend-view/`
- entities: `entities/promotion` 확장(`fetchPromotionWeekendView`/`usePromotionWeekendView` + `PromotionWeekendView`/`WeekendViewGoods`/`PromotionWeekendViewSearch`).
- mock: `handlers/promotion.ts` 확장 — GET /:idx/view. 저장된 `PROMOTION_WEEKEND`의 recommand_goods/best_goods 코드를 resolve(mock은 title/price/promotion 등 합성, 실제는 백엔드).
- **#174 목록 이름 링크(`/promotion/promotion_weekend_view?idx=`) 활성화**.

## 파리티 결정 사항 (게이트 확인 대상)
1. **배너 이미지 하드코딩**(`https://image.directg.net/U84s2DngyK`) 유지 — dev에서 미로드→broken(정적 원본 동일).
2. **외부 이미지 도메인**(hero/header): directg.net 도메인, dev 미로드→onerror fallback 로고. 정상.
3. **대형/소형 footer 미세차**: 대형은 discount>0 조건부 취소선, 소형은 항상 취소선+price.
4. **promotion_label/price/discount/option_gubun/view_url 파생**을 프론트 컴포넌트에서 legacy 뷰와 동일 재현.
5. **빈 코드 quirk**: 미존재 코드 카드 빈 필드(백엔드 resolve 책임, mock은 정상 게임 합성).
6. 스토어프론트 클래스명(Bootstrap) 원본 유지, 스타일 값 하드코딩은 legacy 그대로.

## Parity 체크리스트
- [ ] h4=이름, breadcrumb, 배너(링크+하드코딩 이미지)
- [ ] DG 추천게임 4카드(header/hero image/game_view 링크/discount·price footer)
- [ ] 인기게임 대형 4(순위·header image·option_gubun·코드발송/프로모션/예약/특전 뱃지·footer)
- [ ] 인기게임 소형 6(순위 연속·header.jpg ?t 없음·footer 항상 취소선)
- [ ] promotion_label/price/discount/option_gubun/view_url 파생 일치
- [ ] #174 이름 링크 활성화
