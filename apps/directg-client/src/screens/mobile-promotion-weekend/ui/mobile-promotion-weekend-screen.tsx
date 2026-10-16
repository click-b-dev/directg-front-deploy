import type { EventItem } from "@entities/event";
import type { PromotionWeekendConfig, WeekendRecommandGame } from "@entities/promotion-weekend";
import type { ProductThumb } from "@entities/product-thumb";
import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobilePromotionEventSection } from "@widgets/mobile-promotion-event-section";

import { MobileWeekendAccessGuard } from "./mobile-weekend-access-guard";
import { MobileWeekendRecommandSection } from "./mobile-weekend-recommand-section";
import { MobileWeekendBestSection } from "./mobile-weekend-best-section";
import { MobileWeekendGamesSection } from "./mobile-weekend-games-section";

interface MobilePromotionWeekendScreenProps {
  config: PromotionWeekendConfig;
  recommand: WeekendRecommandGame[];
  best: ProductThumb[];
  events: EventItem[];
  games: ProductThumb[];
}

/**
 * 모바일 주말특가 프로모션 랜딩 — W-1~W-5 완성.
 * legacy `mobile/promotion/promotion_weekend.html`: 접근게이트+배너 / DG추천 / 인기게임 / 진행중이벤트 / 게임목록+하단배너.
 */
export function MobilePromotionWeekendScreen({
  config,
  recommand,
  best,
  events,
  games,
}: MobilePromotionWeekendScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle="주말특가 프로모션" />
      {!config.isActive && <MobileWeekendAccessGuard allowView={config.allowView} />}
      <div id="appCapsuleSub" className="full-height">
        <div className="section full mb-3">
          <div className="wide-block pt-1 px-2">
            <a href={config.bannerLink} title={config.name}>
              <img
                src="https://image.directg.net/m82AwckcqL"
                className="img-fluid"
                alt={config.name}
              />
            </a>
          </div>
        </div>
        <MobileWeekendRecommandSection list={recommand} />
        <MobileWeekendBestSection list={best} />
        <MobilePromotionEventSection events={events} />
        <MobileWeekendGamesSection list={games} />
      </div>
    </>
  );
}
