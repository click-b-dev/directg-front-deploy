import type { MainBanner } from "@entities/main-banner";
import type { Notice } from "@entities/notice";
import type { MainRecommand } from "@entities/main-recommand";
import type { BestTitle } from "@entities/best-title";
import type { ProductThumb } from "@entities/product-thumb";
import { MobileAppSearch } from "@widgets/mobile-app-search";
import { MobileBestGameSection } from "@widgets/mobile-best-game-section";
import { MobileFooterBanner } from "@widgets/mobile-footer-banner";
import { MobileMainBannerCarousel } from "@widgets/mobile-main-banner-carousel";
import { MobileMainFooter } from "@widgets/mobile-main-footer";
import { MobileMainHeader } from "@widgets/mobile-main-header";
import { MobileNaverpayBanner } from "@widgets/mobile-naverpay-banner";
import { MobileNewGameSection } from "@widgets/mobile-new-game-section";
import { MobileNoticeTicker } from "@widgets/mobile-notice-ticker";
import { MobilePlanningBanner, isPlanningBannerOpen } from "@widgets/mobile-planning-banner";
import { MobilePreorderSection } from "@widgets/mobile-preorder-section";
import { MobilePublisherSection } from "@widgets/mobile-publisher-section";
import { MobileRecommandSection } from "@widgets/mobile-recommand-section";

interface MobileHomeScreenProps {
  banners: MainBanner[];
  notices: Notice[];
  recommands: MainRecommand[];
  bestTitles: BestTitle[];
  newGames: ProductThumb[];
  preorderGames: ProductThumb[];
}

/**
 * 모바일 메인 홈 (legacy `mobile/index.php`).
 * main_header + `#appCapsule`(본문) + main_footer(appCapsule 내부) + app_search offcanvas.
 * 본문 ① 상단 배너군 · ② 게임리스트군(추천·인기·신규) · ③ 하단군(네이버페이·예약구매·퍼블리셔) 이관 완료.
 * bottom_menu·sidebar·dialog는 layout이 소유.
 */
export function MobileHomeScreen({
  banners,
  notices,
  recommands,
  bestTitles,
  newGames,
  preorderGames,
}: MobileHomeScreenProps) {
  const showPlanningBanner = isPlanningBannerOpen(new Date());

  return (
    <>
      <MobileMainHeader />
      <div id="appCapsule" className="full-height">
        {showPlanningBanner && <MobilePlanningBanner />}
        <MobileMainBannerCarousel banners={banners} />
        <MobileNoticeTicker notices={notices} />
        <MobileFooterBanner />

        {/* ② 게임리스트군(추천및특집·인기게임·신규게임) */}
        <MobileRecommandSection recommands={recommands} />
        <MobileBestGameSection titles={bestTitles} />
        <MobileNewGameSection games={newGames} />

        {/* ③ 하단군(네이버페이 배너·예약구매·퍼블리셔) */}
        <MobileNaverpayBanner />
        <MobilePreorderSection games={preorderGames} />
        <MobilePublisherSection />

        <MobileMainFooter />
      </div>
      <MobileAppSearch />
    </>
  );
}
