# 모바일 홈 본문 ① 상단 배너군

> 모바일 홈(`mobile/index.php`) 본문 3서브단위 중 **①**(개발자 승인 2026-09-11). `#appCapsule` 상단:
> 기획배너(기간게이트) · main_banner 캐러셀 · 공지 티커 · footer_banner(기간게이트).
> ②게임리스트군(추천특집·인기·신규), ③하단군(예약·퍼블리셔·네이버페이)은 후속.

## 원본 (legacy mobile)
- `mobile/index.php` L141~296 (기획배너·main_banner·notice_section·footer_banner include)
- 데이터: `Main::getMainBanner()`(인자없음), `Main::getNoticeMain(3)`
- PC 대응: 서브단위 2-1(`main-banner-carousel`·`notice-ticker`) — `entities/main-banner`·`notice` 재사용

## 섹션별

### 1) 기획배너 고정형 (adbox)
- 기간게이트 `date('Y-m-d H:i:s') >= '2026-06-25 16:00:00' && < '2026-07-09 16:00:00'`(현재 만료).
- 마크업: `div.section > div.adbox.adbox-320-55.fixed > a[/promotion/promotion_season.html] > img(image.directg.net/x8a5Yy5gI7, alt 2026 여름 프로모션)` + `span.closebutton[data-bs-dismiss=modal] > ion-icon close-outline`.
- closebutton: base.js `.adbox .closebutton` 클릭 → 부모 `.adbox`에 `.hide` 추가(모달 아님). → client onClick 재현.
- 인라인 style(page): `.adbox.fixed{width:320px}`, `.adbox-320-55 img{320x55}` (앱셸 단위에서 이미 head 주입).

### 2) main_banner 캐러셀 (#main_banner, carousel-full splide)
- 데이터: `getMainBanners()` 재사용. **증분: `MainBannerOptionInfo.is_bonus`**(특전 badge, 현 계약 누락).
- 슬라이드 마크업: `li.splide__slide > div.card.product-card.rounded-0 > a[main_banner_link] > img[main_banner_mobile, class imaged w-100 rounded-0, alt "{product_name} 이미지"] + div.card-img-overlay.rounded-0.d-flex.align-items-end > (status_badge col-6 / status_price col-6)`.
- 파생(각 배너, option_info 있을 때):
  - consumer_price = `option_info.consumer_price ?? 0`
  - promotion.sale_price>0 → price=sale_price, promotion_label=`bg-danger`, is_promotion=Y / else price=`option_info.price`, promotion_label=`bg-cprimary`, is_promotion=N
  - discount = `round((consumer_price - price) * 100 / consumer_price)`
  - sales_status: is_preorder=Y → `badge bg-cwarning rounded-1`"예약구매" / else `badge bg-cprimary rounded-1`"절찬 판매중"
  - info_badge: is_bonus=Y → `badge bg-cinfo rounded-1`"특전"
  - promotion_badge: is_promotion=Y → `badge bg-cdanger rounded-1`"프로모션"
- status_badge: `show_prod_info=Y`일 때만 sales_status 출력 + (항상) promotion_badge + info_badge.
- status_price: `show_sale_info=Y`일 때만 → discount>0면 `badge {promotion_label} fw-bold num rounded-1 minus`"{discount} %" + (discount>0면) `s.num.mb-0.won` consumer_price + `span.fw-bold.num.text-white.won` price. (number_format = 천단위 콤마)
- splide init: `{type:'loop', perPage:1, perMove:1, pagination:false, arrows:false, drag:true, flickMaxPages:1, autoplay:true, interval:4000}` — grid extension은 perPage 1이라 무효과 → `useSplide`(CDN 4.1.4) 재사용.

### 3) 공지 티커 (#notice, splide ttb)
- 데이터: `getNotices(3)` 재사용(legacy getNoticeMain(3)).
- 마크업: `section#notice_section > div.container > div.col-12.border-primary.d-flex.border-1.border-solid.notice_div > (div.notice_icon.align-content-center > img[/mobile-assets/img/icon/mingcute_notification-fill.svg, class h-75]) + (div#notice.splide.h-100.text-truncate > splide__track > splide__list > li.splide__slide > div.splide__slide__container.news-item.align-content-center.text-truncate > a[/board/notice_view.html?idx={idx}] > span.notice_date{deploy_date.substr(0,10)} + span.notice_subject{subject})`.
- splide init: `{type:'loop', perPage:1, rewind:true, arrows:false, direction:'ttb', drag:true, dragMinThreshold:{mouse:0,touch:10}, wheel:true, releaseWheel:true, wheelSleep:100, height:'2rem', focus:'center', pagination:false, autoplay:true, interval:3000}` — `notice.mount()`(no extension). `useSplide` 재사용.

### 4) footer_banner (기획 고정배너2)
- legacy `inc/footer_banner.html`: 기간게이트 `>= '2026-06-12 00:00:00' && < '2026-07-12 23:00:00'`(현재 만료).
- 마크업: `div.mb-2#event_banner > div.wide-block.px-0 > a[/board/notice_view.html?idx=374] > img[image.directg.net/M89JgzGzbm, class img-fluid, alt "네이버페이 결제이벤트..."]`.
- PC `footer-banner-section`과 **img 다름**(모바일 M89JgzGzbm vs PC n89JgzGXIY) → 모바일 전용 위젯. `div.section` 래퍼(index.php L294) 포함.

## 데이터 (재사용/증분)
- 재사용: `entities/main-banner`(`getMainBanners`), `entities/notice`(`getNotices`).
- **증분**: `MainBannerOptionInfo.is_bonus?: string`('Y'|'N', 특전 badge). MSW `main-banners` fixture에 is_bonus 케이스 추가.
- Splide: CSS는 mobile `style.css`가 `@import`(이미 로드) → JS(CDN @4.1.4)만 홈 page에서 로드. `useSplide` 재사용.

## 타겟 매핑
- 라우트: `app/m/page.tsx` — `getMainBanners`+`getNotices(3)` SSR 로드 + Splide JS `<Script>` 추가 → `MobileHomeScreen`에 전달.
- screen: `screens/mobile-home` `#appCapsule` 상단에 배너군 조립(footer 앞, ②③ 자리 주석).
- widgets: `mobile-main-banner-carousel`(client, useSplide)·`mobile-notice-ticker`(client, useSplide)·`mobile-planning-banner`(client, closebutton)·`mobile-footer-banner`(server, 게이트).
- 자산: `mingcute_notification-fill.svg`(img/icon 기존재). 배너 img는 외부(image.directg.net).

## Parity 체크리스트 (모바일 UA)
- [ ] main_banner 캐러셀: 슬라이드/overlay(status_badge·status_price)·show_prod/sale_info 분기·discount·라벨색·loop autoplay 4s
- [ ] 공지 티커: 3건·날짜(0,10)·제목·링크·ttb autoplay 3s
- [ ] 기획배너/footer_banner: 기간게이트(현재 만료=미표시)·closebutton
- [ ] is_bonus 특전 badge
- [ ] appCapsule 순서(배너군 → [②③] → main_footer)
