import type { GameListResponse } from "@entities/game-list";
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

type ViewType = "thumb" | "list" | "grid";

interface GameListScreenProps {
  data: GameListResponse;
  /** legacy $page_type — thumb/list/grid 뷰. */
  viewType: ViewType;
}

/**
 * 전체 게임 목록 (legacy `pc/game/game_{thumb,list,grid}.html`). 공개 SSR.
 * category_code/genre_code/q 없는 최단순 목록 — filter/order/pagination + 뷰별 컨테이너·카드 분기.
 */
export function GameListScreen({ data, viewType }: GameListScreenProps) {
  const { list, page, totalPages, total } = data;

  return (
    <>
      {/* legacy header.html breadcrumb: 다이렉트 게임즈 > 게임 (page_title="게임" 텍스트, 링크 아님). */}
      <Breadcrumb items={[{ label: "게임" }]} />
      <div className="container my-3 pb-5">
        {/* legacy game 목록 카드 그리드 (home/board-dataroom 선례와 동일 로드) */}
        <link rel="stylesheet" href="/assets/css/card-list.css" />
        <main>
          <GameFilter aside={{ productType: true }} />
          <section id="content" className="content rounded-0">
            <GameFilterOrder total={total} basePath="/game/game" pageType={viewType} />
            <GameList viewType={viewType} list={list} />

            <div id="pagination" className="mt-4">
              <ServerPagination
                page={page}
                totalPages={totalPages}
                baseUrl={`/game/game_${viewType}.html`}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

/** 뷰별 카드 컨테이너 (legacy #thumb_list / #card_list>.row.g-3 / #grid_list). */
function GameList({ viewType, list }: { viewType: ViewType; list: ProductThumb[] }) {
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
