import type { GameSearchResponse } from "@entities/game-search";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileGameSearchSort } from "./mobile-game-search-sort";
import { MobileGameSearchItems } from "./mobile-game-search-items";

interface MobileGameSearchScreenProps {
  data: GameSearchResponse;
  /** legacy page_title(통합검색/자막·음성·독점 한국어지원). */
  pageTitle: string;
  q: string;
  sort: string;
}

const formatCount = (value: number) => value.toLocaleString("ko-KR");

/**
 * 모바일 통합검색 (legacy `mobile/game/game_search.html`).
 * 공개 SSR page1 + sort select(q+sort 리셋) + "더보기" 증분. offcanvas 필터/정렬은 legacy dead → 미이식.
 */
export function MobileGameSearchScreen({ data, pageTitle, q, sort }: MobileGameSearchScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle={pageTitle} />
      <div id="appCapsuleSub" className="full-height">
        <div className="section full">
          <div className="wide-block"></div>
        </div>
        <div className="section full">
          <div className="wide-block pt-1 pb-1 px-2">
            <div className="d-flex justify-content-between align-items-center">
              <span>총 {formatCount(data.total)} 개</span>
              <MobileGameSearchSort q={q} sort={sort} />
            </div>
          </div>
        </div>
        <MobileGameSearchItems
          initialList={data.list}
          totalPages={data.totalPages}
          q={q}
          sort={sort}
        />
      </div>
    </>
  );
}
