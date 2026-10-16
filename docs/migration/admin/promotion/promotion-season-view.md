# 대규모 프로모션 상세보기 (스토어프론트 카드 미리보기, 6섹션)

> P1 #179. legacy `promotion_season_view.php`(35KB, 그룹 최대). 대규모 프로모션(`tbl_promotion_season`)을 스토어프론트 형태로 미리보기하는 **읽기전용 카드 뷰**. #176(주말특가 뷰) 확장판 — 6섹션. #177 목록 이름 링크 대상.

## 원본
- 파일: `pc/_Admin_/promotion/promotion_season_view.php` (라이브, 링크 진입 전용, 사이드바 미노출)
- 도메인: `AdminGoods::getGoodsOptionTitleInfo`+`getGoodsItemDetail`(+`getPromotionGoodsPrice`) — #176과 동일 resolve.
- 참조: #176/#177 문서, `docs/design-system/admin.md`, 프로모션 badge 통일 결정([[promotion-badge-ui-unify]])

## 화면·플로우
- 진입 URL: `/promotion/promotion_season_view?idx=N` (#177 이름 링크)
- `$page_title` 고정, **h4 = promotion_season_name**. breadcrumb: 홈/프로모션/대규모 프로모션 관리/대규모 프로모션 상세보기.
- 6 카테고리 각 코드를 explode → getGoodsOptionTitleInfo+getGoodsItemDetail resolve (best는 index<4=대형/이상=소형 분리, #176 동일).

### 섹션
1. **배너**: `<a href={banner_link} target=_blank><img src={banner_pc} w-100 alt={name}></a>` + divider.
2. **DG 추천게임** (row-cols-md-4): recommand 카드 — #176 recommand와 동일(hero 이미지 `{title_domain}/upload/title/{title_id}/hero/hero_capsule.jpg?t=20251118`, game_view 링크, discount/price footer).
3. **프로모션 인기게임**: best 대형 4(row-cols-md-4 bg-dark) + 소형 나머지(row-cols-md-6 **bg-dark**) — #176 best와 동일 구조(순위 연속, option_gubun, 코드발송/프로모션/예약/특전, header 이미지). 소형은 #176(bg-card)과 달리 bg-dark.
4. **역대 최대할인** (h2, row-cols-md-4 g-4): 첫 칸 정적 이미지 `https://image.directg.net/h843N9Ie0v`(link #) + max_discount 카드(bg-dark h-100): header product_name+game_view링크 / body 이미지 **하드코딩 도메인** `https://image.directg.net/upload/title/{title_id}/header/{title_id}.jpg` / option_gubun / 코드발송·프로모션·예약·특전 / footer discount·price.
5. **추가 포인트 적립** (h2, 첫 칸 정적 이미지 `https://image.directg.net/Y88eupClXn` + add_repay 카드): #4 max_discount와 동일 구조. **legacy 버그**: footer 취소선이 `$max_dadd_repayiscount`(오타·미정의) → `number_format(null)=0` → **취소선 "0" 표시**(consumer_price 무시). 이식.
6. **5천원/1만원 미만 게임** (row, col-6씩): **가로형 카드**(row g-0, col-md-4 이미지 `{option_domain}/upload/product/{product_code}/header/header.jpg` + col-md-8 body). title / 코드발송·예약·특전(프로모션 뱃지 없음) / **한국어 뱃지**(음성 한국어=spoken_korean·인터페이스/자막 한글=interface_korean·독점 한국어=exclusive_korean) / discount 태그(`rounded-2 {label}` 커스텀 span, `.badge` 아님)·consumer_price 취소선·price.

### 파생 (legacy 뷰 로직, #176 계승)
- promotion_label = sale_price>0 → bg-danger, else bg-primary. discount/price = promo면 promotion.*, else option.*.
- option_gubun: basic=기본게임/edition=에디션 → game_type bundle이 번들로 덮음.
- view_url: game=product_id / dlc·bundle=sku (인기게임). 추천·최대할인·추가적립·가격대는 game_view(product_id=title_sku) 고정.

## API 계약 (백엔드 전달)
`entities/promotion` 확장.

- `GET /admin/promotion/promotion-season/:idx/view` → `PromotionSeasonView`
  - `{ idx, promotion_season_name, promotion_season_banner_pc, promotion_season_banner_link, recommand[], best[], max_discount[], add_repay[], price_5000[], price_10000[] }` (각 `SeasonViewGoods[]`).
  - `SeasonViewGoods` = #176 `WeekendViewGoods` 필드 + `spoken_korean`/`interface_korean`/`exclusive_korean`(가격대 카드 한국어 뱃지용).
  - 백엔드 resolve. 프론트가 화면 파생.

## 타겟 매핑
- 라우트: `routes/promotion/promotion_season_view.tsx` (validateSearch idx)
- 스크린: `screens/promotion-season-view/` (6섹션, 카드 컴포넌트)
- entities: `entities/promotion` 확장(`fetchPromotionSeasonView`/`usePromotionSeasonView` + `PromotionSeasonView`/`SeasonViewGoods`/`PromotionSeasonViewSearch`).
- mock: `handlers/promotion.ts` 확장 — GET /:idx/view. `PROMOTION_SEASON`의 6 카테고리 코드를 resolve 합성(한국어 플래그 포함).
- badge: 통일 `Badge` 사용(프로모션 badge 통일 결정). 단 가격대 discount 태그는 `.badge` 아닌 커스텀 span → 원형 유지.
- **#177 이름 링크 활성화**.

## 파리티 결정 사항 (게이트 확인 대상)
1. **add_repay 취소선 "0" 버그**(오타 변수) 이식.
2. **하드코딩 이미지**(배너 정적 promo 이미지 2종·max/add 카드 header 도메인) 유지, dev 미로드→fallback.
3. **통일 Badge**(option_gubun·태그·한국어 뱃지, 프로모션 badge 통일 계승). 가격대 discount 태그는 커스텀 span 유지.
4. **파생 로직**(#176 계승) 프론트 재현.
5. 인기 소형 bg-dark(#176 대비 차이) 등 섹션별 클래스 원문 유지.
6. mock resolve 합성(실제 title/price/korean은 백엔드).

## Parity 체크리스트
- [ ] h4=이름, 배너(banner_pc+link)
- [ ] DG 추천게임 4 / 인기게임 대4·소6(순위 연속)
- [ ] 역대 최대할인(정적 이미지+카드) / 추가 포인트 적립(정적 이미지+카드, 취소선 0 버그)
- [ ] 5천·1만원 미만 가로 카드(한국어 뱃지·discount 태그·취소선)
- [ ] 파생(promotion_label/price/discount/option_gubun/view_url) 일치
- [ ] #177 이름 링크 활성화
