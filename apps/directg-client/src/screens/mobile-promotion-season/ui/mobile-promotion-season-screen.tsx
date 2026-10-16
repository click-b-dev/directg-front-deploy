import type {
  PromotionSeasonConfig,
  SeasonBannerListResponse,
  SeasonPricesResponse,
} from "@entities/promotion-season";
import type { WeekendRecommandGame } from "@entities/promotion-weekend";
import type { ProductThumb } from "@entities/product-thumb";
import type { EventItem } from "@entities/event";
import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobilePromotionEventSection } from "@widgets/mobile-promotion-event-section";

import { MobileSeasonAccessGuard } from "./mobile-season-access-guard";
import { MobileSeasonRecommandSection } from "./mobile-season-recommand-section";
import { MobileSeasonBestSection } from "./mobile-season-best-section";
import { MobileSeasonCarouselSection } from "./mobile-season-carousel-section";
import { MobileSeasonGamesSection } from "./mobile-season-games-section";

interface MobilePromotionSeasonScreenProps {
  config: PromotionSeasonConfig;
  recommand: WeekendRecommandGame[];
  best: ProductThumb[];
  events: EventItem[];
  maxDiscount: SeasonBannerListResponse;
  addRepay: SeasonBannerListResponse;
  prices: SeasonPricesResponse;
  games: ProductThumb[];
}

/**
 * 모바일 시즌(대규모) 프로모션 랜딩 — S-1(기반)~S-8(게임목록+하단배너). **시즌 랜딩 완결**.
 * legacy `mobile/promotion/promotion_season.html`: 배너 + 추천 + 인기 + 진행중이벤트 + 역대최대할인 + 추가포인트 + 가격대 + 게임목록.
 */
export function MobilePromotionSeasonScreen({
  config,
  recommand,
  best,
  events,
  maxDiscount,
  addRepay,
  prices,
  games,
}: MobilePromotionSeasonScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle={config.name} />
      {!config.isActive && <MobileSeasonAccessGuard allowView={config.allowView} />}
      <div id="appCapsuleSub" className="full-height">
        {config.bannerMobile !== "#" && (
          <div className="section full">
            <div className="wide-block pt-1 px-2">
              <a href={config.bannerLink}>
                <img src={config.bannerMobile} className="img-fluid" alt={` ${config.name}`} />
              </a>
            </div>
          </div>
        )}
        <MobileSeasonRecommandSection list={recommand} />
        <MobileSeasonBestSection list={best} />
        <MobilePromotionEventSection events={events} />
        <MobileSeasonCarouselSection
          title="역대 최대할인"
          carouselId="promotion_max_discount"
          allViewLink={maxDiscount.bannerLink}
          list={maxDiscount.list}
        />
        <MobileSeasonCarouselSection
          title="추가 포인트 적립"
          carouselId="promotion_add_repay"
          allViewLink={addRepay.bannerLink}
          list={addRepay.list}
        />
        <MobileSeasonCarouselSection
          title="5천원 미만 게임"
          carouselId="promotion_price_5000"
          allViewLink="/promotion/promotion_ing_thumb?min_price=0&max_price=5000"
          list={prices.price5000}
        />
        <MobileSeasonCarouselSection
          title="1만원 미만 게임"
          carouselId="promotion_price_10000"
          allViewLink="/promotion/promotion_ing_thumb?min_price=5000&max_price=10000"
          list={prices.price10000}
        />
        <MobileSeasonGamesSection list={games} />
      </div>
    </>
  );
}
