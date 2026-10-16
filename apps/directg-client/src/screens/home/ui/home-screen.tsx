import Script from "next/script";

import type { MainBanner } from "@entities/main-banner";
import type { Notice } from "@entities/notice";
import type { MainRecommand } from "@entities/main-recommand";
import type { BestTitle } from "@entities/best-title";
import type { ProductThumb } from "@entities/product-thumb";
import { MainBannerCarousel } from "@widgets/main-banner-carousel";
import { NoticeTicker } from "@widgets/notice-ticker";
import { RecommandSection } from "@widgets/recommand-section";
import { BestGameSection } from "@widgets/best-game-section";
import { NewGameSection } from "@widgets/new-game-section";
import { EventBannerSection } from "@widgets/event-banner-section";
import { PreorderSection } from "@widgets/preorder-section";
import { KoreanSupportSection } from "@widgets/korean-support-section";
import { FooterBannerSection } from "@widgets/footer-banner-section";
import { PublisherSection } from "@widgets/publisher-section";
import { PlatformSection } from "@widgets/platform-section";

interface HomeScreenProps {
  banners: MainBanner[];
  notices: Notice[];
  recommendations: MainRecommand[];
  bestTitles: BestTitle[];
  newGames: ProductThumb[];
  preorderGames: ProductThumb[];
  spokenKoreanGames: ProductThumb[];
  exclusiveKoreanGames: ProductThumb[];
}

/**
 * 메인 페이지 (legacy `pc/index.php` `<main>`).
 * 서브단위 2-1(배너/공지) + 2-2(추천·특집/인기게임/신규게임) + 2-3(이벤트/예약/한국어지원)
 * + 2-4(footer_banner/퍼블리셔/플랫폼). 메인 본문 섹션 이관 완료.
 *
 * Splide/main.css/card-list.css는 메인 페이지 전용 자산(legacy도 index.php head 전용).
 */
export function HomeScreen({
  banners,
  notices,
  recommendations,
  bestTitles,
  newGames,
  preorderGames,
  spokenKoreanGames,
  exclusiveKoreanGames,
}: HomeScreenProps) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css"
      />
      <link rel="stylesheet" href="/assets/css/page/main.css" />
      <link rel="stylesheet" href="/assets/css/card-list.css" />
      <link rel="stylesheet" href="/assets/css/page/main-inline.css" />
      <Script
        src="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js"
        strategy="afterInteractive"
      />
      <main>
        <MainBannerCarousel banners={banners} />
        <div className="b-example-divider"></div>
        <NoticeTicker notices={notices} />
        <FooterBannerSection />
        <div className="b-example-divider"></div>
        <RecommandSection recommendations={recommendations} />
        <BestGameSection titles={bestTitles} />
        <NewGameSection games={newGames} />
        <EventBannerSection />
        <PreorderSection games={preorderGames} />
        <PublisherSection />
        <KoreanSupportSection
          spokenGames={spokenKoreanGames}
          exclusiveGames={exclusiveKoreanGames}
        />
        <PlatformSection />
      </main>
    </>
  );
}
