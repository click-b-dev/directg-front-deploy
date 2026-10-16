import type { GameListResponse } from "@entities/game-list";
import type { ProductFilterParams } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobileGameFilter } from "@widgets/mobile-game-filter";

import { MobileGameSearchListItems } from "./mobile-game-search-list-items";

interface MobileGameSearchListScreenProps {
  data: GameListResponse;
  filters: ProductFilterParams;
  /** legacy `"통합검색 - ".$q` (pageTitle·head title 공용). q 빈값 시 "통합검색 - ". */
  pageTitle: string;
}

/**
 * 모바일 통합검색 게임 목록 list 뷰 (legacy `mobile/game/game_search_list.html`).
 * 공개 SSR page1 + "더보기" 증분 + `MobileGameFilter`(공용 offcanvas 필터).
 * game_list와 동형·카드만 `MobileListCard`. legacy aside 미설정 → 필터 전체 블록 노출.
 * 검색박스는 MobileSubHeader가 보유.
 */
export function MobileGameSearchListScreen({
  data,
  filters,
  pageTitle,
}: MobileGameSearchListScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle={pageTitle} />
      <div id="appCapsuleSub" className="full-height">
        <MobileGameFilter
          aside={{}}
          total={data.total}
          viewBasePath="/game/game_search"
          pageType="list"
        />
        <MobileGameSearchListItems
          initialList={data.list}
          totalPages={data.totalPages}
          filters={filters}
        />
      </div>
    </>
  );
}
