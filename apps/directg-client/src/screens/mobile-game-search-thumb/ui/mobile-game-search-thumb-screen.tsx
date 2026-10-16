import type { GameListResponse } from "@entities/game-list";
import type { ProductFilterParams } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileGameSearchThumbList } from "./mobile-game-search-thumb-list";

interface MobileGameSearchThumbScreenProps {
  data: GameListResponse;
  filters: ProductFilterParams;
  /** legacy `"통합검색 - ".$q` (pageTitle·head title 공용). q 빈값 시 "통합검색 - ". */
  pageTitle: string;
}

/**
 * 모바일 통합검색 게임 목록 (legacy `mobile/game/game_search_thumb.html`). 공개 SSR page1 + "더보기" 증분.
 * 헤더(pageTitle="통합검색 - "+q) + appCapsuleSub + thumb 카드 목록.
 * 검색박스는 MobileSubHeader가 보유(action=/game/game_search_thumb.html). game_filter offcanvas는 후속 단위.
 */
export function MobileGameSearchThumbScreen({
  data,
  filters,
  pageTitle,
}: MobileGameSearchThumbScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle={pageTitle} />
      <div id="appCapsuleSub" className="full-height">
        {/* game_filter offcanvas — 후속 단위 */}
        <MobileGameSearchThumbList
          initialList={data.list}
          totalPages={data.totalPages}
          filters={filters}
        />
      </div>
    </>
  );
}
