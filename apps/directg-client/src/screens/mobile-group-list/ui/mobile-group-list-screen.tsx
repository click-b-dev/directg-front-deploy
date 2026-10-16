import type { GroupResponse } from "@entities/game-group";
import type { ProductFilterParams } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobileGameFilter } from "@widgets/mobile-game-filter";
import { MobileGroupAccessGuard } from "@screens/mobile-group-thumb";

import { MobileGroupListItems } from "./mobile-group-list-items";

interface MobileGroupListScreenProps {
  data: GroupResponse;
  idx: string;
  filters: ProductFilterParams;
}

/**
 * 모바일 그룹/번들 list 목록 (legacy `mobile/game/group_list.html`).
 * group_thumb과 동형·카드만 `MobileListCard`. access 가드·배너·필터(aside 미설정=전체 블록) 동일.
 * legacy list 전용 base where `find_in_set(game_type,...)`는 백엔드 quirk(공유 계약 미표현, PC 동일 처리).
 */
export function MobileGroupListScreen({ data, idx, filters }: MobileGroupListScreenProps) {
  const { access, subject, banner, bannerDomain, list, totalPages, total } = data;

  if (access !== "ok") {
    return <MobileGroupAccessGuard access={access} />;
  }

  return (
    <>
      <MobileSubHeader pageTitle={subject} />
      <div id="appCapsuleSub" className="full-height">
        <MobileGameFilter aside={{}} total={total} viewBasePath="/game/group" pageType="list" />
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
        <MobileGroupListItems
          idx={idx}
          initialList={list}
          totalPages={totalPages}
          filters={filters}
        />
      </div>
    </>
  );
}
