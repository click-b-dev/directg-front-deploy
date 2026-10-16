import type { GamePublisherResponse } from "@entities/game-publisher";
import type { ProductFilterParams } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobileGameFilter } from "@widgets/mobile-game-filter";

import { MobileGamePublisherItems } from "./mobile-game-publisher-items";

interface MobileGamePublisherScreenProps {
  data: GamePublisherResponse;
  publisherCode: string;
  /** 뷰전환/필터 base (예: "/game/publisher_capcom"). */
  basePath: string;
  viewType: "thumb" | "list";
  filters: ProductFilterParams;
}

/**
 * 모바일 퍼블리셔별 목록 (legacy `mobile/game/publisher_<brand>_{thumb,list}.html`).
 * 공개 SSR page1 + "더보기" 증분 + `MobileGameFilter`(aside 미설정=전체 블록). title=publisherName 동적.
 * 15 브랜드 공용 — publisherCode/basePath/viewType만 다르다(factory 생성).
 */
export function MobileGamePublisherScreen({
  data,
  publisherCode,
  basePath,
  viewType,
  filters,
}: MobileGamePublisherScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle={data.publisherName} />
      <div id="appCapsuleSub" className="full-height">
        <MobileGameFilter
          aside={{}}
          total={data.total}
          viewBasePath={basePath}
          pageType={viewType}
        />
        <MobileGamePublisherItems
          publisherCode={publisherCode}
          viewType={viewType}
          initialList={data.list}
          totalPages={data.totalPages}
          filters={filters}
        />
      </div>
    </>
  );
}
