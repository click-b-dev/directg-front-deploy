import type { PublisherLandingResponse } from "@entities/game-publisher-landing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import type { PublisherBrand } from "../lib/brands";
import { MobilePublisherLandingSort } from "./mobile-publisher-landing-sort";
import { MobilePublisherLandingItems } from "./mobile-publisher-landing-items";

interface MobilePublisherLandingScreenProps {
  brand: PublisherBrand;
  data: PublisherLandingResponse;
  sort: string;
}

const formatCount = (value: number) => value.toLocaleString("ko-KR");

/**
 * 모바일 퍼블리셔 랜딩 (legacy `mobile/game/publisher_<brand>.html`).
 * 배너(#publisher_info 외부링크) + `총: N 개` + sort select(sort만 리셋) + search 카드 목록 + 더보기.
 * offcanvas 필터는 legacy dead → 미이식. 카드는 game_search 카드 재사용.
 */
export function MobilePublisherLandingScreen({
  brand,
  data,
  sort,
}: MobilePublisherLandingScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle={brand.title} />
      <div id="appCapsuleSub" className="full-height">
        <div className="section full">
          <div className="wide-block pt-2 pb-2 px-0 mx-2">
            <div id="publisher_info">
              <a href={brand.bannerLink} target="_blank" rel="noreferrer">
                <img src={brand.bannerImage} alt={brand.bannerAlt} className="w-100 rounded-0" />
              </a>
            </div>
          </div>
        </div>

        <div className="section full">
          <div className="wide-block pt-1 pb-1 px-2">
            <div className="d-flex justify-content-between align-items-center">
              <span>총: {formatCount(data.total)} 개</span>
              <MobilePublisherLandingSort basePath={brand.basePath} sort={sort} />
            </div>
          </div>
        </div>

        <MobilePublisherLandingItems
          publisherCode={brand.publisherCode}
          initialList={data.list}
          totalPages={data.totalPages}
          sort={sort}
        />
      </div>
    </>
  );
}
