import type { GroupResponse } from "@entities/game-group";
import type { ProductFilterParams } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobileGameFilter } from "@widgets/mobile-game-filter";

import { MobileGroupAccessGuard } from "./mobile-group-access-guard";
import { MobileGroupThumbItems } from "./mobile-group-thumb-items";

interface MobileGroupThumbScreenProps {
  data: GroupResponse;
  idx: string;
  filters: ProductFilterParams;
}

/**
 * 모바일 그룹/번들 thumb 목록 (legacy `mobile/game/group_thumb.html`).
 * access≠ok → alert+`/` redirect(가드). ok → 배너(조건부 #publisher_info) + 필터(aside 미설정=전체 블록) + thumb 목록.
 * 공개 SSR page1 + "더보기" 증분. title=subject 동적.
 */
export function MobileGroupThumbScreen({ data, idx, filters }: MobileGroupThumbScreenProps) {
  const { access, subject, banner, bannerDomain, list, totalPages, total } = data;

  if (access !== "ok") {
    return <MobileGroupAccessGuard access={access} />;
  }

  return (
    <>
      <MobileSubHeader pageTitle={subject} />
      <div id="appCapsuleSub" className="full-height">
        <MobileGameFilter aside={{}} total={total} viewBasePath="/game/group" pageType="thumb" />
        {banner && (
          <div className="section full">
            <div className="wide-block pt-2 pb-2 px-0 mx-2">
              <div id="publisher_info">
                <img
                  src={`${bannerDomain}upload/banner/${banner}`}
                  className="w-100"
                  alt={subject}
                />
              </div>
            </div>
          </div>
        )}
        <MobileGroupThumbItems
          idx={idx}
          initialList={list}
          totalPages={totalPages}
          filters={filters}
        />
      </div>
    </>
  );
}
