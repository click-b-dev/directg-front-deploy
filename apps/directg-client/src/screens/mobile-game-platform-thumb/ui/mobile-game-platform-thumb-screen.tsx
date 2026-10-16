import type { GameListResponse } from "@entities/game-list";
import type { ProductFilterParams } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileGamePlatformThumbList } from "./mobile-game-platform-thumb-list";

interface MobileGamePlatformThumbScreenProps {
  data: GameListResponse;
  filters: ProductFilterParams;
  /** legacy `getPlatform(platform)` 결과 (pageTitle·head title 공용). 미정의 코드는 "". */
  pageTitle: string;
}

/**
 * 모바일 플랫폼별 게임 목록 (legacy `mobile/game/game_platform_thumb.html`). 공개 SSR page1 + "더보기" 증분.
 * 헤더(pageTitle=getPlatform(platform)) + appCapsuleSub + thumb 카드 목록.
 * game_filter offcanvas는 후속 단위(파일럿 game_thumb과 동일 범위).
 */
export function MobileGamePlatformThumbScreen({
  data,
  filters,
  pageTitle,
}: MobileGamePlatformThumbScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle={pageTitle} />
      <div id="appCapsuleSub" className="full-height">
        {/* game_filter offcanvas — 후속 단위 */}
        <MobileGamePlatformThumbList
          initialList={data.list}
          totalPages={data.totalPages}
          filters={filters}
        />
      </div>
    </>
  );
}
