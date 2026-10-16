import type { GroupResponse } from "@entities/game-group";
import {
  ProductGridCard,
  ProductListCard,
  ProductThumbCard,
  type ProductThumb,
} from "@entities/product-thumb";
import { ServerPagination } from "@shared/ui/server-pagination";
import { Breadcrumb } from "@widgets/breadcrumb";
import { GameFilter } from "@widgets/game-filter";
import { GameFilterOrder } from "@widgets/game-filter-order";

import { GroupAccessGuard } from "./group-access-guard";

type ViewType = "thumb" | "list" | "grid";

interface GameGroupScreenProps {
  data: GroupResponse;
  /** 현재 group idx (페이지네이션 param 유지). */
  idx: string;
  /** legacy $page_type — thumb/list/grid 뷰. */
  viewType: ViewType;
}

/**
 * 번들/그룹 목록 (legacy `pc/game/group_{thumb,list,grid}.html`). 공개 SSR + 접근 가드.
 * access≠ok면 alert+redirect(가드), ok면 배너(조건부)+필터(promotion 숨김)+목록.
 */
export function GameGroupScreen({ data, idx, viewType }: GameGroupScreenProps) {
  const { access, subject, banner, bannerDomain, list, page, totalPages, total } = data;

  // legacy: msg() 후 exit — 본문 미렌더.
  if (access !== "ok") {
    return <GroupAccessGuard access={access} />;
  }

  return (
    <>
      {/* legacy header.html breadcrumb: 다이렉트 게임즈 > {subject} (page_title 텍스트). */}
      <Breadcrumb items={[{ label: subject }]} />
      <div className="container my-3 pb-5">
        <link rel="stylesheet" href="/assets/css/card-list.css" />
        {/* legacy: group_info.banner 있으면 #publisher_info 배너 */}
        {banner && (
          <section id="publisher_info" className="my-3">
            <div className="card shadow-none mb-3 border-0">
              <img
                src={`${bannerDomain}upload/banner/${banner}`}
                className="rounded-0"
                alt={subject}
              />
            </div>
          </section>
        )}
        <main>
          <GameFilter aside={{ productType: true, promotion: false }} />
          <section id="content" className="content rounded-0">
            <GameFilterOrder total={total} basePath="/game/group" pageType={viewType} />
            <GroupList viewType={viewType} list={list} />

            <div id="pagination" className="mt-4">
              <ServerPagination
                page={page}
                totalPages={totalPages}
                baseUrl={`/game/group_${viewType}.html`}
                params={{ idx }}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

/** 뷰별 카드 컨테이너 (legacy #thumb_list / #card_list>.row.g-3 / #grid_list). */
function GroupList({ viewType, list }: { viewType: ViewType; list: ProductThumb[] }) {
  if (viewType === "list") {
    return (
      <div id="card_list">
        <div className="row g-3">
          {list.map((product) => (
            <ProductListCard key={product.goods_sku} product={product} />
          ))}
        </div>
      </div>
    );
  }
  if (viewType === "grid") {
    return (
      <div id="grid_list">
        {list.map((product) => (
          <ProductGridCard key={product.goods_sku} product={product} />
        ))}
      </div>
    );
  }
  return (
    <div id="thumb_list">
      {list.map((product) => (
        <ProductThumbCard key={product.goods_sku} product={product} />
      ))}
    </div>
  );
}
