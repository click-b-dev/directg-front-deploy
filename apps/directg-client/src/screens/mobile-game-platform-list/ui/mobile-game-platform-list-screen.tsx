import type { GameListResponse } from "@entities/game-list";
import type { ProductFilterParams } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobileGameFilter } from "@widgets/mobile-game-filter";

import { MobileGamePlatformListItems } from "./mobile-game-platform-list-items";

interface MobileGamePlatformListScreenProps {
  data: GameListResponse;
  filters: ProductFilterParams;
  /** legacy `getPlatform(platform)` 결과 (pageTitle·head title 공용). 미정의 코드는 "". */
  pageTitle: string;
}

/**
 * 모바일 플랫폼별 게임 목록 list 뷰 (legacy `mobile/game/game_platform_list.html`).
 * 공개 SSR page1 + "더보기" 증분 + `MobileGameFilter`(공용 offcanvas 필터).
 * game_list와 동형·카드만 `MobileListCard`. legacy `$aside['platform']="false"` → 필터 플랫폼 블록 숨김.
 */
export function MobileGamePlatformListScreen({
  data,
  filters,
  pageTitle,
}: MobileGamePlatformListScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle={pageTitle} />
      <div id="appCapsuleSub" className="full-height">
        <MobileGameFilter
          aside={{ platform: false }}
          total={data.total}
          viewBasePath="/game/game_platform"
          pageType="list"
        />
        <MobileGamePlatformListItems
          initialList={data.list}
          totalPages={data.totalPages}
          filters={filters}
        />
      </div>
    </>
  );
}
