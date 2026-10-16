# 모바일 예약구매 목록 game_preorder

## 원본 (legacy mobile)

- 파일: `mobile/game/game_preorder.html` (205줄). 더보기: `game_preorder_ajax.php`(POST {page}).
- 데이터: `getGoodsOptionPreOrderM($page,$add_where,$orderby,$param)` — where `release_date > 오늘`, orderby `release_date asc`. **타이틀 단위** 페이지네이션(total_results/total_pages/resultset).
- 각 타이틀: `getTitleGameList + getTitleEditionList + getTitleDLCList`(각 '1' 플래그) 병합 → 옵션 목록. 옵션별 `getPromotionGoodsPrice`로 할인 판정.
- **홈 `getPreorderGames`(평면 ProductThumb[])와 shape 다름** → 신규 중첩 계약. offcanvas 필터·로그인 가드 없음(공개).

## 화면·플로우

- 진입: `/game/game_preorder.html` (사이드바/홈 링크). page 빈값→1.
- 상단: `총: {total_results} 개` (offcanvas 필터 버튼은 legacy 주석처리 — 미이식).
- 목록: `.row.g-3#goods_list` > 타이틀별 `.col-12 > .card.product-card.mx-2`:
  - 타이틀 헤더 이미지 `{domain}/upload/title/{title_id}/header/{title_id}.jpg` (링크 `/game/game_view.html?product_id={sku}`)
  - `ul.listview.image-listview` > 옵션별 `li > a.item(game_view?product_id={sku}) > .in > div`: `header`(출시 예정일: {release_date}) + `p.font-16`(product_name) + `footer`(할인 badge `-{discount}%` / 정가 취소선 `₩ consumer_price` / 판매가 `₩ price`)
- 더보기: `btn_paging`(data-page/data-total) → POST ajax append, `total==page`면 alert "마지막페이지입니다".

## 데이터 / 계약 (신규)

- **신규 엔티티** `entities/preorder-list` — `getPreorderList(page)` + 중첩 타입:
  - `PreorderListResponse { list: PreorderTitle[]; page; totalPages; total }`
  - `PreorderTitle { title_id; sku; title_name; domain; release_date; options: PreorderOption[] }`
  - `PreorderOption { product_code; product_name; price; consumer_price; discount; is_promotion; promotion_label }`
- **신규 계약** `GET /api/game/preorder?page=N` (백엔드: getGoodsOptionPreOrderM + 타이틀별 옵션 병합 + 프로모션가 판정). MSW mock+fixture 추가.
- 재사용 없음(중첩 구조 전용).

## 타겟 매핑

- middleware MOBILE_ROUTES: `/game/game_preorder.html`
- 라우트: `app/m/game/game_preorder.html/page.tsx`(server, theme#000, title "예약 구매", getPreorderList(page))
- screen: `screens/mobile-game-preorder`
  - `MobileGamePreorderScreen`: `MobileSubHeader("예약 구매")` + `#appCapsuleSub.full-height` + `총: N 개` + `MobileGamePreorderItems`
  - `MobileGamePreorderItems`(client): `.row.g-3#goods_list` + 타이틀 카드(`MobilePreorderTitleCard`) 반복 + 더보기(footer 핸들러 재현) + 서버액션 `loadMorePreorder(nextPage)`
  - `MobilePreorderTitleCard`: 타이틀 헤더 이미지 + 옵션 listview (신규 카드, legacy 마크업 전사)
  - `api/load-more-preorder.ts`: `getPreorderList(nextPage)`
- 신규 UI: `MobilePreorderTitleCard`. mock: `game/preorder` 핸들러+fixture.

## Parity 체크리스트 (모바일 UA)

- [ ] `총: N 개` count
- [ ] 타이틀 헤더 이미지 + game_view 링크(product_id=sku)
- [ ] 옵션별 출시예정일·상품명·할인/정가/판매가
- [ ] 더보기 append + 마지막 alert
- [ ] head/viewport theme#000, title "예약 구매"
- [ ] middleware rewrite
- caveat: offcanvas 필터 버튼 legacy 주석처리(미이식), bottom_menu는 /m/layout 소유
